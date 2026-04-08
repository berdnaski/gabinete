import { Injectable } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { PaginationParams } from 'src/shared/domain/pagination.interface';

@Injectable()
export class ListDemandCommentsUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(demandId: string, params: PaginationParams) {
    return this.demandsRepository.listComments(demandId, params);
  }
}
