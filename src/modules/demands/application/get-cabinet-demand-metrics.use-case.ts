import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';
import {
  CabinetDemandMetrics,
  IDemandsRepository,
} from '../domain/demands.repository.interface';

export interface GetCabinetDemandMetricsInput {
  cabinetSlug: string;
  userId: string;
}

@Injectable()
export class GetCabinetDemandMetricsUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
  ) {}

  async execute(
    input: GetCabinetDemandMetricsInput,
  ): Promise<CabinetDemandMetrics> {
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
        'You do not have permission to view metrics for this cabinet.',
      );
    }

    return this.demandsRepository.getCabinetDemandMetrics(cabinet.id);
  }
}
