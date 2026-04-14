import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from 'src/shared/domain/services/storage.service';
import { IResultsRepository } from '../domain/results.repository.interface';
import { ResultEntity } from '../domain/result.entity';

@Injectable()
export class UploadResultProtocolUseCase {
  constructor(
    private readonly resultsRepository: IResultsRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(resultId: string, file: Express.Multer.File): Promise<ResultEntity> {
    const result = await this.resultsRepository.findById(resultId);
    if (!result) {
      throw new NotFoundException('Resultado não encontrado');
    }

    if (result.protocolFileKey) {
      await this.storageService.delete(result.protocolFileKey).catch(() => null);
    }

    const uploaded = await this.storageService.upload({
      buffer: file.buffer,
      filename: file.originalname,
      mimetype: file.mimetype,
      folder: `results/${result.cabinetId}/protocols`,
    });

    const { signedUrl } = await this.storageService.getUrl(uploaded.path);

    return this.resultsRepository.setProtocol(resultId, {
      protocolFileKey: uploaded.path,
      protocolFileUrl: signedUrl,
      protocolFileName: file.originalname,
      protocolFileMimeType: file.mimetype,
      protocolFileSize: file.size,
    });
  }
}
