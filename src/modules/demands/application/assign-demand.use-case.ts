import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';

@Injectable()
export class AssignDemandUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
  ) {}

  async execute(
    demandId: string,
    assigneeMemberId: string,
    requesterId: string,
  ) {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demand not found');
    }

    if (!demand.cabinetId) {
      throw new BadRequestException(
        'Management of global demands is restricted to administrators. Claim it for a cabinet first.',
      );
    }

    const requesterMembership =
      await this.cabinetMembersRepository.findMembership(
        requesterId,
        demand.cabinetId,
      );

    if (!requesterMembership) {
      throw new ForbiddenException(
        'You do not have permission to manage demands from another cabinet.',
      );
    }

    const assigneeMembership =
      await this.cabinetMembersRepository.findById(assigneeMemberId);

    if (
      !assigneeMembership ||
      assigneeMembership.cabinetId !== demand.cabinetId
    ) {
      throw new BadRequestException(
        'The assignee must be a member of the cabinet responsible for this demand.',
      );
    }

    return this.demandsRepository.update(demandId, {
      assigneeMemberId,
    });
  }
}
