import { Injectable } from '@nestjs/common';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';

@Injectable()
export class EnableCabinetUseCase {
  constructor(private readonly cabinetsRepository: ICabinetsRepository) {}

  async execute(id: string): Promise<void> {
    await this.cabinetsRepository.enable(id);
  }
}
