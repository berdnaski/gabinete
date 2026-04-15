import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenType } from '@prisma/client';
import { FindUserByEmailUseCase } from '../../users/application/find-user-by-email.use-case';
import { ValidatePasswordUseCase } from '../../users/application/validate-password.use-case';
import { ITokensRepository } from '../domain/tokens.repository.interface';
import { LoginDto } from '../dto/login.dto';
import { JwtTokenService } from './jwt-token.service';
import { AuthTokenEntity } from '../domain/auth-token.entity';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly validatePasswordUseCase: ValidatePasswordUseCase,
    private readonly jwtTokenService: JwtTokenService,
    private readonly tokensRepository: ITokensRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthTokenEntity> {
    const user = await this.findUserByEmailUseCase.execute(dto.email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await this.validatePasswordUseCase.execute(
      dto.password,
      user.password,
    );
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isVerified) {
      throw new ForbiddenException(
        'Por favor, confirme seu e-mail antes de acessar a plataforma.',
      );
    }

    const tokens = this.jwtTokenService.sign(user);
    const refreshTokenExpiresIn = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRES_IN',
      604800,
    );
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + refreshTokenExpiresIn);

    await this.tokensRepository.upsert({
      userId: user.id,
      type: TokenType.REFRESH_TOKEN,
      payload: tokens.refreshToken,
      expiresAt,
    });

    return tokens;
  }
}
