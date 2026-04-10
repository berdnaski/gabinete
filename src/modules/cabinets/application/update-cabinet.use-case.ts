import { Injectable, NotFoundException } from '@nestjs/common';
import { resolveUniqueSlug, toBaseSlug } from '../../../shared/utils/slug.util';
import { CabinetEntity } from '../domain/cabinet.entity';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';
import { StorageService } from '../../../shared/domain/services/storage.service';

export interface UpdateCabinetInput {
  id: string;
  name?: string;
  description?: string;
  avatarUrl?: string;
  email?: string;
}

@Injectable()
export class UpdateCabinetUseCase {
  constructor(
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(input: UpdateCabinetInput, file?: Express.Multer.File): Promise<CabinetEntity> {
    const existing = await this.cabinetsRepository.findById(input.id);
    if (!existing) {
      throw new NotFoundException('Cabinet not found');
    }

    let slug: string | undefined;
    if (input.name && input.name !== existing.name) {
      const baseSlug = toBaseSlug(input.name);
      const existingSlugs =
        await this.cabinetsRepository.findSlugsByBaseName(baseSlug);
      slug = resolveUniqueSlug(baseSlug, existingSlugs);
    }

    let updatedAvatarUrl = input.avatarUrl;
    if (file) {
      const uploaded = await this.storageService.upload({
        buffer: file.buffer,
        filename: file.originalname,
        mimetype: file.mimetype,
        folder: `cabinets/${existing.id}`,
      });
      const generated = await this.storageService.getUrl(uploaded.path);
      updatedAvatarUrl = generated.signedUrl;
    }

    return this.cabinetsRepository.update(input.id, {
      name: input.name,
      slug,
      description: input.description,
      avatarUrl: updatedAvatarUrl,
      email: input.email,
    });
  }
}
