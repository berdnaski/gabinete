import { ConflictException, Injectable, Logger } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { UserEntity } from '../domain/user.entity';
import { IUsersRepository } from '../domain/users.repository.interface';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  termsAccepted?: boolean;
}

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(data: CreateUserInput): Promise<UserEntity> {
    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('O e-mail informado já está em uso');
    }
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    const user = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      termsAcceptedAt: data.termsAccepted ? new Date() : undefined,
    });

    try {
      await this.usersRepository.claimGuestDemands(user.id, user.email);
    } catch (error) {
      this.logger.error(
        `Failed to claim guest demands during user creation for ${user.email}`,
        error,
      );
    }

    return user;
  }
}
