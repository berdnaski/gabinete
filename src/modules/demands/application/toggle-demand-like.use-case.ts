import { EventEmitter2 } from '@nestjs/event-emitter';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ToggleDemandLikeUseCase {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly usersRepository: IUsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async execute(demandId: string, userId: string): Promise<boolean> {
    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }

    const isLiked = await this.demandsRepository.toggleLike(demandId, userId);

    if (isLiked) {
      const liker = await this.usersRepository.findById(userId);
      this.eventEmitter.emit('demand.liked', {
        demandId,
        reporterId: demand.reporterId,
        demandTitle: demand.title,
        likerName: liker?.name || 'Alguém',
      });
    }

    return isLiked;
  }
}
