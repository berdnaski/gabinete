import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';
import {
  DemandTrendPoint,
  IDemandsRepository,
} from '../domain/demands.repository.interface';

export interface GetCabinetDemandTrendInput {
  cabinetSlug: string;
  userId?: string;
  days?: number;
}

@Injectable()
export class GetCabinetDemandTrendUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetsRepository: ICabinetsRepository,
  ) {}

  async execute(input: GetCabinetDemandTrendInput): Promise<DemandTrendPoint[]> {
    const cabinet = await this.cabinetsRepository.findBySlug(input.cabinetSlug);

    if (!cabinet) {
      throw new NotFoundException('Cabinet not found');
    }

    const days = input.days ?? 14;

    return this.demandsRepository.getDemandTrend(cabinet.id, days);
  }
}
