import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { StorageService } from '../../../shared/domain/services/storage.service';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { Injectable, NotFoundException } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class AddDemandEvidenceUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly storageService: StorageService,
    private readonly usersRepository: IUsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    demandId: string,
    userId: string | undefined,
    files: Express.Multer.File[],
  ): Promise<void> {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }

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
          folder: `demands/${demand.id}`,
        });

        const urlInfo = await this.storageService.getUrl(uploaded.path);

        await this.demandsRepository.addEvidence(demand.id, {
          storageKey: uploaded.path,
          url: urlInfo.signedUrl,
          mimeType: 'image/jpeg',
          size: sanitizedBuffer.length,
        });
      }

      const reporter = userId
        ? await this.usersRepository.findById(userId)
        : null;
      if (demand.reporterId) {
        this.eventEmitter.emit('demand.evidence-added', {
          demandId: demand.id,
          cabinetId: demand.cabinetId,
          demandTitle: demand.title,
          reporterId: demand.reporterId,
          reporterName: reporter?.name || 'O autor',
        });
      }
    }
  }
}
