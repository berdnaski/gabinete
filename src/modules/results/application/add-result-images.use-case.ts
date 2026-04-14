import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from 'src/shared/domain/services/storage.service';
import { IResultsRepository } from '../domain/results.repository.interface';
import sharp from 'sharp';

@Injectable()
export class AddResultImagesUseCase {
  constructor(
    private readonly resultsRepository: IResultsRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(resultId: string, files: Express.Multer.File[]): Promise<void> {
    const result = await this.resultsRepository.findById(resultId);
    if (!result) {
      throw new NotFoundException('Resultado não encontrado');
    }

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const sanitized = await sharp(file.buffer)
          .rotate()
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80, progressive: true })
          .toBuffer();

        const uploaded = await this.storageService.upload({
          buffer: sanitized,
          filename: `${file.originalname.split('.')[0]}.jpg`,
          mimetype: 'image/jpeg',
          folder: `results/${result.cabinetId}`,
        });

        const { signedUrl } = await this.storageService.getUrl(uploaded.path);
        return { storageKey: uploaded.path, url: signedUrl };
      }),
    );

    await this.resultsRepository.addImages(resultId, uploadedImages);
  }
}
