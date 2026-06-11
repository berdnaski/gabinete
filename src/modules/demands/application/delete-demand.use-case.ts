import { Injectable, NotFoundException } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { StorageService } from '../../../shared/domain/services/storage.service';

@Injectable()
export class DeleteDemandUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(id: string) {
    const demand = await this.demandsRepository.findById(id);

    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }

    if (demand.evidences?.length) {
      await Promise.allSettled(
        demand.evidences.map((ev) => this.storageService.delete(ev.storageKey)),
      );
    }

    await this.demandsRepository.update(id, { disabledAt: new Date() });
    await this.demandsRepository.resolveReports(id);
  }
}
