import { Injectable } from '@nestjs/common';
import { UserEntity } from '../domain/user.entity';
import { IUsersRepository } from '../domain/users.repository.interface';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findByEmail(email);
  }
}
