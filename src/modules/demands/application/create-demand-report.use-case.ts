import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';

@Injectable()
export class CreateDemandReportUseCase {
  constructor(private readonly demandsRepository: IDemandsRepository) {}

  async execute(demandId: string, userId: string, reason: string): Promise<void> {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }

    const isDismissed = await this.demandsRepository.hasDismissedReports(demandId);
    if (isDismissed) {
      throw new ForbiddenException('Esta demanda foi revisada e não aceita novas denúncias');
    }

    await this.demandsRepository.createReport({
      demandId,
      userId,
      reason,
    });
  }
}

