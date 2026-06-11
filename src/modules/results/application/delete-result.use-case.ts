import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IResultsRepository } from '../domain/results.repository.interface';
import { StorageService } from '../../../shared/domain/services/storage.service';

@Injectable()
export class DeleteResultUseCase {
  constructor(
    private readonly resultsRepository: IResultsRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly storageService: StorageService,
  ) {}

  async execute(id: string): Promise<void> {
    const result = await this.resultsRepository.findById(id);
    if (!result) {
      throw new NotFoundException('Resultado não encontrado');
    }

    const keysToDelete: string[] = [];

    if (result.protocolFileKey) {
      keysToDelete.push(result.protocolFileKey);
    }

    for (const img of result.images ?? []) {
      keysToDelete.push(img.storageKey);
    }

    if (keysToDelete.length > 0) {
      await Promise.allSettled(
        keysToDelete.map((key) => this.storageService.delete(key)),
      );
    }

    await this.resultsRepository.softDelete(id);

    if (result.demandId) {
      this.eventEmitter.emit('result.deleted', { demandId: result.demandId });
    }
  }
}
