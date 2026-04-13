import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';

@Injectable()
export class AssignDemandUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    demandId: string,
    assigneeMemberId: string,
    requesterId: string,
  ) {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }

    if (!demand.cabinetId) {
      throw new BadRequestException(
        'O gerenciamento de demandas globais é restrito a administradores. Reivindique-a para um gabinete primeiro.',
      );
    }

    const requesterMembership =
      await this.cabinetMembersRepository.findMembership(
        requesterId,
        demand.cabinetId,
      );

    if (!requesterMembership) {
      throw new ForbiddenException(
        'Você não tem permissão para gerenciar demandas de outro gabinete.',
      );
    }

    const assigneeMembership =
      await this.cabinetMembersRepository.findById(assigneeMemberId);

    if (
      !assigneeMembership ||
      assigneeMembership.cabinetId !== demand.cabinetId
    ) {
      throw new BadRequestException(
        'O responsável deve ser um membro do gabinete responsável por esta demanda.',
      );
    }

    const updatedDemand = await this.demandsRepository.update(demandId, {
      assigneeMemberId,
    });

    this.eventEmitter.emit('demand.assigned', {
      demandId,
      assigneeUserId: assigneeMembership.userId,
      demandTitle: demand.title,
    });

    return updatedDemand;
  }
}
