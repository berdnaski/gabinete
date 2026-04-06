import { Injectable, Logger } from '@nestjs/common';
import { FindUserByEmailUseCase } from '../../users/application/find-user-by-email.use-case';
import { TokenService } from './token.service';
import { MailService } from '../../../shared/mail/application/mail.service';
import { TokenType } from '@prisma/client';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.findUserByEmailUseCase.execute(dto.email);

    if (user) {
      try {
        const token = await this.tokenService.generateToken(user.id, TokenType.PASSWORD_RESET);
        await this.mailService.sendPasswordResetEmail(user.email, token);
      } catch (error) {
        this.logger.error(`Falha ao disparar e-mail de reset de senha para ${dto.email}`, error);
      }
    }

    return { message: 'Se o e-mail existir em nossa base, você receberá um link de recuperação em breve.' };
  }
}
