import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';
import {
  DemandTrendDetailedPoint,
  IDemandsRepository,
} from '../domain/demands.repository.interface';

export interface GetCabinetDemandTrendDetailedInput {
  cabinetSlug: string;
  userId?: string;
  days?: number;
}

@Injectable()
export class GetCabinetDemandTrendDetailedUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetsRepository: ICabinetsRepository,
  ) {}

  async execute(
    input: GetCabinetDemandTrendDetailedInput,
  ): Promise<DemandTrendDetailedPoint[]> {
    const cabinet = await this.cabinetsRepository.findBySlug(input.cabinetSlug);

    if (!cabinet) {
      throw new NotFoundException('Cabinet not found');
    }

    return this.demandsRepository.getDemandTrendDetailed(
      cabinet.id,
      input.days ?? 14,
    );
  }
}
