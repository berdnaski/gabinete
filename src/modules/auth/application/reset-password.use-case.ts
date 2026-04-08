import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { ITokensRepository } from '../domain/tokens.repository.interface';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { TokenType } from '@prisma/client';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly tokensRepository: ITokensRepository,
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<{ message: string }> {
    const validToken = await this.tokensRepository.findValidToken(
      dto.token,
      TokenType.PASSWORD_RESET,
    );

    if (!validToken) {
      throw new BadRequestException('Token expirado ou inválido.');
    }

    const hashedPassword = await bcryptjs.hash(dto.password, 10);

    await this.usersRepository.update(validToken.userId, {
      password: hashedPassword,
    });

    await this.tokensRepository.delete(dto.token);

    return {
      message:
        'Senha alterada com sucesso! Você já pode usar a nova credencial.',
    };
  }
}
