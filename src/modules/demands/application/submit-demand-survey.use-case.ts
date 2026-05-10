import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';

export interface SubmitSurveyInput {
  token: string;
  rating: number;
  comment?: string;
}

@Injectable()
export class SubmitDemandSurveyUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(input: SubmitSurveyInput): Promise<void> {
    if (input.rating < 1 || input.rating > 5) {
      throw new BadRequestException('A avaliação deve ser entre 1 e 5.');
    }

    const demand = await this.demandsRepository.findBySurveyToken(input.token);
    if (!demand) throw new NotFoundException('Pesquisa não encontrada.');
    if (demand.surveySubmittedAt) {
      throw new BadRequestException('Esta avaliação já foi respondida.');
    }

    await this.demandsRepository.update(demand.id, {
      surveyRating: input.rating,
      surveyComment: input.comment ?? null,
      surveySubmittedAt: new Date(),
    });
  }
}
