import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import {
  JobName,
  QueueName,
  CronExpression,
  EmailType,
} from '../queue.constants';
import { MailService } from '../../../mail/application/mail.service';
import { PrismaService } from '../../../../modules/database/prisma.service';
import { DiscordService } from '../../services/discord.service';

export interface SendEmailJobData {
  type: EmailType;
  email: string;
  token: string;
  cabinetName?: string;
  senderName?: string;
}

@Injectable()
@Processor(QueueName.DEFAULT)
export class DefaultProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(DefaultProcessor.name);

  constructor(
    @InjectQueue(QueueName.DEFAULT) private readonly queue: Queue,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
    private readonly discordService: DiscordService,
  ) {
    super();
  }

  async onModuleInit() {
    await this.queue.add(
      JobName.CLEANUP_EXPIRED_TOKENS,
      {},
      {
        repeat: { pattern: CronExpression.EVERY_DAY_AT_3AM },
        jobId: 'cleanup-expired-tokens-cron',
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async process(job: Job): Promise<void> {
    try {
      this.logger.log(`Processing job: ${job.name} [id=${job.id}]`);

      switch (job.name as JobName) {
        case JobName.SEND_EMAIL: {
          const data = job.data as SendEmailJobData;
          if (data.type === EmailType.VERIFICATION) {
            await this.mailService.sendVerificationEmail(
              data.email,
              data.token,
            );
          } else if (data.type === EmailType.PASSWORD_RESET) {
            await this.mailService.sendPasswordResetEmail(
              data.email,
              data.token,
            );
          } else if (data.type === EmailType.PASSWORD_CHANGE) {
            await this.mailService.sendPasswordChangeConfirmationEmail(
              data.email,
              data.token,
            );
          } else if (data.type === EmailType.CABINET_INVITATION) {
            await this.mailService.sendCabinetInvitation(
              data.email,
              data.token,
              data.cabinetName ?? 'Gabinete',
              data.senderName ?? 'Um administrador',
            );
          }
          break;
        }

        case JobName.CLEANUP_EXPIRED_TOKENS: {
          const { count } = await this.prisma.token.deleteMany({
            where: { expiresAt: { lt: new Date() } },
          });
          if (count > 0) {
            this.logger.log(`Removed ${count} expired tokens`);
          }
          break;
        }

        default:
          this.logger.warn(`No handler for job: ${job.name}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(`Job failed: ${job.name} [id=${job.id}]`, error.stack);

      await this.discordService.sendError(error, {
        method: 'BULLMQ_JOB',
        url: job.name,
        userId: 'system',
      });

      throw error;
    }
  }
}
