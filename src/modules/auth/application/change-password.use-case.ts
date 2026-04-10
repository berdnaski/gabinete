import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (user.hasSetPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          'A senha atual é obrigatória para este usuário.',
        );
      }
      const isPasswordValid = await bcryptjs.compare(
        dto.currentPassword,
        user.password || '',
      );
      if (!isPasswordValid) {
        throw new BadRequestException('A senha atual está incorreta.');
      }
    }

    const hashedPassword = await bcryptjs.hash(dto.newPassword, 10);

    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      hasSetPassword: true,
    });

    return {
      message: user.hasSetPassword
        ? 'Senha alterada com sucesso.'
        : 'Senha criada com sucesso.',
    };
  }
}
