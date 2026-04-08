import { Global, Module } from '@nestjs/common';
import { StorageService } from './domain/services/storage.service';
import { CloudflareStorageService } from './infrastructure/services/cloudflare-storage.service';
import { MailModule } from './mail/mail.module';

@Global()
@Module({
  imports: [MailModule],
  providers: [
    {
      provide: StorageService,
      useClass: CloudflareStorageService,
    },
  ],
  exports: [StorageService, MailModule],
})
export class SharedModule {}
