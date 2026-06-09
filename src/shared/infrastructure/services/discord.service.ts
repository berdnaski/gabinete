import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  timestamp?: string;
  footer?: { text: string; icon_url?: string };
  thumbnail?: { url: string };
  author?: { name: string; icon_url?: string };
}

export interface HttpErrorContext {
  method: string;
  url: string;
  statusCode: number;
  userId?: string;
  userRole?: string;
  ip?: string;
  userAgent?: string;
  body?: unknown;
  query?: unknown;
}

export interface JobErrorContext {
  jobName: string;
  jobId?: string | number;
  attempt?: number;
  jobData?: unknown;
}

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  private readonly webhookUrl: string | undefined;

  private static readonly COLORS = {
    ERROR_SERVER: 0xe74c3c,
    ERROR_CLIENT: 0xe67e22,
    ERROR_JOB: 0x9b59b6,
  };

  private static readonly ASSETS = {
    ERROR_ICON: 'https://cdn-icons-png.flaticon.com/512/595/595067.png',
    BOT_AVATAR: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png',
  };

  constructor(private readonly configService: ConfigService) {
    this.webhookUrl = this.configService.get<string>('DISCORD_WEBHOOK_URL');

    if (!this.webhookUrl) {
      this.logger.warn(
        'DISCORD_WEBHOOK_URL is not defined. Discord logging will be disabled.',
      );
    }
  }

  async sendError(error: Error, context: HttpErrorContext): Promise<void> {
    if (!this.webhookUrl) return;

    const statusText = this.httpStatusText(context.statusCode);
    const color =
      context.statusCode >= 500
        ? DiscordService.COLORS.ERROR_SERVER
        : DiscordService.COLORS.ERROR_CLIENT;

    const fields: DiscordEmbedField[] = [
      {
        name: '🌐 Endpoint',
        value: `\`${context.method} ${context.url}\``,
        inline: true,
      },
      {
        name: '🚦 Status',
        value: `\`${context.statusCode} ${statusText}\``,
        inline: true,
      },
      {
        name: '👤 User',
        value: context.userId
          ? `\`${context.userId}${context.userRole ? ` • ${context.userRole}` : ''}\``
          : '`Guest`',
        inline: true,
      },
      {
        name: '📍 IP Address',
        value: `\`${context.ip ?? 'Unknown'}\``,
        inline: true,
      },
      {
        name: '🖥️ User-Agent',
        value: context.userAgent
          ? `\`${context.userAgent.slice(0, 100)}\``
          : '`Unknown`',
        inline: true,
      },
    ];

    const sanitizedBody = this.sanitize(context.body);
    if (this.hasContent(sanitizedBody)) {
      fields.push({
        name: '📦 Request Body',
        value: `\`\`\`json\n${JSON.stringify(sanitizedBody, null, 2).slice(0, 980)}\n\`\`\``,
      });
    }

    const sanitizedQuery = this.sanitize(context.query);
    if (this.hasContent(sanitizedQuery)) {
      fields.push({
        name: '🔍 Query Params',
        value: `\`\`\`json\n${JSON.stringify(sanitizedQuery, null, 2).slice(0, 980)}\n\`\`\``,
      });
    }

    this.appendStackTrace(fields, error.stack);

    const embed: DiscordEmbed = {
      author: {
        name: `🚨 ${context.statusCode} ${statusText} — HTTP Error`,
        icon_url: DiscordService.ASSETS.ERROR_ICON,
      },
      title: `❌ ${error.name || 'Error'}`,
      description: `\`\`\`\n${error.message}\n\`\`\``,
      color,
      fields,
      timestamp: new Date().toISOString(),
      footer: { text: 'Gabinete API • Error Monitor' },
      thumbnail: { url: DiscordService.ASSETS.ERROR_ICON },
    };

    await this.postToDiscord({ embeds: [embed] });
  }

  async sendJobError(error: Error, context: JobErrorContext): Promise<void> {
    if (!this.webhookUrl) return;

    const fields: DiscordEmbedField[] = [
      { name: '📋 Job Name', value: `\`${context.jobName}\``, inline: true },
      {
        name: '🆔 Job ID',
        value: context.jobId !== undefined ? `\`${context.jobId}\`` : '`—`',
        inline: true,
      },
      {
        name: '🔁 Attempt',
        value: context.attempt !== undefined ? `\`#${context.attempt}\`` : '`—`',
        inline: true,
      },
    ];

    const sanitizedData = this.sanitize(context.jobData);
    if (this.hasContent(sanitizedData)) {
      fields.push({
        name: '📦 Job Data',
        value: `\`\`\`json\n${JSON.stringify(sanitizedData, null, 2).slice(0, 980)}\n\`\`\``,
      });
    }

    this.appendStackTrace(fields, error.stack);

    const embed: DiscordEmbed = {
      author: {
        name: '🔧 BullMQ Job Failure — Queue Monitor',
        icon_url: DiscordService.ASSETS.ERROR_ICON,
      },
      title: `❌ ${error.name || 'Error'}`,
      description: `\`\`\`\n${error.message}\n\`\`\``,
      color: DiscordService.COLORS.ERROR_JOB,
      fields,
      timestamp: new Date().toISOString(),
      footer: { text: 'Gabinete Queue • Error Monitor' },
      thumbnail: { url: DiscordService.ASSETS.ERROR_ICON },
    };

    await this.postToDiscord({ embeds: [embed] });
  }

  private appendStackTrace(fields: DiscordEmbedField[], stack?: string): void {
    if (!stack) {
      fields.push({
        name: '🛠️ Stack Trace',
        value: '`No stack trace available`',
      });
      return;
    }
    const chunks = this.chunkString(stack, 950);
    chunks.forEach((chunk, i) => {
      fields.push({
        name: i === 0 ? '🛠️ Stack Trace' : '🛠️ Stack Trace (cont.)',
        value: `\`\`\`ts\n${chunk}\n\`\`\``,
      });
    });
  }

  private hasContent(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value as object).length > 0;
    return Boolean(value);
  }

  private httpStatusText(code: number): string {
    const texts: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      402: 'Payment Required',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      406: 'Not Acceptable',
      408: 'Request Timeout',
      409: 'Conflict',
      410: 'Gone',
      415: 'Unsupported Media Type',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      501: 'Not Implemented',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };
    return texts[code] ?? 'Unknown';
  }

  private chunkString(str: string, size: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < str.length; i += size) {
      chunks.push(str.slice(i, i + size));
    }
    return chunks;
  }

  private sanitize(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map((item) => this.sanitize(item));
    if (typeof obj !== 'object') return obj;

    const sensitiveKeys = ['password', 'token', 'secret', 'client_secret', 'key'];
    const sanitized = { ...(obj as Record<string, unknown>) };

    for (const key of Object.keys(sanitized)) {
      const val = sanitized[key];
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        sanitized[key] = '********';
      } else if (val !== null && typeof val === 'object') {
        sanitized[key] = this.sanitize(val);
      }
    }
    return sanitized;
  }

  private async postToDiscord(payload: Record<string, unknown>) {
    if (!this.webhookUrl) return;
    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Gabinete Watchdog',
          avatar_url: DiscordService.ASSETS.BOT_AVATAR,
          ...payload,
        }),
      });
    } catch (err) {
      this.logger.error(
        'Failed to post to Discord',
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
