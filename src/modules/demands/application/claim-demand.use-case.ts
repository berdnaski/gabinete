import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';
import { CabinetRole } from '../../cabinets/domain/cabinet-role.enum';
import { DemandStatus } from '@prisma/client';

export interface ClaimDemandInput {
  demandId: string;
  userId: string;
  cabinetId?: string;
}

@Injectable()
export class ClaimDemandUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
  ) {}

  async execute(input: ClaimDemandInput) {
    const { demandId, userId, cabinetId: inputCabinetId } = input;

    const demand = await this.demandsRepository.findById(demandId);

    if (!demand) {
      throw new NotFoundException('Demand not found');
    }

    if (demand.cabinetId) {
      throw new BadRequestException('Demand is already assigned to a cabinet');
    }

    let targetCabinetId = inputCabinetId;

    if (targetCabinetId) {
      const membership = await this.cabinetMembersRepository.findMembership(
        userId,
        targetCabinetId,
      );

      if (!membership || !this.isManager(membership.role)) {
        throw new ForbiddenException(
          'You do not have permission to claim demands for this cabinet',
        );
      }
    } else {
      const memberships = await this.cabinetMembersRepository.findByUserId(
        userId,
      );
      const managerMemberships = memberships.filter((m) =>
        this.isManager(m.role),
      );

      if (managerMemberships.length === 0) {
        throw new ForbiddenException(
          'You must be an OWNER or STAFF of a cabinet to claim demands',
        );
      }

      if (managerMemberships.length > 1) {
        throw new BadRequestException(
          'You belong to multiple cabinets. Please specify a cabinetId.',
        );
      }

      targetCabinetId = managerMemberships[0].cabinetId;
    }

    return this.demandsRepository.update(demandId, {
      cabinetId: targetCabinetId,
      status: DemandStatus.IN_PROGRESS,
    });
  }

  private isManager(role: CabinetRole): boolean {
    return role === CabinetRole.OWNER || role === CabinetRole.STAFF;
  }
}
