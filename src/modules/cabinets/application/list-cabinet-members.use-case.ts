import { Injectable } from '@nestjs/common';
import { CabinetMemberEntity } from '../domain/cabinet-member.entity';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';

@Injectable()
export class ListCabinetMembersUseCase {
  constructor(private readonly membersRepository: ICabinetMembersRepository) {}

  async execute(cabinetId: string): Promise<CabinetMemberEntity[]> {
    return this.membersRepository.findByCabinetId(cabinetId);
  }
}
