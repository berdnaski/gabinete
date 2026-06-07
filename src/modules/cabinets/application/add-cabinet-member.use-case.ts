import { Injectable, NotFoundException } from '@nestjs/common';
import { CabinetMemberEntity } from '../domain/cabinet-member.entity';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';
import { CheckMemberLimitUseCase } from '../../plans/application/check-member-limit.use-case';

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
    private readonly checkMemberLimitUseCase: CheckMemberLimitUseCase,
  ) {}

  async execute(input: AddCabinetMemberInput): Promise<CabinetMemberEntity> {
    const cabinet = await this.cabinetsRepository.findById(input.cabinetId);
    if (!cabinet) {
      throw new NotFoundException('Gabinete não encontrado');
    }

    const currentMembers = await this.membersRepository.findByCabinetId(input.cabinetId);
    await this.checkMemberLimitUseCase.execute(input.cabinetId, currentMembers.length);

    return this.membersRepository.add({
      userId: input.userId,
      cabinetId: input.cabinetId,
      role: input.role,
    });
  }
}
