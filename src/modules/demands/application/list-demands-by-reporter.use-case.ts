import { Injectable } from '@nestjs/common';
import { PaginationHelper } from '../../../shared/application/pagination.helper';
import {
  IDemandsRepository,
  ListReporterDemandsFilters,
} from '../domain/demands.repository.interface';

@Injectable()
export class ListDemandsByReporterUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(
    reporterId: string,
    filters: ListReporterDemandsFilters,
    userId?: string,
  ) {
    const { page, limit } = PaginationHelper.getSkipTake(filters);

    const { items, total } = await this.demandsRepository.findByReporter(
      reporterId,
      filters,
      userId,
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
