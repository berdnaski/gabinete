import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';

@Injectable()
export class RemoveCabinetMemberUseCase {
  constructor(private readonly membersRepository: ICabinetMembersRepository) { }

  async execute(cabinetId: string, userId: string, senderId: string): Promise<void> {
    const senderMembership = await this.membersRepository.findMembership(senderId, cabinetId);
    if (!senderMembership || senderMembership.role !== CabinetRole.OWNER) {
      throw new ForbiddenException('Only cabinet owners can remove members');
    }

    const membership = await this.membersRepository.findMembership(
      userId,
      cabinetId,
    );
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (userId === senderId) {
      throw new ForbiddenException('Owners cannot remove themselves. Delete the cabinet instead.');
    }

    await this.membersRepository.remove(cabinetId, userId);
  }
}
