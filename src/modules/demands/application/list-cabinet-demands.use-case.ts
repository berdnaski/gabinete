import { Injectable, NotFoundException } from '@nestjs/common';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';
import { PaginationHelper } from '../../../shared/application/pagination.helper';
import {
  IDemandsRepository,
  ListDemandsFilters,
} from '../domain/demands.repository.interface';

@Injectable()
export class ListCabinetDemandsUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetsRepository: ICabinetsRepository,
  ) {}

  async execute(slug: string, filters: ListDemandsFilters, userId?: string) {
    const cabinet = await this.cabinetsRepository.findBySlug(slug);

    if (!cabinet) {
      throw new NotFoundException('Gabinete não encontrado');
    }

    const { page, limit } = PaginationHelper.getSkipTake(filters);

    const { items, total } = await this.demandsRepository.findAll(
      { ...filters, cabinetId: cabinet.id },
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
