import { Injectable, NotFoundException } from '@nestjs/common';
import { CabinetSectionsRepository } from '../infrastructure/cabinet-sections.repository';
import { UpsertSectionItemDto } from '../dto/upsert-cabinet-sections.dto';
import { CabinetSectionEntity } from '../domain/cabinet-section.entity';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';

@Injectable()
export class UpsertCabinetSectionsUseCase {
  constructor(
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly cabinetSectionsRepository: CabinetSectionsRepository,
  ) {}

  async execute(cabinetId: string, sections: UpsertSectionItemDto[]): Promise<CabinetSectionEntity[]> {
    const cabinet = await this.cabinetsRepository.findById(cabinetId);
    if (!cabinet) {
      throw new NotFoundException('Gabinete não encontrado');
    }

    return this.cabinetSectionsRepository.upsertMany(cabinetId, sections);
  }
}
