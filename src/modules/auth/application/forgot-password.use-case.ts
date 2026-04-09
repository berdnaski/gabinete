import { Injectable, Logger } from '@nestjs/common';
import ms, { StringValue } from 'ms';
import { FindUserByEmailUseCase } from '../../users/application/find-user-by-email.use-case';
import { ITokensRepository } from '../domain/tokens.repository.interface';
import { QueueService } from '../../../shared/infrastructure/queue/queue.service';
import { EmailType } from '../../../shared/infrastructure/queue/queue.constants';
import { TokenType } from '@prisma/client';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly tokensRepository: ITokensRepository,
    private readonly queueService: QueueService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.findUserByEmailUseCase.execute(dto.email);

    if (user) {
      try {
        const expirationMs = ms((process.env.TOKEN_EXPIRATION as StringValue) || '24h');

        const tokenRecord = await this.tokensRepository.upsert({
          userId: user.id,
          type: TokenType.PASSWORD_RESET,
          expiresAt: new Date(Date.now() + expirationMs),
        });

        await this.queueService.sendEmail({
          type: EmailType.PASSWORD_RESET,
          email: user.email,
          token: tokenRecord.id,
        });
      } catch (error) {
        this.logger.error(
          `Failed to enqueue password reset email for ${dto.email}`,
          error,
        );
      }
    }

    return {
      message:
        'If the email exists in our system, you will receive a recovery link shortly.',
    };
  }
}
