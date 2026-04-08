import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { INotificationsRepository } from '../domain/notifications.repository.interface';

@Injectable()
export class MarkNotificationAsReadUseCase {
  constructor(
    private readonly notificationsRepository: INotificationsRepository,
  ) {}

  async execute(notificationId: string, userId: string) {
    const notification =
      await this.notificationsRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'You can only mark your own notifications as read',
      );
    }

    await this.notificationsRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepository.markAllAsRead(userId);
  }
}
