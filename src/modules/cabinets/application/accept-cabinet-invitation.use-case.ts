import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ICabinetInvitationsRepository } from '../domain/invitations.repository.interface';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { IUsersRepository } from '../../users/domain/users.repository.interface';

@Injectable()
export class AcceptCabinetInvitationUseCase {
  constructor(
    private readonly invitationsRepository: ICabinetInvitationsRepository,
    private readonly membersRepository: ICabinetMembersRepository,
    private readonly usersRepository: IUsersRepository,
  ) { }

  async execute(token: string, userId: string): Promise<{ message: string }> {
    const invite = await this.invitationsRepository.findByToken(token);
    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }

    if (new Date() > invite.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new ForbiddenException('This invitation was sent to a different email address');
    }

    const existingMember = await this.membersRepository.findMembership(userId, invite.cabinetId);
    if (existingMember) {
      await this.invitationsRepository.delete(invite.id);
      return { message: 'User is already a member of this cabinet' };
    }

    await this.membersRepository.add({
      userId: user.id,
      cabinetId: invite.cabinetId,
      role: invite.role,
    });

    await this.invitationsRepository.delete(invite.id);

    return { message: 'Invitation accepted successfully' };
  }
}
