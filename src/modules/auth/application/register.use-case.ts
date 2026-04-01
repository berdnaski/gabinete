import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from '../../users/application/create-user.use-case';
import { AuthTokenEntity } from '../domain/auth-token.entity';
import { RegisterDto } from '../dto/register.dto';
import { JwtTokenService } from './jwt-token.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthTokenEntity> {
    const user = await this.createUserUseCase.execute(dto);
    return this.jwtTokenService.sign(user);
  }
}
