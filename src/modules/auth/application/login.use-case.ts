import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FindUserByEmailUseCase } from '../../users/application/find-user-by-email.use-case';
import { ValidatePasswordUseCase } from '../../users/application/validate-password.use-case';
import { AuthTokenEntity } from '../domain/auth-token.entity';
import { LoginDto } from '../dto/login.dto';
import { JwtTokenService } from './jwt-token.service';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly validatePasswordUseCase: ValidatePasswordUseCase,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthTokenEntity> {
    const user = await this.findUserByEmailUseCase.execute(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await this.validatePasswordUseCase.execute(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.jwtTokenService.sign(user);
  }
}
