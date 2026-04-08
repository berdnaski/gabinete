import { Injectable } from '@nestjs/common';
import { PaginationHelper } from '../../../shared/application/pagination.helper';
import {
  IDemandsRepository,
  ListDemandsFilters,
} from '../domain/demands.repository.interface';

@Injectable()
export class ListDemandsUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(filters: ListDemandsFilters) {
    const { page, limit } = PaginationHelper.getSkipTake(filters);

    const { items, total } = await this.demandsRepository.findAll({
      cabinetId: filters.cabinetId,
      unassignedOnly: filters.unassignedOnly,
      categoryId: filters.categoryId,
      status: filters.status,
      priority: filters.priority,
      search: filters.search,
      page,
      limit,
    });

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
