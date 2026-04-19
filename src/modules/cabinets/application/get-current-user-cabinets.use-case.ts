import { Injectable } from '@nestjs/common';
import { CabinetEntity } from '../domain/cabinet.entity';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';

@Injectable()
export class GetCurrentUserCabinetsUseCase {
  constructor(private readonly cabinetsRepository: ICabinetsRepository) {}

  async execute(userId: string): Promise<CabinetEntity[]> {
    return this.cabinetsRepository.findByUserId(userId);
  }
}
