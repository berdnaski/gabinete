import { BadRequestException, Injectable } from '@nestjs/common';
import { CabinetRole } from '../../cabinets/domain/cabinet-role.enum';
import { resolveUniqueSlug, toBaseSlug } from '../../../shared/utils/slug.util';
import { UserRole } from '../../users/domain/user.entity';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';

export interface CreateCabinetWithOwnerInput {
  ownerUserId: string;
  name: string;
  email?: string;
  description?: string;
  avatarUrl?: string;
}

@Injectable()
export class CreateCabinetWithOwnerUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly membersRepository: ICabinetMembersRepository,
  ) {}

  async execute(input: CreateCabinetWithOwnerInput) {

    const ownerUser = await this.usersRepository.findById(input.ownerUserId);
    if (!ownerUser || ownerUser.role !== UserRole.MEMBER) {
      throw new BadRequestException('Usuário responsável não encontrado.');
    }

    const baseSlug = toBaseSlug(input.name);
    const existingSlugs = await this.cabinetsRepository.findSlugsByBaseName(baseSlug);
    const slug = resolveUniqueSlug(baseSlug, existingSlugs);

    const cabinet = await this.cabinetsRepository.create({
      slug,
      name: input.name,
      email: input.email,
      description: input.description,
      avatarUrl: input.avatarUrl,
    });

    const ownerMember = await this.membersRepository.add({
      userId: ownerUser.id,
      cabinetId: cabinet.id,
      role: CabinetRole.OWNER,
    });

    return {
      cabinet,
      ownerUser: {
        id: ownerUser.id,
        name: ownerUser.name,
        email: ownerUser.email,
        role: ownerUser.role,
        phone: ownerUser.phone,
      },
      ownerMember,
    };
  }
}
