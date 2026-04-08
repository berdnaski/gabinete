import { Injectable } from '@nestjs/common';
import { INotificationsRepository } from '../domain/notifications.repository.interface';
import { ListNotificationsDto } from '../dto/list-notifications.dto';

@Injectable()
export class ListNotificationsUseCase {
  constructor(
    private readonly notificationsRepository: INotificationsRepository,
  ) {}

  async execute(userId: string, params: ListNotificationsDto) {
    return this.notificationsRepository.findAllByUser(userId, params);
  }
}
