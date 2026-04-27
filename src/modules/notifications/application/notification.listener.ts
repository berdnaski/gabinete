import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';
import { SendNotificationUseCase } from './send-notification.use-case';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';
import { CabinetRole } from '../../cabinets/domain/cabinet-role.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationListener {
  constructor(
    private readonly sendNotification: SendNotificationUseCase,
    private readonly usersRepository: IUsersRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
  ) {}

  @OnEvent('demand.created')
  async handleDemandCreated(payload: {
    userId: string;
    demandId: string;
    demandTitle: string;
  }) {
    await this.sendNotification.execute({
      userId: payload.userId,
      title: 'Demanda Registrada!',
      message: `Sua demanda "${payload.demandTitle}" foi registrada com sucesso e está aguardando análise.`,
      type: NotificationType.SUCCESS,
      link: `/demands/${payload.demandId}`,
    });
  }

  @OnEvent('demand.status-changed')
  async handleDemandStatusChanged(payload: {
    userId: string | null;
    demandId: string;
    title: string;
    newStatus: string;
  }) {
    if (!payload.userId) return;

    const STATUS_LABELS: Record<string, string> = {
      SUBMITTED: 'Enviada',
      IN_ANALYSIS: 'Em Análise',
      IN_PROGRESS: 'Em Progresso',
      RESOLVED: 'Resolvida',
      REJECTED: 'Rejeitada',
      CANCELED: 'Cancelada',
    };

    await this.sendNotification.execute({
      userId: payload.userId,
      title: 'Status da Demanda Atualizado',
      message: `A demanda "${payload.title}" mudou para o status: ${STATUS_LABELS[payload.newStatus] ?? payload.newStatus}.`,
      type: NotificationType.INFO,
      link: `/demands/${payload.demandId}`,
    });
  }

  @OnEvent('demand.comment-added')
  async handleDemandCommentAdded(payload: {
    userId: string;
    demandId: string;
    authorName: string;
    demandTitle: string;
  }) {
    await this.sendNotification.execute({
      userId: payload.userId,
      title: 'Novo Comentário',
      message: `${payload.authorName} comentou na sua demanda "${payload.demandTitle}".`,
      type: NotificationType.INFO,
      link: `/demands/${payload.demandId}`,
    });
  }

  @OnEvent('demand.resolved')
  async handleDemandResolved(payload: {
    userId: string | null;
    demandId: string;
    demandTitle: string;
    cabinetName?: string;
  }) {
    if (!payload.userId) return;

    await this.sendNotification.execute({
      userId: payload.userId,
      title: 'Demanda Resolvida!',
      message: `A demanda "${payload.demandTitle}" foi marcada como resolvida${payload.cabinetName ? ` pelo gabinete ${payload.cabinetName}` : ''}.`,
      type: NotificationType.SUCCESS,
      link: `/demands/${payload.demandId}`,
    });
  }

  @OnEvent('demand.assigned')
  async handleDemandAssigned(payload: {
    demandId: string;
    assigneeUserId: string;
    demandTitle: string;
  }) {
    await this.sendNotification.execute({
      userId: payload.assigneeUserId,
      title: 'Nova Demanda Atribuída',
      message: `Você foi designado como responsável pela demanda "${payload.demandTitle}".`,
      type: NotificationType.INFO,
      link: `/demands/${payload.demandId}`,
    });
  }

  @OnEvent('demand.claimed')
  async handleDemandClaimed(payload: {
    demandId: string;
    reporterId: string | null;
    demandTitle: string;
    cabinetName: string;
  }) {
    if (!payload.reporterId) return;

    await this.sendNotification.execute({
      userId: payload.reporterId,
      title: 'Demanda Reivindicada',
      message: `Sua demanda "${payload.demandTitle}" foi assumida pelo gabinete ${payload.cabinetName}.`,
      type: NotificationType.INFO,
      link: `/demands/${payload.demandId}`,
    });
  }

  @OnEvent('demand.liked')
  async handleDemandLiked(payload: {
    demandId: string;
    reporterId: string | null;
    demandTitle: string;
    likerName: string;
  }) {
    if (!payload.reporterId) return;

    await this.sendNotification.execute({
      userId: payload.reporterId,
      title: 'Sua demanda recebeu uma curtida!',
      message: `${payload.likerName} curtiu sua demanda "${payload.demandTitle}".`,
      type: NotificationType.INFO,
      link: `/demands/${payload.demandId}`,
    });
  }

  @OnEvent('demand.evidence-added')
  async handleDemandEvidenceAdded(payload: {
    demandId: string;
    cabinetId: string | null;
    demandTitle: string;
    reporterId: string | null;
    reporterName: string;
  }) {
    if (payload.reporterId) {
      await this.sendNotification.execute({
        userId: payload.reporterId,
        title: 'Novas Evidências Anexadas',
        message: `Novas evidências (fotos/documentos) foram adicionadas à sua demanda "${payload.demandTitle}" por ${payload.reporterName}.`,
        type: NotificationType.INFO,
        link: `/demands/${payload.demandId}`,
      });
    }

    if (payload.cabinetId) {
      const members = await this.cabinetMembersRepository.findByCabinetId(
        payload.cabinetId,
      );
      const toNotify = members.filter(
        (member) =>
          member.role === CabinetRole.OWNER ||
          member.role === CabinetRole.STAFF,
      );

      for (const member of toNotify) {
        await this.sendNotification.execute({
          userId: member.userId,
          title: 'Novas Evidências Adicionadas',
          message: `${payload.reporterName} adicionou novos documentos à demanda "${payload.demandTitle}".`,
          type: NotificationType.INFO,
          link: `/demands/${payload.demandId}`,
        });
      }
    }
  }

  @OnEvent('cabinet.invitation-sent')
  async handleCabinetInvitationSent(payload: {
    email: string;
    cabinetName: string;
    senderName: string;
  }) {
    const user = await this.usersRepository.findByEmail(payload.email);
    if (user) {
      await this.sendNotification.execute({
        userId: user.id,
        title: 'Novo Convite de Gabinete',
        message: `Você foi convidado por ${payload.senderName} para participar do gabinete ${payload.cabinetName}.`,
        type: NotificationType.INFO,
        link: `/settings`,
      });
    }
  }

  @OnEvent('cabinet.member-joined')
  async handleCabinetMemberJoined(payload: {
    cabinetId: string;
    ownerId: string;
    memberName: string;
    cabinetName: string;
  }) {
    await this.sendNotification.execute({
      userId: payload.ownerId,
      title: 'Novo Membro no Gabinete',
      message: `${payload.memberName} aceitou o convite e agora faz parte do gabinete ${payload.cabinetName}.`,
      type: NotificationType.SUCCESS,
      link: `/settings`,
    });
  }
}
