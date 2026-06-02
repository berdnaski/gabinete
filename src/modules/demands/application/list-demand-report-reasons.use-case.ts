import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationHelper } from 'src/shared/application/pagination.helper';
import { PaginationParams } from 'src/shared/domain/pagination.interface';
import { IDemandsRepository } from '../domain/demands.repository.interface';

@Injectable()
export class ListDemandReportReasonsUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(demandId: string, params: PaginationParams) {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }
    const pagination = PaginationHelper.getSkipTake(params);
    const { items, total } = await this.demandsRepository.listReportReasons(demandId, params);
    return PaginationHelper.buildResponse(items, total, pagination);
  }
}
