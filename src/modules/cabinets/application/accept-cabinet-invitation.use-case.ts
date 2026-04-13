import { EventEmitter2 } from '@nestjs/event-emitter';
import { ICabinetInvitationsRepository } from '../domain/invitations.repository.interface';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { UserRole } from '../../users/domain/user.entity';
import { CabinetRole } from '../domain/cabinet-role.enum';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AcceptCabinetInvitationUseCase {
  constructor(
    private readonly invitationsRepository: ICabinetInvitationsRepository,
    private readonly membersRepository: ICabinetMembersRepository,
    private readonly usersRepository: IUsersRepository,
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly eventEmitter: EventEmitter2,
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

    if (user.role === UserRole.CITIZEN) {
      await this.usersRepository.updateRole(user.id, UserRole.MEMBER);
    }

    await this.invitationsRepository.delete(invite.id);

    // Notificar o proprietário do gabinete
    const cabinet = await this.cabinetsRepository.findById(invite.cabinetId);
    const members = await this.membersRepository.findByCabinetId(invite.cabinetId);
    const owner = members.find((m) => m.role === CabinetRole.OWNER);

    if (owner && cabinet) {
      this.eventEmitter.emit('cabinet.member-joined', {
        cabinetId: cabinet.id,
        ownerId: owner.userId,
        memberName: user.name,
        cabinetName: cabinet.name,
      });
    }

    return { message: 'Convite aceito com sucesso' };
  }
}
