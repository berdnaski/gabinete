import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { StorageService } from './domain/services/storage.service';
import { CloudflareStorageService } from './infrastructure/services/cloudflare-storage.service';
import { MailModule } from './mail/mail.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { DiscordService } from './infrastructure/services/discord.service';
import { AuditLogInterceptor } from './infrastructure/interceptors/audit-log.interceptor';

@Global()
@Module({
  imports: [MailModule, QueueModule],
  providers: [
    {
      provide: StorageService,
      useClass: CloudflareStorageService,
    },
    DiscordService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
  exports: [StorageService, MailModule, QueueModule, DiscordService],
})
export class SharedModule { }
