import { NotificationEntity } from './notification.entity';
import { NotificationType } from '@prisma/client';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/domain/pagination.interface';

export interface CreateNotificationInfo {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

export abstract class INotificationsRepository {
  abstract create(data: CreateNotificationInfo): Promise<NotificationEntity>;
  abstract findById(id: string): Promise<NotificationEntity | null>;
  abstract findAllByUser(
    userId: string,
    params: PaginationParams & { unreadOnly?: boolean },
  ): Promise<PaginatedResult<NotificationEntity>>;
  abstract markAsRead(id: string): Promise<void>;
  abstract markAllAsRead(userId: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
