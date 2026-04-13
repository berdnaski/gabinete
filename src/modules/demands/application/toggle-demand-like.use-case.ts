import { Injectable, NotFoundException } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';

@Injectable()
export class ToggleDemandLikeUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(demandId: string, userId: string): Promise<boolean> {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }

    return this.demandsRepository.toggleLike(demandId, userId);
  }
}
