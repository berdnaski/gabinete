import { Injectable } from '@nestjs/common';
import { IDemandsRepository, ReporterSummaryData } from '../domain/demands.repository.interface';

@Injectable()
export class GetReporterSummaryUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(reporterId: string): Promise<ReporterSummaryData> {
    return this.demandsRepository.getReporterSummary(reporterId);
  }
}
