import { ConflictException, Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { UserEntity, UserRole } from '../../users/domain/user.entity';

export interface CreateAdminUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl?: string;
}

@Injectable()
export class CreateAdminUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(input: CreateAdminUserInput): Promise<UserEntity> {
    const existing = await this.usersRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('O e-mail informado já está em uso');
    }

    const hashedPassword = await bcryptjs.hash(input.password, 10);

    const user = await this.usersRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      termsAcceptedAt: new Date(),
    });

    await this.usersRepository.update(user.id, {
      isVerified: true,
      hasSetPassword: true,
      avatarUrl: input.avatarUrl,
      termsAcceptedAt: new Date(),
    });

    const withRole = await this.usersRepository.updateRole(user.id, input.role);

    await this.usersRepository.claimGuestDemands(withRole.id, withRole.email);

    return withRole;
  }
}

