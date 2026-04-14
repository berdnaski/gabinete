import { Injectable, NotFoundException } from '@nestjs/common';
import { IResultsRepository } from '../domain/results.repository.interface';
import { ResultEntity } from '../domain/result.entity';

@Injectable()
export class FindResultUseCase {
  constructor(private readonly resultsRepository: IResultsRepository) {}

  async execute(id: string): Promise<ResultEntity> {
    const result = await this.resultsRepository.findById(id);
    if (!result) {
      throw new NotFoundException('Resultado não encontrado');
    }
    return result;
  }
}
