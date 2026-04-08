import { Injectable, NotFoundException } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { UpdateDemandDto } from '../dto/update-demand.dto';

@Injectable()
export class UpdateDemandUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(id: string, dto: UpdateDemandDto) {
    const demand = await this.demandsRepository.findById(id);

    if (!demand) {
      throw new NotFoundException('Demand not found');
    }

    return this.demandsRepository.update(id, dto);
  }
}
