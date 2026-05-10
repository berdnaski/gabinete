import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';
import {
  CabinetDemandMetrics,
  IDemandsRepository,
} from '../domain/demands.repository.interface';

export interface GetCabinetDemandMetricsInput {
  cabinetSlug: string;
  userId?: string;
}

@Injectable()
export class GetCabinetDemandMetricsUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetsRepository: ICabinetsRepository,
  ) {}

  async execute(
    input: GetCabinetDemandMetricsInput,
  ): Promise<CabinetDemandMetrics> {
    const cabinet = await this.cabinetsRepository.findBySlug(input.cabinetSlug);

    if (!cabinet) {
      throw new NotFoundException('Gabinete não encontrado');
    }

    return this.demandsRepository.getCabinetDemandMetrics(cabinet.id);
  }
}
