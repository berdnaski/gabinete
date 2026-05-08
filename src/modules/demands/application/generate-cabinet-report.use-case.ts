import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { subDays } from 'date-fns';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';
import {
  CabinetReportData,
  IDemandsRepository,
} from '../domain/demands.repository.interface';

export interface GenerateCabinetReportInput {
  cabinetSlug: string;
  userId: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class GenerateCabinetReportUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
  ) {}

  async execute(input: GenerateCabinetReportInput): Promise<CabinetReportData> {
    const cabinet = await this.cabinetsRepository.findBySlug(input.cabinetSlug);
    if (!cabinet) throw new NotFoundException('Gabinete não encontrado');

    const membership = await this.cabinetMembersRepository.findMembership(
      input.userId,
      cabinet.id,
    );
    if (!membership) {
      throw new ForbiddenException('Sem permissão para acessar este gabinete');
    }

    const end = input.endDate ? new Date(input.endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const start = input.startDate
      ? new Date(input.startDate)
      : subDays(new Date(), 29);
    start.setHours(0, 0, 0, 0);

    if (start >= end) {
      throw new BadRequestException(
        'A data de início deve ser anterior à data de término',
      );
    }

    return this.demandsRepository.getCabinetReport(cabinet.id, start, end);
  }
}
