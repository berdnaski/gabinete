import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';

@Injectable()
export class FindDemandUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) { }

  async execute(id: string) {
    const demand = await this.demandsRepository.findById(id);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }
    if (demand.cabinetId) {
      throw new BadRequestException('Esta demanda já está vinculada a um gabinete');
    }
    return demand;
  }
}
