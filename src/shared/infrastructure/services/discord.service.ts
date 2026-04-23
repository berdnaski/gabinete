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

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  private readonly webhookUrl: string | undefined;

  private static readonly COLORS = {
    ERROR: 0xe74c3c,
    SUCCESS: 0x2ecc71,
    INFO: 0x3498db,
    WARNING: 0xf1c40f,
    AUDIT: 0x95a5a6,
  };

  private static readonly ASSETS = {
    ERROR_ICON: 'https://cdn-icons-png.flaticon.com/512/595/595067.png',
    AUDIT_ICON: 'https://cdn-icons-png.flaticon.com/512/1063/1063376.png',
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

  async sendError(
    error: Error,
    context: { method: string; url: string; userId?: string; ip?: string },
  ) {
    if (!this.webhookUrl) return;

    const stackTrace = error.stack
      ? `\`\`\`ts\n${error.stack.slice(0, 1000)}${error.stack.length > 1000 ? '...' : ''}\n\`\`\``
      : '`No stack trace available`';

    const embed: DiscordEmbed = {
      author: {
        name: 'System Monitor | Critical Error',
        icon_url: DiscordService.ASSETS.ERROR_ICON,
      },
      title: `❌ ${error.name || 'Internal Server Error'}`,
      description: `**Message:** ${error.message}`,
      color: DiscordService.COLORS.ERROR,
      fields: [
        {
          name: '🌐 Route',
          value: `\`${context.method} ${context.url}\``,
          inline: true,
        },
        {
          name: '👤 User',
          value: context.userId ? `\`${context.userId}\`` : '`Guest`',
          inline: true,
        },
        {
          name: '📍 Source IP',
          value: `\`${context.ip || 'Unknown'}\``,
          inline: true,
        },
        { name: '🛠️ Stack Trace', value: stackTrace },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: `Gabinete API • Critical Monitoring` },
      thumbnail: { url: DiscordService.ASSETS.ERROR_ICON },
    };

    await this.postToDiscord({ embeds: [embed] });
  }

  async sendAudit(data: {
    action: string;
    details: string;
    method: string;
    url: string;
    userId?: string;
    status: number;
    payload?: unknown;
  }) {
    if (!this.webhookUrl) return;

    const sanitizedPayload = this.sanitize(data.payload);
    const payloadStr = sanitizedPayload
      ? `\`\`\`json\n${JSON.stringify(sanitizedPayload, null, 2).slice(0, 500)}\n\`\`\``
      : '`No payload content`';

    const embed: DiscordEmbed = {
      author: {
        name: 'System Audit | Action Log',
        icon_url: DiscordService.ASSETS.AUDIT_ICON,
      },
      title: `✨ ${data.action}`,
      description: data.details,
      color: DiscordService.COLORS.AUDIT,
      fields: [
        {
          name: '🌐 Request',
          value: `\`${data.method} ${data.url}\``,
          inline: true,
        },
        { name: '🚥 Status', value: `\`${data.status}\``, inline: true },
        {
          name: '👤 User',
          value: data.userId ? `\`${data.userId}\`` : '`System`',
          inline: true,
        },
        { name: '📦 Data Summary', value: payloadStr },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'Gabinete Audit Trail' },
    };

    await this.postToDiscord({ embeds: [embed] });
  }

  private sanitize(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') return obj;
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'client_secret',
      'key',
    ];

    const sanitized = { ...(obj as Record<string, unknown>) };

    for (const key of Object.keys(sanitized)) {
      const val = sanitized[key];
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        sanitized[key] = '********';
      } else if (val && typeof val === 'object') {
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
