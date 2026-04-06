import { Injectable } from "@nestjs/common";
import { DemandPriority, DemandStatus } from "@prisma/client";
import { PaginationHelper } from "../../../shared/application/pagination.helper";
import { IDemandsRepository } from "../domain/demands.repository.interface";

export interface ListDemandsInput {
  cabinetId?: string;
  status?: DemandStatus;
  priority?: DemandPriority;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListDemandsUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
  ) { }

  async execute(input: ListDemandsInput) {
    const { page, limit } = PaginationHelper.getSkipTake(input);

    const { items, total } = await this.demandsRepository.findAll({
      cabinetId: input.cabinetId,
      categoryId: input.categoryId,
      status: input.status,
      priority: input.priority,
      search: input.search,
      page,
      limit,
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / (limit || 10)),
      },
    };
  }
}