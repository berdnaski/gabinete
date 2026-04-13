import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { ICabinetInvitationsRepository } from '../domain/invitations.repository.interface';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';
import { QueueService } from '../../../shared/infrastructure/queue/queue.service';
import { EmailType } from '../../../shared/infrastructure/queue/queue.constants';

export interface InviteCabinetMemberInput {
  cabinetId: string;
  email: string;
  role: CabinetRole;
  senderId: string;
}

@Injectable()
export class InviteCabinetMemberUseCase {
  constructor(
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly membersRepository: ICabinetMembersRepository,
    private readonly invitationsRepository: ICabinetInvitationsRepository,
    private readonly usersRepository: IUsersRepository,
    private readonly queueService: QueueService,
  ) { }

  async execute(input: InviteCabinetMemberInput): Promise<{ message: string }> {
    const cabinet = await this.cabinetsRepository.findById(input.cabinetId);
    if (!cabinet) {
      throw new NotFoundException('Gabinete não encontrado');
    }

    const sender = await this.usersRepository.findById(input.senderId);
    if (!sender) {
      throw new NotFoundException('Remetente não encontrado');
    }

    const senderMembership = await this.membersRepository.findMembership(input.senderId, input.cabinetId);
    if (!senderMembership || senderMembership.role !== CabinetRole.OWNER) {
      throw new ForbiddenException('Apenas proprietários de gabinetes podem convidar membros');
    }

    const user = await this.usersRepository.findByEmail(input.email);
    if (user) {
      const existingMember = await this.membersRepository.findMembership(user.id, input.cabinetId);
      if (existingMember) {
        throw new ForbiddenException('O usuário já é membro deste gabinete');
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.invitationsRepository.create({
      email: input.email,
      cabinetId: input.cabinetId,
      role: input.role,
      token,
      expiresAt,
    });

    await this.queueService.sendEmail({
      type: EmailType.CABINET_INVITATION,
      email: input.email,
      token,
      cabinetName: cabinet.name,
      senderName: sender.name,
    });

    return { message: 'Convite enviado com sucesso' };
  }
}
