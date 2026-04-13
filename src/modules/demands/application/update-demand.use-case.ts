import { Injectable, NotFoundException } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';
import { UpdateDemandDto } from '../dto/update-demand.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DemandStatus } from '@prisma/client';

@Injectable()
export class UpdateDemandUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async execute(id: string, dto: UpdateDemandDto, userId: string) {
    const demand = await this.demandsRepository.findById(id);

    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }

    if (dto.status || dto.priority || dto.assigneeMemberId) {
      let isAuthorized = false;

      if (demand.cabinetId) {
        const membership = await this.cabinetMembersRepository.findMembership(
          userId,
          demand.cabinetId,
        );
        isAuthorized = !!membership;
      }

      if (!isAuthorized) {
        delete dto.status;
        delete dto.priority;
        delete dto.assigneeMemberId;
      }
    }

    const updatedDemand = await this.demandsRepository.update(id, dto);

    if (dto.status && dto.status !== demand.status) {
      this.eventEmitter.emit('demand.status-changed', {
        userId: demand.reporterId,
        demandId: demand.id,
        title: demand.title,
        newStatus: dto.status,
      });

      if (dto.status === DemandStatus.RESOLVED) {
        this.eventEmitter.emit('demand.resolved', {
          userId: demand.reporterId,
          demandTitle: demand.title,
        });
      }
    }

    return updatedDemand;
  }
}
