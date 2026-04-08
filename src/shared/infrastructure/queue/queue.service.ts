import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobName, QueueName } from './queue.constants';
import { SendEmailJobData } from './processors/default.processor';

@Injectable()
export class QueueService {
  constructor(@InjectQueue(QueueName.DEFAULT) private readonly queue: Queue) {}

  async sendEmail(data: SendEmailJobData) {
    await this.queue.add(JobName.SEND_EMAIL, data);
  }

  async cleanupExpiredTokens() {
    await this.queue.add(JobName.CLEANUP_EXPIRED_TOKENS, {});
  }
}
