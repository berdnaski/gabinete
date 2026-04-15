import { Injectable, BadRequestException } from '@nestjs/common';
import { DemandEntity } from '../domain/demand.entity';
import {
  CreateDemandInfo,
  CreateEvidenceInfo,
  IDemandsRepository,
} from '../domain/demands.repository.interface';
import { CreateDemandDto } from '../dto/create-demand.dto';
import { DemandPriority } from '@prisma/client';
import { StorageService } from '../../../shared/domain/services/storage.service';
import sharp from 'sharp';

@Injectable()
export class CreateDemandUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    dto: CreateDemandDto,
    userId?: string,
    files?: Express.Multer.File[],
  ): Promise<DemandEntity> {

    if (userId && dto.guestEmail) {
      throw new BadRequestException(
        'Authenticated users cannot provide a guest email',
      );
    }

    if (!userId && !dto.guestEmail) {
      throw new BadRequestException(
        'A guest email must be provided for non-authenticated demands',
      );
    }

    const demandInfo: CreateDemandInfo = {
      title: dto.title,
      description: dto.description,
      priority: dto.priority || DemandPriority.MEDIUM,
      address: dto.address,
      zipcode: dto.zipcode,
      lat: dto.lat || null,
      long: dto.long || null,
      neighborhood: dto.neighborhood,
      city: dto.city,
      state: dto.state,
      reporterId: userId || null,
      guestEmail: dto.guestEmail || null,
      cabinetId: dto.cabinetId || null,
      categoryId: dto.categoryId || null,
    };

    const evidences: CreateEvidenceInfo[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const sanitizedBuffer = await sharp(file.buffer)
          .rotate()
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80, progressive: true })
          .toBuffer();

        const uploaded = await this.storageService.upload({
          buffer: sanitizedBuffer,
          filename: `${file.originalname.split('.')[0]}.jpg`,
          mimetype: 'image/jpeg',
          folder: 'demands/pending',
        });

        const urlInfo = await this.storageService.getUrl(uploaded.path);

        evidences.push({
          storageKey: uploaded.path,
          url: urlInfo.signedUrl,
          mimeType: 'image/jpeg',
          size: sanitizedBuffer.length,
        });
      }
    }

    return this.demandsRepository.createWithEvidences(demandInfo, evidences);
  }
}
