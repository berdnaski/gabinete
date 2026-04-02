import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleLoginUseCase } from '../application/google-login.use-case';
import { JwtTokenService } from '../application/jwt-token.service';
import { LoginUseCase } from '../application/login.use-case';
import { RegisterUseCase } from '../application/register.use-case';
import { UsersModule } from '../../users/infrastructure/users.module';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
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
    RegisterUseCase,
    LoginUseCase,
    JwtStrategy,
    GoogleStrategy,
    GoogleLoginUseCase,
  ],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
