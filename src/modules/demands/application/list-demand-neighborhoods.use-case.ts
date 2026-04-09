import { Injectable } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';

@Injectable()
export class ListDemandNeighborhoodsUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(cabinetId?: string): Promise<string[]> {
    return this.demandsRepository.getNeighborhoods(cabinetId);
  }
}
