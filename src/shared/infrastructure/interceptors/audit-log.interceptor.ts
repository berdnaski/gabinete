import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DiscordService } from '../services/discord.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly discordService: DiscordService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<
      Request & { user?: { id: string } }
    >();
    const method = request.method;
    const url = request.url;
    const body = request.body as unknown;

    if (method === 'GET') {
      return next.handle();
    }

    if (typeof url === 'string' && url.includes('debug')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const response = httpContext.getResponse<Response>();
          const statusCode = response.statusCode;

          if (statusCode >= 200 && statusCode < 300) {
            void this.logToDiscord(request, statusCode, body);
          }
        },
      }),
    );
  }

  private async logToDiscord(
    request: Request & { user?: { id: string } },
    status: number,
    body: unknown,
  ) {
    try {
      const action = this.mapMethodToAction(request.method, request.url);

      await this.discordService.sendAudit({
        action,
        details: `Operação realizada com sucesso via API`,
        method: request.method,
        url: request.url,
        userId: request.user?.id,
        status,
        payload: body,
      });
    } catch (err) {
      this.logger.error(
        'Failed to send audit log to Discord',
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  private mapMethodToAction(method: string, url: string): string {
    const isInvite = url.includes('invites');
    const isCabinet = url.includes('cabinets');
    const isMember = url.includes('members');

    if (method === 'POST') {
      if (isInvite) return 'Novo Membro Convidado';
      if (isCabinet) return 'Gabinete Criado';
      return 'Novo Recurso Criado';
    }
    if (method === 'PATCH' || method === 'PUT') {
      if (isMember) return 'Cargo de Membro Atualizado';
      return 'Recurso Atualizado';
    }
    if (method === 'DELETE') {
      if (isInvite) return 'Convite Cancelado';
      if (isMember) return 'Membro Removido';
      return 'Recurso Excluído';
    }

    return 'Ação no Sistema';
  }
}
