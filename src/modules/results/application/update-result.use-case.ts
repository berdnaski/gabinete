import { Injectable, NotFoundException } from '@nestjs/common';
import { ResultType } from '@prisma/client';
import { IResultsRepository } from '../domain/results.repository.interface';
import { ResultEntity } from '../domain/result.entity';

export interface UpdateResultInput {
  title?: string;
  description?: string;
  type?: ResultType;
  isPublic?: boolean;
  demandId?: string | null;
}

@Injectable()
export class UpdateResultUseCase {
  constructor(private readonly resultsRepository: IResultsRepository) {}

  async execute(id: string, input: UpdateResultInput): Promise<ResultEntity> {
    const result = await this.resultsRepository.findById(id);
    if (!result) {
      throw new NotFoundException('Resultado não encontrado');
    }

    return this.resultsRepository.update(id, input);
  }
}
