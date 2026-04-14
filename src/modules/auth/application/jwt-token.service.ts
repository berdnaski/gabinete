import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenEntity } from '../domain/auth-token.entity';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  sign(user: { id: string; email: string }): AuthTokenEntity {
    const accessTokenExpiresIn = this.configService.get<number>('JWT_EXPIRES_IN', 3600);
    const refreshTokenExpiresIn = this.configService.get<number>('REFRESH_TOKEN_EXPIRES_IN', 604800);

    const payload: JwtPayload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, { expiresIn: accessTokenExpiresIn });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: refreshTokenExpiresIn });

    return { accessToken, refreshToken, expiresIn: accessTokenExpiresIn };
  }

  verify(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }
}
