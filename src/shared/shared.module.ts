import { Global, Module } from '@nestjs/common';
import { StorageService } from './domain/services/storage.service';
import { CloudflareStorageService } from './infrastructure/services/cloudflare-storage.service';
import { MailModule } from './mail/mail.module';
import { QueueModule } from './infrastructure/queue/queue.module';

@Global()
@Module({
  imports: [MailModule, QueueModule],
  providers: [
    {
      provide: StorageService,
      useClass: CloudflareStorageService,
    },
  ],
  exports: [StorageService, MailModule, QueueModule],
})
export class SharedModule {}
