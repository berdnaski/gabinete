import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { GoogleUser } from '../infrastructure/google.strategy';
import { JwtTokenService } from './jwt-token.service';
import { AuthResponseDto } from '../dto/auth-response.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async execute(googleUser: GoogleUser): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findByProvider(
      googleUser.provider,
      googleUser.providerAccountId,
    );

    if (user) {
      return this.jwtTokenService.sign({
        id: user.id,
        email: user.email,
      });
    }

    const existingUser = await this.usersRepository.findByEmail(
      googleUser.email,
    );

    if (existingUser) {
      await this.usersRepository.linkAccount({
        userId: existingUser.id,
        provider: googleUser.provider,
        providerAccountId: googleUser.providerAccountId,
      });

      return this.jwtTokenService.sign({
        id: existingUser.id,
        email: existingUser.email,
      });
    }

    const randomValue = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(randomValue, 10);

    const newUser = await this.usersRepository.createWithAccount({
      name: googleUser.name,
      email: googleUser.email,
      password: hashedPassword,
      provider: googleUser.provider,
      providerAccountId: googleUser.providerAccountId,
    });

    await this.usersRepository.claimGuestDemands(newUser.id, newUser.email);

    return this.jwtTokenService.sign({
      id: newUser.id,
      email: newUser.email,
    });
  }
}
