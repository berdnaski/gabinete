import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
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
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await this.validatePasswordUseCase.execute(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isVerified) {
      throw new ForbiddenException('Por favor, confirme seu e-mail antes de acessar a plataforma.');
    }

    return this.jwtTokenService.sign(user);
  }
}
