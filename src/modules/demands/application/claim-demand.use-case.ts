import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';

@Injectable()
export class ClaimDemandUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
  ) {}

  async execute(demandId: string, userId: string) {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demand not found');
    }

    if (demand.cabinetId) {
      throw new BadRequestException('Demand is already assigned to a cabinet');
    }

    const memberships =
      await this.cabinetMembersRepository.findByUserId(userId);
    const membership = memberships[0];

    if (!membership) {
      throw new ForbiddenException(
        'You must belong to a cabinet to claim demands',
      );
    }

    return this.demandsRepository.update(demandId, {
      cabinetId: membership.cabinetId,
    });
  }
}
