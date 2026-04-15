import { CabinetEntity } from './cabinet.entity';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/domain/pagination.interface';

export abstract class ICabinetsRepository {
  abstract create(data: {
    name: string;
    slug: string;
    email?: string;
    description?: string;
    avatarUrl?: string;
  }): Promise<CabinetEntity>;

  abstract findById(id: string): Promise<CabinetEntity | null>;

  abstract findBySlug(slug: string): Promise<CabinetEntity | null>;

  abstract findSlugsByBaseName(baseSlug: string): Promise<string[]>;

  abstract list(
    params?: PaginationParams,
  ): Promise<PaginatedResult<CabinetEntity>>;

  abstract update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      email?: string;
      description?: string;
      avatarUrl?: string;
    },
  ): Promise<CabinetEntity>;

  abstract softDelete(id: string): Promise<void>;
}
