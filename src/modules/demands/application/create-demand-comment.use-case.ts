import { Injectable, NotFoundException } from '@nestjs/common';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUsersRepository } from '../../users/domain/users.repository.interface';

@Injectable()
export class CreateDemandCommentUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
    private readonly usersRepository: IUsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(demandId: string, authorId: string, content: string) {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
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

    if (demand.reporterId && demand.reporterId !== authorId) {
      const author = await this.usersRepository.findById(authorId);
      this.eventEmitter.emit('demand.comment-added', {
        userId: demand.reporterId,
        authorName: author?.name || 'Alguém',
        demandTitle: demand.title,
      });
    }
  }
}
