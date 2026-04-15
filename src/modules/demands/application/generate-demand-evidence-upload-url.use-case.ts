import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { StorageService } from '../../../shared/domain/services/storage.service';

@Injectable()
export class GenerateDemandEvidenceUploadUrlUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly storageService: StorageService,
  ) { }

  async execute(demandId: string, filename: string): Promise<{ uploadUrl: string; storageKey: string }> {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }

    const ext = filename.split('.').pop() ?? 'jpg';
    const storageKey = `demands/${demand.id}/${uuidv4()}.${ext}`;

    const uploadUrl = await this.storageService.getPresignedUploadUrl(
      storageKey,
      'image/jpeg',
      600,
    );

    return { uploadUrl, storageKey };
  }
}
