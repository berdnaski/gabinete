import { ConflictException, Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { UserEntity } from '../domain/user.entity';
import { IUsersRepository } from '../domain/users.repository.interface';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(data: CreateUserInput): Promise<UserEntity> {
    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    const user = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });
    await this.usersRepository.claimGuestDemands(user.id, user.email);
    return user;
  }
}
