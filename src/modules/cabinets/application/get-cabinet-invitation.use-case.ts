import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ICabinetInvitationsRepository } from '../domain/invitations.repository.interface';

@Injectable()
export class GetCabinetInvitationUseCase {
  constructor(
    private readonly invitationsRepository: ICabinetInvitationsRepository,
  ) {}

  async execute(token: string) {
    const invite = await this.invitationsRepository.findByToken(token);
    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }

    if (new Date() > invite.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    return {
      email: invite.email,
      role: invite.role,
      cabinetName: invite.cabinet.name,
      expiresAt: invite.expiresAt,
    };
  }
}
