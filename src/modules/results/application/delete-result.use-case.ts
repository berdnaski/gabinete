import { Injectable, NotFoundException } from '@nestjs/common';
import { IResultsRepository } from '../domain/results.repository.interface';

@Injectable()
export class DeleteResultUseCase {
  constructor(private readonly resultsRepository: IResultsRepository) {}

  async execute(id: string): Promise<void> {
    const result = await this.resultsRepository.findById(id);
    if (!result) {
      throw new NotFoundException('Resultado não encontrado');
    }

    await this.resultsRepository.softDelete(id);
  }
}
