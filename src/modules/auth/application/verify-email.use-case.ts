import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TokenService } from './token.service';
import { TokenType } from '@prisma/client';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(token: string): Promise<{ message: string }> {
    const userId = await this.tokenService.validateToken(
      token,
      TokenType.EMAIL_VERIFICATION,
    );

    if (!userId) {
      throw new BadRequestException(
        'Token de verificação inválido ou expirado.',
      );
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      }),
      this.prisma.token.delete({
        where: { id: token },
      }),
    ]);

    return {
      message: 'E-mail verificado com sucesso! Agora você já pode fazer login.',
    };
  }
}
