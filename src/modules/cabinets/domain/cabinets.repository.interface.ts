import { CabinetEntity } from './cabinet.entity';

export abstract class ICabinetsRepository {
  abstract create(data: {
    name: string;
    slug: string;
    description?: string;
    avatarUrl?: string;
  }): Promise<CabinetEntity>;

  abstract findById(id: string): Promise<CabinetEntity | null>;

  abstract findBySlug(slug: string): Promise<CabinetEntity | null>;

  abstract findSlugsByBaseName(baseSlug: string): Promise<string[]>;

  abstract list(): Promise<CabinetEntity[]>;

  abstract update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      avatarUrl?: string;
    },
  ): Promise<CabinetEntity>;

  abstract softDelete(id: string): Promise<void>;
}
