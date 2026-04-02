import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { StorageService } from '../../../shared/domain/services/storage.service';
import { validateImageMimeType } from '../../../shared/utils/file-validation.util';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { UserRole } from '../../users/domain/user.entity';

export interface AddDemandEvidenceCommand {
  demandId: string;
  userId: string;
  userRole?: UserRole;
  files: Express.Multer.File[];
}

@Injectable()
export class AddDemandEvidenceUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly storageService: StorageService,
  ) { }

  async execute(command: AddDemandEvidenceCommand): Promise<void> {
    const { demandId, userId, userRole, files } = command;

    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demand not found');
    }

    const isElevated =
      userRole === UserRole.MEMBER || userRole === UserRole.ADMIN;
    if (!isElevated && demand.reporterId !== userId) {
      throw new ForbiddenException(
        'You can only add evidences to your own demands',
      );
    }

    if (files && files.length > 0) {
      for (const file of files) {
        validateImageMimeType(file.mimetype);

        const uploaded = await this.storageService.upload({
          buffer: file.buffer,
          filename: file.originalname,
          mimetype: file.mimetype,
          folder: `demands/${demand.id}`,
        });

        const urlInfo = await this.storageService.getUrl(uploaded.path);

        await this.demandsRepository.addEvidence(demand.id, {
          storageKey: uploaded.path,
          url: urlInfo.signedUrl,
          mimeType: uploaded.mimetype,
          size: file.size,
        });
      }
    }
  }
}
