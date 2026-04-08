import { Injectable } from '@nestjs/common';
import {
  CreateNotificationInfo,
  INotificationsRepository,
} from '../domain/notifications.repository.interface';
import { NotificationsGateway } from '../infrastructure/notifications.gateway';

@Injectable()
export class SendNotificationUseCase {
  constructor(
    private readonly notificationsRepository: INotificationsRepository,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async execute(data: CreateNotificationInfo) {
    const notification = await this.notificationsRepository.create(data);

    this.notificationsGateway.sendToUser(data.userId, notification);

    return notification;
  }
}
