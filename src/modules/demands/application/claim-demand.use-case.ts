import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';

@Injectable()
export class ClaimDemandUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(demandId: string, userId: string) {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }

    if (demand.cabinetId) {
      throw new BadRequestException('Esta demanda já está vinculada a um gabinete');
    }

    const memberships = await this.cabinetMembersRepository.findByUserId(userId);
    const membership = memberships[0];

    if (!membership) {
      throw new ForbiddenException(
        'Você precisa pertencer a um gabinete para reivindicar demandas',
      );
    }

    const cabinet = await this.cabinetsRepository.findById(membership.cabinetId);
    if (!cabinet) {
        throw new NotFoundException('Gabinete não encontrado');
    }

    const updatedDemand = await this.demandsRepository.update(demandId, {
      cabinetId: membership.cabinetId,
    });

    this.eventEmitter.emit('demand.claimed', {
        demandId,
        reporterId: demand.reporterId,
        demandTitle: demand.title,
        cabinetName: cabinet.name,
    });

    return updatedDemand;
  }
}
