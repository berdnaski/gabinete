import { Injectable, NotFoundException } from '@nestjs/common';
import { ICategoriesRepository } from '../domain/categories.repository.interface';
import { CategoryEntity } from '../domain/category.entity';

@Injectable()
export class FindCategoryBySlugUseCase {
  constructor(private readonly categoriesRepository: ICategoriesRepository) {}

  async execute(slug: string): Promise<CategoryEntity> {
    const category = await this.categoriesRepository.findBySlug(slug);
    if (!category) throw new NotFoundException(`Category with slug "${slug}" not found`);
    return category;
  }
}
