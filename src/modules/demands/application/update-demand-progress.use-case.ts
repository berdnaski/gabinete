import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DemandStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';
import { IDemandsRepository } from '../domain/demands.repository.interface';

@Injectable()
export class UpdateDemandProgressUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    demandId: string,
    userId: string,
    status: DemandStatus,
    note?: string,
  ) {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) throw new NotFoundException('Demanda não encontrada');

    if (!demand.cabinetId) {
      throw new BadRequestException(
        'Esta demanda não está vinculada a nenhum gabinete.',
      );
    }

    const membership = await this.cabinetMembersRepository.findMembership(
      userId,
      demand.cabinetId,
    );
    if (!membership) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta demanda.',
      );
    }

    const updatedDemand = await this.demandsRepository.update(demandId, {
      status,
    });

    const STATUS_LABELS: Record<string, string> = {
      SUBMITTED: 'Enviada',
      IN_ANALYSIS: 'Em Análise',
      IN_PROGRESS: 'Em Progresso',
      RESOLVED: 'Resolvida',
      REJECTED: 'Rejeitada',
      CANCELED: 'Cancelada',
    };

    if (status !== demand.status || note?.trim()) {
      const autoLine =
        status !== demand.status
          ? `Status atualizado para "${STATUS_LABELS[status] ?? status}".`
          : null;
      const content = [autoLine, note?.trim()].filter(Boolean).join('\n\n');
      await this.demandsRepository.addComment({
        demandId,
        authorId: userId,
        content,
        isCabinetResponse: true,
      });
    }

    if (status !== demand.status) {
      this.eventEmitter.emit('demand.status-changed', {
        userId: demand.reporterId,
        demandId: demand.id,
        title: demand.title,
        newStatus: status,
      });

      if (status === DemandStatus.RESOLVED) {
        this.eventEmitter.emit('demand.resolved', {
          userId: demand.reporterId,
          demandId: demand.id,
          demandTitle: demand.title,
        });
      }
    }

    return updatedDemand;
  }
}
