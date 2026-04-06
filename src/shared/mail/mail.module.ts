import { Global, Module } from '@nestjs/common';
import { MailService } from './application/mail.service';
import { ResendMailService } from './infrastructure/resend-mail.service';

@Global()
@Module({
  providers: [
    {
      provide: MailService,
      useClass: ResendMailService,
    },
  ],
  exports: [MailService],
})
export class MailModule {}
