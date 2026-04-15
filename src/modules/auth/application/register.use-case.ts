import { Injectable, Logger } from '@nestjs/common';
import ms, { StringValue } from 'ms';
import { TokenType } from '@prisma/client';
import { CreateUserUseCase } from '../../users/application/create-user.use-case';
import { RegisterDto } from '../dto/register.dto';
import { ITokensRepository } from '../domain/tokens.repository.interface';
import { QueueService } from '../../../shared/infrastructure/queue/queue.service';
import { EmailType } from '../../../shared/infrastructure/queue/queue.constants';

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly tokensRepository: ITokensRepository,
    private readonly queueService: QueueService,
  ) {}

  async execute(dto: RegisterDto): Promise<{ message: string }> {
    const user = await this.createUserUseCase.execute(dto);

    try {
      const expirationMs = ms(
        (process.env.TOKEN_EXPIRATION as StringValue) || '24h',
      );

      const tokenRecord = await this.tokensRepository.upsert({
        userId: user.id,
        type: TokenType.EMAIL_VERIFICATION,
        expiresAt: new Date(Date.now() + expirationMs),
      });

      await this.queueService.sendEmail({
        type: EmailType.VERIFICATION,
        email: user.email,
        token: tokenRecord.id,
      });
    } catch (error) {
      this.logger.error(
        `Failed to enqueue verification email for ${user.email}`,
        error,
      );
    }

    return {
      message:
        'User registered successfully. Please check your email to activate your account.',
    };
  }
}
