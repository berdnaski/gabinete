import { Injectable } from '@nestjs/common';
import { resolveUniqueSlug, toBaseSlug } from '../../../shared/utils/slug.util';
import { ICategoriesRepository } from '../domain/categories.repository.interface';
import { CategoryEntity } from '../domain/category.entity';

export interface CreateCategoryInput {
  name: string;
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(private readonly categoriesRepository: ICategoriesRepository) {}

  async execute(input: CreateCategoryInput): Promise<CategoryEntity> {
    const baseSlug = toBaseSlug(input.name);
    const existingSlugs = await this.categoriesRepository.findSlugsByBaseName(baseSlug);
    const slug = resolveUniqueSlug(baseSlug, existingSlugs);

    return this.categoriesRepository.create({ name: input.name, slug });
  }
}
