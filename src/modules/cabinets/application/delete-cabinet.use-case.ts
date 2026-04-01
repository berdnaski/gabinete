import { Injectable, NotFoundException } from '@nestjs/common';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';

@Injectable()
export class DeleteCabinetUseCase {
  constructor(private readonly cabinetsRepository: ICabinetsRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.cabinetsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Cabinet not found');
    }
    await this.cabinetsRepository.softDelete(id);
  }
}
