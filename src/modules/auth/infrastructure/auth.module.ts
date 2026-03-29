import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtTokenService } from '../application/jwt-token.service';
import { LoginUseCase } from '../application/login.use-case';
import { RegisterUseCase } from '../application/register.use-case';
import { UsersModule } from '../../users/infrastructure/users.module';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'changeme',
      signOptions: { expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? '3600', 10) },
    }),
  ],
  providers: [JwtTokenService, RegisterUseCase, LoginUseCase, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
