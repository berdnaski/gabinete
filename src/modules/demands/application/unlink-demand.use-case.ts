import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';

@Injectable()
export class UnlinkDemandUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
  ) {}

  async execute(demandId: string, userId: string) {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }

    if (!demand.cabinetId) {
      throw new BadRequestException(
        'Esta demanda não está vinculada a nenhum gabinete',
      );
    }

    const membership = await this.cabinetMembersRepository.findMembership(
      userId,
      demand.cabinetId,
    );

    if (!membership) {
      throw new ForbiddenException(
        'Você não tem permissão para desvincular esta demanda',
      );
    }

    return this.demandsRepository.update(demandId, {
      cabinetId: null,
      assigneeMemberId: null,
    });
  }
}
