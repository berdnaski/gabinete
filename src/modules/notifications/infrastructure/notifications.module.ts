import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { INotificationsRepository } from '../domain/notifications.repository.interface';
import { PrismaNotificationsRepository } from './prisma-notifications.repository';
import { SendNotificationUseCase } from '../application/send-notification.use-case';
import { ListNotificationsUseCase } from '../application/list-notifications.use-case';
import { MarkNotificationAsReadUseCase } from '../application/mark-notification-as-read.use-case';
import { NotificationListener } from '../application/notification.listener';
import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../../users/infrastructure/users.module';
import { CabinetsModule } from '../../cabinets/infrastructure/cabinets.module';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [DatabaseModule, UsersModule, CabinetsModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsGateway,
    {
      provide: INotificationsRepository,
      useClass: PrismaNotificationsRepository,
    },
    SendNotificationUseCase,
    ListNotificationsUseCase,
    MarkNotificationAsReadUseCase,
    NotificationListener,
  ],
  exports: [SendNotificationUseCase],
})
export class NotificationsModule {}
