import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { addMonths, startOfMonth } from 'date-fns';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';
import {
  CabinetDashboardSummary,
  IDemandsRepository,
} from '../domain/demands.repository.interface';

export interface GetCabinetDashboardSummaryInput {
  cabinetSlug: string;
  userId: string;
  month?: number;
  year?: number;
}

@Injectable()
export class GetCabinetDashboardSummaryUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
  ) {}

  async execute(
    input: GetCabinetDashboardSummaryInput,
  ): Promise<CabinetDashboardSummary> {
    const cabinet = await this.cabinetsRepository.findBySlug(input.cabinetSlug);

    if (!cabinet) {
      throw new NotFoundException('Cabinet not found');
    }

    const membership = await this.cabinetMembersRepository.findMembership(
      input.userId,
      cabinet.id,
    );

    if (!membership) {
      throw new ForbiddenException(
        'You do not have permission to view dashboard data for this cabinet.',
      );
    }

    const now = new Date();
    const month = input.month ?? now.getMonth() + 1;
    const year = input.year ?? now.getFullYear();

    const startDate = startOfMonth(new Date(year, month - 1, 1));
    const endDate = addMonths(startDate, 1);

    return this.demandsRepository.getCabinetDashboardSummary(
      cabinet.id,
      startDate,
      endDate,
    );
  }
}
