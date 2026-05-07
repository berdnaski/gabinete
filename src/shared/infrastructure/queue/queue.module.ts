import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { QueueName } from './queue.constants';
import { DefaultProcessor } from './processors/default.processor';
import { QueueService } from './queue.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const port = config.getOrThrow<number>('REDIS_PORT');
        const host = config.getOrThrow<string>('REDIS_HOST');
        const isLocal = host === 'localhost' || host === '127.0.0.1';
        const isTls = !isLocal && config.get<string>('REDIS_TLS') !== 'false';
        return {
          connection: {
            host,
            port,
            password: config.get<string>('REDIS_PASSWORD') || undefined,
            ...(isTls && { tls: {} }),
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: QueueName.DEFAULT,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 100 },
      },
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: QueueName.DEFAULT,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [DefaultProcessor, QueueService],
  exports: [BullModule, QueueService],
})
export class QueueModule {}
