import { Injectable } from '@nestjs/common';
import { UserEntity } from '../domain/user.entity';
import { IUsersRepository } from '../domain/users.repository.interface';

@Injectable()
export class FindUserByIdUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findById(id);
  }
}
