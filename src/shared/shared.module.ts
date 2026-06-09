import { Global, Module } from '@nestjs/common';
import { StorageService } from './domain/services/storage.service';
import { CloudflareStorageService } from './infrastructure/services/cloudflare-storage.service';
import { MailModule } from './mail/mail.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { DiscordService } from './infrastructure/services/discord.service';

@Global()
@Module({
  imports: [MailModule, QueueModule],
  providers: [
    {
      provide: StorageService,
      useClass: CloudflareStorageService,
    },
    DiscordService,
  ],
  exports: [StorageService, MailModule, QueueModule, DiscordService],
})
export class SharedModule {}
