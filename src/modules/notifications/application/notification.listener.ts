import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';
import { SendNotificationUseCase } from './send-notification.use-case';

@Injectable()
export class NotificationListener {
  constructor(private readonly sendNotification: SendNotificationUseCase) {}

  @OnEvent('demand.status-changed')
  async handleDemandStatusChanged(payload: {
    userId: string;
    demandId: string;
    title: string;
    newStatus: string;
  }) {
    await this.sendNotification.execute({
      userId: payload.userId,
      title: 'Status da Demanda Atualizado',
      message: `A demanda "${payload.title}" mudou para o status: ${payload.newStatus}.`,
      type: NotificationType.INFO,
    });
  }

  @OnEvent('demand.comment-added')
  async handleDemandCommentAdded(payload: {
    userId: string;
    authorName: string;
    demandTitle: string;
  }) {
    await this.sendNotification.execute({
      userId: payload.userId,
      title: 'Novo Comentário',
      message: `${payload.authorName} comentou na sua demanda "${payload.demandTitle}".`,
      type: NotificationType.INFO,
    });
  }

  @OnEvent('demand.resolved')
  async handleDemandResolved(payload: {
    userId: string;
    demandTitle: string;
    cabinetName: string;
  }) {
    await this.sendNotification.execute({
      userId: payload.userId,
      title: 'Demanda Resolvida!',
      message: `A demanda "${payload.demandTitle}" foi marcada como resolvida pelo gabinete ${payload.cabinetName}.`,
      type: NotificationType.SUCCESS,
    });
  }
}
