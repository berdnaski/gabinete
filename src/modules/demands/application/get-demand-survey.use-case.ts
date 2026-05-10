import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';

export interface DemandSurveyView {
  demandId: string;
  demandTitle: string;
  cabinetName: string;
  cabinetSlug: string;
  alreadySubmitted: boolean;
  rating: number | null;
}

@Injectable()
export class GetDemandSurveyUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(token: string): Promise<DemandSurveyView> {
    const demand = await this.demandsRepository.findBySurveyToken(token);
    if (!demand) throw new NotFoundException('Pesquisa não encontrada.');

    return {
      demandId: demand.id,
      demandTitle: demand.title,
      cabinetName: demand.cabinet?.name ?? 'Gabinete',
      cabinetSlug: demand.cabinet?.slug ?? '',
      alreadySubmitted: !!demand.surveySubmittedAt,
      rating: demand.surveyRating,
    };
  }
}
