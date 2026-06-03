import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../../users/domain/users.repository.interface';

@Injectable()
export class DisableUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      return;
    }
    await this.usersRepository.update(userId, { disabledAt: new Date() });
  }
}
