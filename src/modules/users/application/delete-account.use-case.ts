import { Injectable, NotFoundException } from '@nestjs/common';
import { IUsersRepository } from '../domain/users.repository.interface';

@Injectable()
export class DeleteAccountUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Perform soft delete by setting disabledAt
    await this.usersRepository.update(id, { disabledAt: new Date() });
  }
}
