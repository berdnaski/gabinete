import { Injectable, NotFoundException } from '@nestjs/common';
import { resolveUniqueSlug, toBaseSlug } from '../../../shared/utils/slug.util';
import { CabinetEntity } from '../domain/cabinet.entity';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';

export interface UpdateCabinetInput {
  id: string;
  name?: string;
  description?: string;
  avatarUrl?: string;
}

@Injectable()
export class UpdateCabinetUseCase {
  constructor(private readonly cabinetsRepository: ICabinetsRepository) {}

  async execute(input: UpdateCabinetInput): Promise<CabinetEntity> {
    const existing = await this.cabinetsRepository.findById(input.id);
    if (!existing) throw new NotFoundException('Cabinet not found');

    let slug: string | undefined;
    if (input.name && input.name !== existing.name) {
      const baseSlug = toBaseSlug(input.name);
      const existingSlugs = await this.cabinetsRepository.findSlugsByBaseName(baseSlug);
      slug = resolveUniqueSlug(baseSlug, existingSlugs);
    }

    return this.cabinetsRepository.update(input.id, {
      name: input.name,
      slug,
      description: input.description,
      avatarUrl: input.avatarUrl,
    });
  }
}
