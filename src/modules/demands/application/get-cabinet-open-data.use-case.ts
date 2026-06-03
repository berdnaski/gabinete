import { Injectable, NotFoundException } from '@nestjs/common';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';
import { CabinetOpenData, IDemandsRepository } from '../domain/demands.repository.interface';

@Injectable()
export class GetCabinetOpenDataUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetsRepository: ICabinetsRepository,
  ) {}

  async execute(slug: string): Promise<CabinetOpenData & { cabinet: { name: string; slug: string } }> {
    const cabinet = await this.cabinetsRepository.findBySlug(slug);

    if (!cabinet) {
      throw new NotFoundException('Cabinet not found');
    }

    const openData = await this.demandsRepository.getCabinetOpenData(cabinet.id);

    return {
      cabinet: { name: cabinet.name, slug: cabinet.slug },
      ...openData,
    };
  }
}
