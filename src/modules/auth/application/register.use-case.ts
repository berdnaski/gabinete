import { Injectable, Logger } from '@nestjs/common';
import { TokenType } from '@prisma/client';
import { CreateUserUseCase } from '../../users/application/create-user.use-case';
import { RegisterDto } from '../dto/register.dto';
import { TokenService } from './token.service';
import { MailService } from '../../../shared/mail/application/mail.service';

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  async execute(dto: RegisterDto): Promise<{ message: string }> {
    const user = await this.createUserUseCase.execute(dto);

    try {
      const token = await this.tokenService.generateToken(
        user.id,
        TokenType.EMAIL_VERIFICATION,
      );
      await this.mailService.sendVerificationEmail(user.email, token);
    } catch (error) {
      this.logger.error(
        `Falha ao processar e-mail de verificação para ${user.email}`,
        error,
      );
    }

    return {
      message:
        'Usuário registrado com sucesso. Por favor, verifique sua caixa de e-mail para ativar sua conta.',
    };
  }
}
