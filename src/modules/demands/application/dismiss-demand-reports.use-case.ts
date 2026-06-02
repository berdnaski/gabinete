import { Injectable, NotFoundException } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';

@Injectable()
export class DismissDemandReportsUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(demandId: string): Promise<void> {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }
    await this.demandsRepository.dismissReports(demandId);
  }
}
