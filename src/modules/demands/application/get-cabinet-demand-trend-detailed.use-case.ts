import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';
import {
  DemandTrendDetailedPoint,
  IDemandsRepository,
} from '../domain/demands.repository.interface';

export interface GetCabinetDemandTrendDetailedInput {
  cabinetSlug: string;
  userId: string;
  days?: number;
}

@Injectable()
export class GetCabinetDemandTrendDetailedUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
  ) {}

  async execute(
    input: GetCabinetDemandTrendDetailedInput,
  ): Promise<DemandTrendDetailedPoint[]> {
    const cabinet = await this.cabinetsRepository.findBySlug(input.cabinetSlug);

    if (!cabinet) {
      throw new NotFoundException('Cabinet not found');
    }

    const membership = await this.cabinetMembersRepository.findMembership(
      input.userId,
      cabinet.id,
    );

    if (!membership) {
      throw new ForbiddenException(
        'You do not have permission to view this cabinet.',
      );
    }

    return this.demandsRepository.getDemandTrendDetailed(
      cabinet.id,
      input.days ?? 14,
    );
  }
}
