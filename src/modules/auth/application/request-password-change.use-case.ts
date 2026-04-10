import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { ITokensRepository } from '../domain/tokens.repository.interface';
import { QueueService } from '../../../shared/infrastructure/queue/queue.service';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { EmailType } from '../../../shared/infrastructure/queue/queue.constants';
import { TokenType } from '@prisma/client';

@Injectable()
export class RequestPasswordChangeUseCase {
  private readonly logger = new Logger(RequestPasswordChangeUseCase.name);

  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly tokensRepository: ITokensRepository,
    private readonly queueService: QueueService,
  ) {}

  async execute(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (user.hasSetPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          'A senha atual é obrigatória para este usuário.',
        );
      }
      const isPasswordValid = await bcryptjs.compare(
        dto.currentPassword,
        user.password || '',
      );
      if (!isPasswordValid) {
        throw new BadRequestException('A senha atual está incorreta.');
      }
    }

    const newPasswordHash = await bcryptjs.hash(dto.newPassword, 10);

    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);

    const tokenRecord = await this.tokensRepository.upsert({
      userId: user.id,
      type: TokenType.CHANGE_PASSWORD,
      expiresAt: expiration,
      payload: newPasswordHash,
    });

    try {
      await this.queueService.sendEmail({
        type: EmailType.PASSWORD_CHANGE,
        email: user.email,
        token: tokenRecord.id,
      });
    } catch (error) {
      this.logger.error(
        `Failed to enqueue password change confirmation email for ${user.email}`,
        error,
      );
    }

    return {
      message:
        'Um e-mail de confirmação foi enviado para sua caixa de entrada.',
    };
  }
}
