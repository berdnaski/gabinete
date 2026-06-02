import { Injectable, NotFoundException } from '@nestjs/common';
import { IUsersRepository } from '../../users/domain/users.repository.interface';

@Injectable()
export class EnableUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.usersRepository.findByIdIncludingDisabled(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    await this.usersRepository.update(userId, { disabledAt: null });
  }
}
