import { Injectable, NotFoundException } from '@nestjs/common';
import { IUsersRepository } from '../domain/users.repository.interface';
import { StorageService } from '../../../shared/domain/services/storage.service';

@Injectable()
export class DeleteAccountUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.storageService.delete(`avatars/${id}/avatar.jpg`).catch(() => null);
    await this.usersRepository.update(id, { disabledAt: new Date() });
  }
}
