import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ITokensRepository } from '../domain/tokens.repository.interface';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { TokenType } from '@prisma/client';

@Injectable()
export class ConfirmPasswordChangeUseCase {
  constructor(
    private readonly tokensRepository: ITokensRepository,
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(token: string): Promise<{ message: string }> {
    const tokenRecord = await this.tokensRepository.findValidToken(
      token,
      TokenType.CHANGE_PASSWORD,
    );

    if (!tokenRecord || !tokenRecord.payload) {
      throw new BadRequestException('Link inválido ou expirado.');
    }

    const user = await this.usersRepository.findById(tokenRecord.userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.usersRepository.update(user.id, {
      password: tokenRecord.payload,
      hasSetPassword: true,
    });

    await this.tokensRepository.delete(tokenRecord.id);

    return { message: 'Senha alterada com sucesso!' };
  }
}
