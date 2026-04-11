import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ITokensRepository } from '../domain/tokens.repository.interface';
import { TokenType } from '@prisma/client';
import { JwtTokenService } from './jwt-token.service';
import { AuthTokenEntity } from '../domain/auth-token.entity';
import { FindUserByIdUseCase } from '../../users/application/find-user-by-id.use-case';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly tokensRepository: ITokensRepository,
    private readonly findUserById: FindUserByIdUseCase,
  ) { }

  async execute(refreshToken: string): Promise<AuthTokenEntity> {
    try {
      const payload = this.jwtTokenService.verify(refreshToken);
      const userId = payload.sub;

      const tokenRecord = await this.tokensRepository.findValidTokenByPayload(
        refreshToken,
        TokenType.REFRESH_TOKEN,
      );

      if (!tokenRecord || tokenRecord.userId !== userId) {
        throw new UnauthorizedException('Refresh token inválido ou revogado');
      }

      const user = await this.findUserById.execute(userId);

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const tokens = this.jwtTokenService.sign(user);

      const refreshTokenExpiresIn = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? '604800', 10);
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + refreshTokenExpiresIn);

      await this.tokensRepository.upsert({
        userId: user.id,
        type: TokenType.REFRESH_TOKEN,
        payload: tokens.refreshToken,
        expiresAt: expiresAt,
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Não foi possível renovar o token');
    }
  }
}
