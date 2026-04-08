import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { TokenService } from './token.service';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { TokenType } from '@prisma/client';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<{ message: string }> {
    const userId = await this.tokenService.validateToken(
      dto.token,
      TokenType.PASSWORD_RESET,
    );

    if (!userId) {
      throw new BadRequestException('Token expirado ou inválido.');
    }

    const hashedPassword = await bcryptjs.hash(dto.password, 10);

    await this.usersRepository.update(userId, {
      password: hashedPassword,
    });

    await this.tokenService.deleteToken(dto.token);

    return {
      message:
        'Senha alterada com sucesso! Você já pode usar a nova credencial.',
    };
  }
}
