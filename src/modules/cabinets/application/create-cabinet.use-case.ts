import { Injectable } from '@nestjs/common';
import { resolveUniqueSlug, toBaseSlug } from '../../../shared/utils/slug.util';
import { CabinetMemberEntity } from '../domain/cabinet-member.entity';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';
import { CabinetEntity } from '../domain/cabinet.entity';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';

export interface CreateCabinetInput {
  name: string;
  description?: string;
  avatarUrl?: string;
  ownerUserId: string;
}

export interface CreateCabinetOutput {
  cabinet: CabinetEntity;
  ownerMember: CabinetMemberEntity;
}

@Injectable()
export class CreateCabinetUseCase {
  constructor(
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly membersRepository: ICabinetMembersRepository,
  ) {}

  async execute(input: CreateCabinetInput): Promise<CreateCabinetOutput> {
    const baseSlug = toBaseSlug(input.name);
    const existingSlugs =
      await this.cabinetsRepository.findSlugsByBaseName(baseSlug);
    const slug = resolveUniqueSlug(baseSlug, existingSlugs);

    const cabinet = await this.cabinetsRepository.create({
      name: input.name,
      slug,
      description: input.description,
      avatarUrl: input.avatarUrl,
    });

    const ownerMember = await this.membersRepository.add({
      userId: input.ownerUserId,
      cabinetId: cabinet.id,
      role: CabinetRole.OWNER,
    });

    return { cabinet, ownerMember };
  }
}
