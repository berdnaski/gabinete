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
    const request = ctx.getRequest<Request & { user?: { id: string } }>();

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
      }
    }

    if (status === (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );

      try {
        await this.discordService.sendError(
          exception instanceof Error ? exception : new Error(String(exception)),
          {
            method: request.method,
            url: request.url,
            userId: request.user?.id,
            ip: (
              request.ip ||
              (Array.isArray(request.headers['x-forwarded-for'])
                ? request.headers['x-forwarded-for'][0]
                : request.headers['x-forwarded-for'])
            )?.toString(),
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
      message: typeof message === 'string' ? message : 'Internal server error',
    });
  }
}
