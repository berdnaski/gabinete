import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { FindUserByIdUseCase } from '../../users/application/find-user-by-id.use-case';
import { JwtPayload } from '../application/jwt-token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly findUserByIdUseCase: FindUserByIdUseCase) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'changeme',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.findUserByIdUseCase.execute(payload.sub);
    if (!user || user.disabledAt !== null) {
      throw new UnauthorizedException('User not found or disabled');
    }
    return { id: user.id, email: user.email, role: user.role };
  }
}
