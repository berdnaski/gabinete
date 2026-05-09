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
  accentColor?: string;
  tagline?: string;
  postDemandMessage?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  logoUrl?: string;
}

@Injectable()
export class UpdateCabinetUseCase {
  constructor(
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    input: UpdateCabinetInput,
    avatarFile?: Express.Multer.File,
    bannerFile?: Express.Multer.File,
    logoFile?: Express.Multer.File,
  ): Promise<CabinetEntity> {
    const existing = await this.cabinetsRepository.findById(input.id);
    if (!existing) {
      throw new NotFoundException('Gabinete não encontrado');
    }

    let slug: string | undefined;
    if (input.name && input.name !== existing.name) {
      const baseSlug = toBaseSlug(input.name);
      const existingSlugs =
        await this.cabinetsRepository.findSlugsByBaseName(baseSlug);
      slug = resolveUniqueSlug(baseSlug, existingSlugs);
    }

    let updatedAvatarUrl = input.avatarUrl;
    if (avatarFile) {
      const uploaded = await this.storageService.upload({
        buffer: avatarFile.buffer,
        filename: avatarFile.originalname,
        mimetype: avatarFile.mimetype,
        folder: `cabinets/${existing.id}/avatar`,
      });
      const generated = await this.storageService.getUrl(uploaded.path);
      updatedAvatarUrl = generated.signedUrl;
    }

    let updatedBannerUrl: string | undefined;
    if (bannerFile) {
      const uploaded = await this.storageService.upload({
        buffer: bannerFile.buffer,
        filename: bannerFile.originalname,
        mimetype: bannerFile.mimetype,
        folder: `cabinets/${existing.id}/banner`,
      });
      const generated = await this.storageService.getUrl(uploaded.path);
      updatedBannerUrl = generated.signedUrl;
    }

    let updatedLogoUrl: string | undefined;
    if (logoFile) {
      const uploaded = await this.storageService.upload({
        buffer: logoFile.buffer,
        filename: logoFile.originalname,
        mimetype: logoFile.mimetype,
        folder: `cabinets/${existing.id}/logo`,
      });
      const generated = await this.storageService.getUrl(uploaded.path);
      updatedLogoUrl = generated.signedUrl;
    }

    return this.cabinetsRepository.update(input.id, {
      name: input.name,
      slug,
      description: input.description,
      avatarUrl: updatedAvatarUrl,
      bannerUrl: updatedBannerUrl,
      logoUrl: updatedLogoUrl ?? undefined,
      accentColor: input.accentColor !== undefined ? (input.accentColor || null) : undefined,
      email: input.email,
      tagline: input.tagline !== undefined ? (input.tagline || null) : undefined,
      postDemandMessage: input.postDemandMessage !== undefined ? (input.postDemandMessage || null) : undefined,
      instagramUrl: input.instagramUrl !== undefined ? (input.instagramUrl || null) : undefined,
      facebookUrl: input.facebookUrl !== undefined ? (input.facebookUrl || null) : undefined,
      websiteUrl: input.websiteUrl !== undefined ? (input.websiteUrl || null) : undefined,
      twitterUrl: input.twitterUrl !== undefined ? (input.twitterUrl || null) : undefined,
    });
  }
}
