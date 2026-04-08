import { NotificationType } from '@prisma/client';

export class NotificationEntity {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  userId: string;
  readAt: Date | null;
  createdAt: Date;
}
