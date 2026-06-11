import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DiscordService } from '../infrastructure/services/discord.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly discordService: DiscordService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<
      Request & { user?: { id: string; role?: string } }
    >();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            message:
              exception instanceof Error
                ? exception.message
                : 'Internal server error',
          };

    let message = 'Internal server error';
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const msg = (exceptionResponse as Record<string, unknown>).message;
      if (typeof msg === 'string') {
        message = msg;
      } else if (Array.isArray(msg)) {
        message = (msg as string[]).join(', ');
      }
    }

    this.logger.error(
      `${status} ${request.method} ${request.url}`,
      exception instanceof Error
        ? exception.stack
        : JSON.stringify(exception),
    );

    // Send all errors except 401 (unauthenticated requests are normal traffic, not bugs)
    if (status >= 400 && status !== 401) {
      const ip = (
        request.ip ||
        (Array.isArray(request.headers['x-forwarded-for'])
          ? request.headers['x-forwarded-for'][0]
          : request.headers['x-forwarded-for'])
      )?.toString();

      try {
        await this.discordService.sendError(
          this.normalizeError(exception, message),
          {
            method: request.method,
            url: request.url,
            statusCode: status,
            userId: request.user?.id,
            userRole: request.user?.role,
            ip,
            userAgent: request.headers['user-agent']?.toString(),
            body: request.body as unknown,
            query: request.query,
          },
        );
      } catch (err) {
        this.logger.error(
          'Failed to send error to Discord',
          err instanceof Error ? err.stack : String(err),
        );
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private normalizeError(exception: unknown, humanMessage: string): Error {
    if (!(exception instanceof Error)) {
      const err = new Error(humanMessage);
      err.name = 'UnknownError';
      return err;
    }
  
    if (exception.message === humanMessage) return exception;
    const normalized = new Error(humanMessage);
    normalized.name = exception.constructor.name;
    normalized.stack = exception.stack;
    return normalized;
  }
}
