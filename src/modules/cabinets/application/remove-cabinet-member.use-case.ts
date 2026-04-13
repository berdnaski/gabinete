import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';

@Injectable()
export class RemoveCabinetMemberUseCase {
  constructor(private readonly membersRepository: ICabinetMembersRepository) { }

  async execute(cabinetId: string, userId: string, senderId: string): Promise<void> {
    const senderMembership = await this.membersRepository.findMembership(senderId, cabinetId);
    if (!senderMembership || senderMembership.role !== CabinetRole.OWNER) {
      throw new ForbiddenException('Apenas proprietários de gabinetes podem remover membros');
    }

    const membership = await this.membersRepository.findMembership(
      userId,
      cabinetId,
    );
    if (!membership) {
      throw new NotFoundException('Membro não encontrado');
    }

    if (userId === senderId) {
      throw new ForbiddenException('Proprietários não podem se remover. Exclua o gabinete.');
    }

    await this.membersRepository.remove(cabinetId, userId);
  }
}
