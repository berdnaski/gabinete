import { Injectable } from '@nestjs/common';
import { ResultType } from '@prisma/client';
import { IResultsRepository } from '../domain/results.repository.interface';
import { PaginatedResult } from 'src/shared/domain/pagination.interface';
import { ResultEntity } from '../domain/result.entity';

export interface ListResultsInput {
  cabinetId?: string;
  demandId?: string;
  type?: ResultType;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListResultsUseCase {
  constructor(private readonly resultsRepository: IResultsRepository) {}

  async execute(input: ListResultsInput): Promise<PaginatedResult<ResultEntity>> {
    return this.resultsRepository.findAll({
      cabinetId: input.cabinetId,
      demandId: input.demandId,
      type: input.type,
      search: input.search,
      page: input.page,
      limit: input.limit,
      isPublicOnly: true,
    });
  }
}
