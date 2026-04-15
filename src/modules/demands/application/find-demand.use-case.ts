import { Injectable, NotFoundException } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';

@Injectable()
export class FindDemandUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(id: string, userId?: string) {
    const demand = await this.demandsRepository.findById(id, userId);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }
    return demand;
  }
}
