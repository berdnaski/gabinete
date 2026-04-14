import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ResultType } from '@prisma/client';
import { StorageService } from 'src/shared/domain/services/storage.service';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';
import { IResultsRepository } from '../domain/results.repository.interface';
import { ResultEntity } from '../domain/result.entity';
import sharp from 'sharp';

export interface CreateResultInput {
  title: string;
  description: string;
  type: ResultType;
  cabinetSlug: string;
  demandId?: string | null;
}

@Injectable()
export class CreateResultUseCase {
  constructor(
    private readonly resultsRepository: IResultsRepository,
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    input: CreateResultInput,
    userId: string,
    imageFiles: Express.Multer.File[],
    protocolFile?: Express.Multer.File,
  ): Promise<ResultEntity> {
    const cabinet = await this.cabinetsRepository.findBySlug(input.cabinetSlug);
    if (!cabinet) {
      throw new NotFoundException('Gabinete não encontrado');
    }

    const membership = await this.cabinetMembersRepository.findMembership(userId, cabinet.id);
    if (!membership) {
      throw new ForbiddenException('Você não é membro deste gabinete');
    }

    const uploadedImages = await Promise.all(
      imageFiles.map(async (file) => {
        const sanitized = await sharp(file.buffer)
          .rotate()
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80, progressive: true })
          .toBuffer();

        const uploaded = await this.storageService.upload({
          buffer: sanitized,
          filename: `${file.originalname.split('.')[0]}.jpg`,
          mimetype: 'image/jpeg',
          folder: `results/${cabinet.id}`,
        });

        const { signedUrl } = await this.storageService.getUrl(uploaded.path);
        return { storageKey: uploaded.path, url: signedUrl };
      }),
    );

    let protocolData: {
      protocolFileKey: string;
      protocolFileUrl: string;
      protocolFileName: string;
      protocolFileMimeType: string;
      protocolFileSize: number;
    } | null = null;

    if (protocolFile) {
      const uploaded = await this.storageService.upload({
        buffer: protocolFile.buffer,
        filename: protocolFile.originalname,
        mimetype: protocolFile.mimetype,
        folder: `results/${cabinet.id}/protocols`,
      });

      const { signedUrl } = await this.storageService.getUrl(uploaded.path);
      protocolData = {
        protocolFileKey: uploaded.path,
        protocolFileUrl: signedUrl,
        protocolFileName: protocolFile.originalname,
        protocolFileMimeType: protocolFile.mimetype,
        protocolFileSize: protocolFile.size,
      };
    }

    return this.resultsRepository.create({
      title: input.title,
      description: input.description,
      type: input.type,
      cabinetId: cabinet.id,
      demandId: input.demandId ?? null,
      images: uploadedImages,
      protocolFileKey: protocolData?.protocolFileKey ?? null,
      protocolFileUrl: protocolData?.protocolFileUrl ?? null,
      protocolFileName: protocolData?.protocolFileName ?? null,
      protocolFileMimeType: protocolData?.protocolFileMimeType ?? null,
      protocolFileSize: protocolData?.protocolFileSize ?? null,
    });
  }
}
