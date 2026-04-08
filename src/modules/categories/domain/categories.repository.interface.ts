import { CategoryEntity } from './category.entity';

export abstract class ICategoriesRepository {
  abstract create(data: {
    name: string;
    slug: string;
  }): Promise<CategoryEntity>;

  abstract findById(id: string): Promise<CategoryEntity | null>;

  abstract findBySlug(slug: string): Promise<CategoryEntity | null>;

  abstract findSlugsByBaseName(baseSlug: string): Promise<string[]>;

  abstract list(): Promise<CategoryEntity[]>;

  abstract update(
    id: string,
    data: { name?: string; slug?: string },
  ): Promise<CategoryEntity>;

  abstract softDelete(id: string): Promise<void>;
}
