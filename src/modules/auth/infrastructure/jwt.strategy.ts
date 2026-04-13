import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { FindUserByIdUseCase } from '../../users/application/find-user-by-id.use-case';
import { JwtPayload } from '../application/jwt-token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    config: ConfigService,
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET must be defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.findUserByIdUseCase.execute(payload.sub);
    if (!user || user.disabledAt !== null) {
      throw new UnauthorizedException('Usuário não encontrado ou desativado');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      hasSetPassword: user.hasSetPassword,
      isCabinetMember: user.isCabinetMember,
    };
  }
}
