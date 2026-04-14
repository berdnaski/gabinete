import { Injectable } from '@nestjs/common';
import { CabinetEntity } from '../domain/cabinet.entity';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';
import { PaginatedResult, PaginationParams } from 'src/shared/domain/pagination.interface';

@Injectable()
export class ListCabinetsUseCase {
  constructor(private readonly cabinetsRepository: ICabinetsRepository) {}

  async execute(params?: PaginationParams): Promise<PaginatedResult<CabinetEntity>> {
    return this.cabinetsRepository.list(params);
  }
}
