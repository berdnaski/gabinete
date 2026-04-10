import { Injectable } from '@nestjs/common';
import { ICategoriesRepository } from '../domain/categories.repository.interface';
import { PaginationHelper } from '../../../shared/application/pagination.helper';
import {
  PaginatedResponse,
  PaginationParams,
} from '../../../shared/domain/pagination.interface';
import { CategoryEntity } from '../domain/category.entity';

@Injectable()
export class ListCategoriesUseCase {
  constructor(private readonly categoriesRepository: ICategoriesRepository) {}

  async execute(
    params: PaginationParams,
  ): Promise<PaginatedResponse<CategoryEntity>> {
    const { page, limit } = PaginationHelper.getSkipTake(params);
    const { items, total } = await this.categoriesRepository.list({
      page,
      limit,
    });
    return PaginationHelper.buildResponse(items, total, { page, limit });
  }
}
