import { Injectable, BadRequestException } from '@nestjs/common';
import { DemandEntity } from '../domain/demand.entity';
import {
  CreateDemandInfo,
  IDemandsRepository,
} from '../domain/demands.repository.interface'; 
import { CreateDemandDto } from '../dto/create-demand.dto';
import { DemandPriority } from '@prisma/client';

@Injectable()
export class CreateDemandUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
  ) {}

  async execute(
    dto: CreateDemandDto,
    userId?: string,
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

    return this.demandsRepository.createWithEvidences(demandInfo, []);
  }
}
