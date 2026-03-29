import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenEntity } from '../domain/auth-token.entity';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(userId: string, email: string): AuthTokenEntity {
    const expiresIn = parseInt(process.env.JWT_EXPIRES_IN ?? '3600', 10);
    const payload: JwtPayload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload, { expiresIn });
    return { accessToken, expiresIn };
  }
}
