import { Injectable } from '@nestjs/common';
import { CabinetEntity } from '../domain/cabinet.entity';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';

@Injectable()
export class ListCabinetsUseCase {
  constructor(private readonly cabinetsRepository: ICabinetsRepository) {}

  async execute(): Promise<CabinetEntity[]> {
    return this.cabinetsRepository.list();
  }
}
