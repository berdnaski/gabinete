import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { GoogleUser } from '../infrastructure/google.strategy';
import { JwtTokenService } from './jwt-token.service';
import { AuthTokenEntity } from '../domain/auth-token.entity';
import { ITokensRepository } from '../domain/tokens.repository.interface';
import { TokenType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly jwtTokenService: JwtTokenService,
    private readonly tokensRepository: ITokensRepository,
  ) { }

  async execute(googleUser: GoogleUser): Promise<AuthTokenEntity> {
    let user = await this.usersRepository.findByProvider(
      googleUser.provider,
      googleUser.providerAccountId,
    );

    if (!user) {
      const existingUser = await this.usersRepository.findByEmail(
        googleUser.email,
      );

      if (existingUser) {
        await this.usersRepository.linkAccount({
          userId: existingUser.id,
          provider: googleUser.provider,
          providerAccountId: googleUser.providerAccountId,
        });
        user = existingUser;
      } else {
        const randomValue = crypto.randomUUID();
        const hashedPassword = await bcrypt.hash(randomValue, 10);

        user = await this.usersRepository.createWithAccount({
          name: googleUser.name,
          email: googleUser.email,
          password: hashedPassword,
          provider: googleUser.provider,
          providerAccountId: googleUser.providerAccountId,
        });

        await this.usersRepository.claimGuestDemands(user.id, user.email);
      }
    }

    const tokens = this.jwtTokenService.sign({
      id: user.id,
      email: user.email,
    });

    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const refreshTokenExpiresIn = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? '604800', 10);
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + refreshTokenExpiresIn);

    await this.tokensRepository.upsert({
      userId,
      type: TokenType.REFRESH_TOKEN,
      payload: refreshToken,
      expiresAt,
    });
  }
}
