import { Injectable, NotFoundException } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';

@Injectable()
export class ToggleDemandLikeUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(demandId: string, userId: string): Promise<{ liked: boolean }> {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demand not found');
    }

    const liked = await this.demandsRepository.toggleLike(demandId, userId);
    return { liked };
  }
}
