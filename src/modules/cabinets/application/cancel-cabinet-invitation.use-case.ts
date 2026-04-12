import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { ICabinetInvitationsRepository } from '../domain/invitations.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';

@Injectable()
export class CancelCabinetInvitationUseCase {
  constructor(
    private readonly membersRepository: ICabinetMembersRepository,
    private readonly invitationsRepository: ICabinetInvitationsRepository,
  ) { }

  async execute(invitationId: string, userId: string): Promise<{ message: string }> {
    const invite = await this.invitationsRepository.findById(invitationId);
    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }

    const membership = await this.membersRepository.findMembership(userId, invite.cabinetId);
    if (!membership || membership.role !== CabinetRole.OWNER) {
      throw new ForbiddenException('Only cabinet owners can cancel invitations');
    }

    await this.invitationsRepository.delete(invitationId);

    return { message: 'Invitation canceled successfully' };
  }
}
