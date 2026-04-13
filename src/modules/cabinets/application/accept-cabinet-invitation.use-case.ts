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
      throw new NotFoundException('Convite não encontrado');
    }

    if (new Date() > invite.expiresAt) {
      throw new BadRequestException('O convite expirou');
    }

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new ForbiddenException('Este convite foi enviado para um endereço de e-mail diferente');
    }

    const existingMember = await this.membersRepository.findMembership(userId, invite.cabinetId);
    if (existingMember) {
      await this.invitationsRepository.delete(invite.id);
      return { message: 'O usuário já é membro deste gabinete' };
    }

    await this.membersRepository.add({
      userId: user.id,
      cabinetId: invite.cabinetId,
      role: invite.role,
    });

    await this.invitationsRepository.delete(invite.id);

    return { message: 'Convite aceito com sucesso' };
  }
}
