import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/database/prisma.service';
import { NotificationEntity } from '../domain/notification.entity';
import {
  CreateNotificationInfo,
  INotificationsRepository,
} from '../domain/notifications.repository.interface';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/domain/pagination.interface';

@Injectable()
export class NotificationsRepository implements INotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotificationInfo): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link ?? null,
      },
    });

    return notification;
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    return notification;
  }

  async findAllByUser(
    userId: string,
    params: PaginationParams & { unreadOnly?: boolean },
  ): Promise<PaginatedResult<NotificationEntity>> {
    const { page = 1, limit = 10, unreadOnly } = params;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(unreadOnly ? { readAt: null } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { items, total };
  }

  async markAsRead(id: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id },
    });
  }
}
