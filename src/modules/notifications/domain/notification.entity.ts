import { NotificationType } from '@prisma/client';

export class NotificationEntity {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  userId: string;
  readAt: Date | null;
  createdAt: Date;
}
