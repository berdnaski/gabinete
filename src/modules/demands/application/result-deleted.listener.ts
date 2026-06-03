import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DemandStatus } from '@prisma/client';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { IResultsRepository } from '../../results/domain/results.repository.interface';

@Injectable()
export class ResultDeletedListener {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly resultsRepository: IResultsRepository,
  ) {}

  @OnEvent('result.deleted')
  async handle({ demandId }: { demandId: string }): Promise<void> {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand || demand.status !== DemandStatus.RESOLVED) return;

    const remaining = await this.resultsRepository.findAll({
      demandId,
      page: 1,
      limit: 1,
    });

    if (remaining.total === 0) {
      await this.demandsRepository.update(demandId, {
        status: DemandStatus.IN_PROGRESS,
      });
    }
  }
}
