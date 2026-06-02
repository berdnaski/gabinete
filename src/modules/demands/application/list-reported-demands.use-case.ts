import { Injectable } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { DemandEntity } from '../domain/demand.entity';
import { PaginationHelper } from '../../../shared/application/pagination.helper';
import { PaginatedResponse } from '../../../shared/domain/pagination.interface';

export interface ListReportedDemandsOutput {
  demand: DemandEntity;
  reportsCount: number;
  firstReportedAt: Date;
}

@Injectable()
export class ListReportedDemandsUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(params: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ListReportedDemandsOutput>> {
    const { page, limit } = PaginationHelper.getSkipTake(params);

    const { items, total } = await this.demandsRepository.listReportedDemands({
      page,
      limit,
    });

    return PaginationHelper.buildResponse(
      items.map((item) => ({
        demand: item.demand,
        reportsCount: item.reportsCount,
        firstReportedAt: item.firstReportedAt,
      })),
      total,
      { page, limit },
    );
  }
}
