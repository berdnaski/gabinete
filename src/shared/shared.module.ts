import { Global, Module } from '@nestjs/common';
import { StorageService } from './domain/services/storage.service';
import { CloudflareStorageService } from './infrastructure/services/cloudflare-storage.service';

@Global()
@Module({
  providers: [
    {
      provide: StorageService,
      useClass: CloudflareStorageService,
    },
  ],
  exports: [StorageService],
})
export class SharedModule {}
