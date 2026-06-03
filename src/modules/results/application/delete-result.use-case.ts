import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IResultsRepository } from '../domain/results.repository.interface';

@Injectable()
export class DeleteResultUseCase {
  constructor(
    private readonly resultsRepository: IResultsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string): Promise<void> {
    const result = await this.resultsRepository.findById(id);
    if (!result) {
      throw new NotFoundException('Resultado não encontrado');
    }

    await this.resultsRepository.softDelete(id);

    if (result.demandId) {
      this.eventEmitter.emit('result.deleted', { demandId: result.demandId });
    }
  }
}
