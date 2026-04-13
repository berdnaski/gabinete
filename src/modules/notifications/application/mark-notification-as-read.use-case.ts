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
      throw new NotFoundException('Notificação não encontrada');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'Você só pode marcar suas próprias notificações como lidas',
      );
    }

    await this.notificationsRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepository.markAllAsRead(userId);
  }
}
