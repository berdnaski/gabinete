import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  IDemandsRepository,
  CreateEvidenceInfo,
} from '../domain/demands.repository.interface';
import { StorageService } from '../../../shared/domain/services/storage.service';
import { CheckStorageLimitUseCase } from '../../plans/application/check-storage-limit.use-case';

@Injectable()
export class ConfirmDemandEvidenceUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly storageService: StorageService,
    private readonly checkStorageLimitUseCase: CheckStorageLimitUseCase,
  ) {}

  async execute(
    demandId: string,
    storageKey: string,
    size: number,
  ): Promise<void> {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }

    const expectedPrefix = `demands/${demandId}/`;
    if (!storageKey.startsWith(expectedPrefix)) {
      throw new BadRequestException('Storage key format inválido');
    }

    if (demand.cabinetId) {
      await this.checkStorageLimitUseCase.execute(demand.cabinetId, size);
    }

    const urlInfo = await this.storageService.getUrl(storageKey);

    const evidenceInfo: CreateEvidenceInfo = {
      storageKey,
      url: urlInfo.signedUrl,
      mimeType: 'image/jpeg',
      size,
    };

    await this.demandsRepository.addEvidence(demandId, evidenceInfo);
  }
}
