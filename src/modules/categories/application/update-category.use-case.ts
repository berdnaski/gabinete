import { Injectable, NotFoundException } from '@nestjs/common';
import { resolveUniqueSlug, toBaseSlug } from '../../../shared/utils/slug.util';
import { ICategoriesRepository } from '../domain/categories.repository.interface';
import { CategoryEntity } from '../domain/category.entity';

export interface UpdateCategoryInput {
  id: string;
  name?: string;
}

@Injectable()
export class UpdateCategoryUseCase {
  constructor(private readonly categoriesRepository: ICategoriesRepository) {}

  async execute(input: UpdateCategoryInput): Promise<CategoryEntity> {
    const existing = await this.categoriesRepository.findById(input.id);
    if (!existing) throw new NotFoundException('Category not found');

    let slug: string | undefined;
    if (input.name && input.name !== existing.name) {
      const baseSlug = toBaseSlug(input.name);
      const existingSlugs = await this.categoriesRepository.findSlugsByBaseName(baseSlug);
      slug = resolveUniqueSlug(baseSlug, existingSlugs);
    }

    return this.categoriesRepository.update(input.id, { name: input.name, slug });
  }
}
