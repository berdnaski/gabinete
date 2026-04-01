import { Injectable, NotFoundException } from '@nestjs/common';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';

@Injectable()
export class RemoveCabinetMemberUseCase {
  constructor(private readonly membersRepository: ICabinetMembersRepository) {}

  async execute(cabinetId: string, userId: string): Promise<void> {
    const membership = await this.membersRepository.findMembership(userId, cabinetId);
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }
    await this.membersRepository.remove(cabinetId, userId);
  }
}
