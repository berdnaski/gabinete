import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleLoginUseCase } from '../application/google-login.use-case';
import { JwtTokenService } from '../application/jwt-token.service';
import { LoginUseCase } from '../application/login.use-case';
import { RegisterUseCase } from '../application/register.use-case';
import { VerifyEmailUseCase } from '../application/verify-email.use-case';
import { ForgotPasswordUseCase } from '../application/forgot-password.use-case';
import { ResetPasswordUseCase } from '../application/reset-password.use-case';
import { RequestPasswordChangeUseCase } from '../application/request-password-change.use-case';
import { ConfirmPasswordChangeUseCase } from '../application/confirm-password-change.use-case';
import { RefreshTokenUseCase } from '../application/refresh-token.use-case';
import { UsersModule } from '../../users/infrastructure/users.module';
import { CabinetsModule } from '../../cabinets/infrastructure/cabinets.module';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { ITokensRepository } from '../domain/tokens.repository.interface';
import { TokensRepository } from './tokens.repository';

@Module({
  imports: [
    UsersModule,
    CabinetsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'changeme'),
        signOptions: {
          expiresIn: parseInt(config.get<string>('JWT_EXPIRES_IN', '3600'), 10),
        },
      }),
    }),
  ],
  providers: [
    JwtTokenService,
    {
      provide: ITokensRepository,
      useClass: TokensRepository,
    },
    RegisterUseCase,
    LoginUseCase,
    VerifyEmailUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    RequestPasswordChangeUseCase,
    ConfirmPasswordChangeUseCase,
    RefreshTokenUseCase,
    JwtStrategy,
    GoogleStrategy,
    GoogleLoginUseCase,
  ],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
