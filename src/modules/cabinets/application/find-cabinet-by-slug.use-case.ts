import { Injectable, NotFoundException } from '@nestjs/common';
import { CabinetEntity } from '../domain/cabinet.entity';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';

@Injectable()
export class FindCabinetBySlugUseCase {
  constructor(private readonly cabinetsRepository: ICabinetsRepository) {}

  async execute(slug: string): Promise<CabinetEntity> {
    const cabinet = await this.cabinetsRepository.findBySlug(slug);
    if (!cabinet) {
      throw new NotFoundException(`Cabinet with slug "${slug}" not found`);
    }
    return cabinet;
  }
}
