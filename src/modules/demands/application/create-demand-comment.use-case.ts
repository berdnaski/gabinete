import { Injectable, NotFoundException } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';

@Injectable()
export class CreateDemandCommentUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
  ) {}

  async execute(demandId: string, authorId: string, content: string) {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demand not found');
    }

    const membership = demand.cabinetId
      ? await this.cabinetMembersRepository.findMembership(
          authorId,
          demand.cabinetId,
        )
      : null;

    const isCabinetResponse = !!membership;

    await this.demandsRepository.addComment({
      demandId,
      authorId,
      content,
      isCabinetResponse,
    });
  }
}
