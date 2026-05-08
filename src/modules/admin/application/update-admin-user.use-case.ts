import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { UserEntity, UserRole } from '../../users/domain/user.entity';

export interface UpdateAdminUserInput {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  avatarUrl?: string;
}

@Injectable()
export class UpdateAdminUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(input: UpdateAdminUserInput): Promise<UserEntity> {
    const existing = await this.usersRepository.findById(input.id);
    if (!existing) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (input.email && input.email !== existing.email) {
      const byEmail = await this.usersRepository.findByEmail(input.email);
      if (byEmail && byEmail.id !== existing.id) {
        throw new ConflictException('O e-mail informado já está em uso');
      }
    }

    const password = input.password
      ? await bcryptjs.hash(input.password, 10)
      : undefined;

    const updated = await this.usersRepository.update(input.id, {
      name: input.name,
      email: input.email,
      password,
      avatarUrl: input.avatarUrl,
      ...(input.password ? { hasSetPassword: true } : {}),
    });

    if (input.role && input.role !== updated.role) {
      return this.usersRepository.updateRole(input.id, input.role as unknown as UserRole);
    }

    return updated;
  }
}

