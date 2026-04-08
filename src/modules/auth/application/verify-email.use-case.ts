import { Injectable, BadRequestException } from '@nestjs/common';
import { ITokensRepository } from '../domain/tokens.repository.interface';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { TokenType } from '@prisma/client';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly tokensRepository: ITokensRepository,
  ) {}

  async execute(token: string): Promise<{ message: string }> {
    const validToken = await this.tokensRepository.findValidToken(
      token,
      TokenType.EMAIL_VERIFICATION,
    );

    if (!validToken) {
      throw new BadRequestException(
        'Token de verificação inválido ou expirado.',
      );
    }

    await this.usersRepository.update(validToken.userId, { isVerified: true });
    await this.tokensRepository.delete(token);

    return {
      message: 'E-mail verificado com sucesso! Agora você já pode fazer login.',
    };
  }
}
