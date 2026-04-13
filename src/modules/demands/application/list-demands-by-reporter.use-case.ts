import { Injectable } from '@nestjs/common';
import { PaginationHelper } from '../../../shared/application/pagination.helper';
import {
  IDemandsRepository,
  ListDemandsFilters,
} from '../domain/demands.repository.interface';

@Injectable()
export class ListDemandsByReporterUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(reporterId: string, filters: Omit<ListDemandsFilters, 'reporterId'>) {
    const { page, limit } = PaginationHelper.getSkipTake(filters);

    const { items, total } = await this.demandsRepository.findByReporter(
      reporterId,
      { page, limit },
    );

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / (limit || 10)),
      },
    };
  }
}
