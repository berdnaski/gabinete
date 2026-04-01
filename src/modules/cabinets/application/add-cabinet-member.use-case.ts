import { Injectable, NotFoundException } from '@nestjs/common';
import { CabinetMemberEntity } from '../domain/cabinet-member.entity';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';

export interface AddCabinetMemberInput {
  cabinetId: string;
  userId: string;
  role: CabinetRole;
}

@Injectable()
export class AddCabinetMemberUseCase {
  constructor(
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly membersRepository: ICabinetMembersRepository,
  ) {}

  async execute(input: AddCabinetMemberInput): Promise<CabinetMemberEntity> {
    const cabinet = await this.cabinetsRepository.findById(input.cabinetId);
    if (!cabinet) {
      throw new NotFoundException('Cabinet not found');
    }

    return this.membersRepository.add({
      userId: input.userId,
      cabinetId: input.cabinetId,
      role: input.role,
    });
  }
}
