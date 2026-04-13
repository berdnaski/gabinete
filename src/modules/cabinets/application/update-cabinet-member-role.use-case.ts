import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';

export interface UpdateCabinetMemberRoleInput {
  slug: string;
  targetUserId: string;
  newRole: CabinetRole;
  requesterId: string;
}

@Injectable()
export class UpdateCabinetMemberRoleUseCase {
  constructor(
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly membersRepository: ICabinetMembersRepository,
  ) { }

  async execute(input: UpdateCabinetMemberRoleInput): Promise<{ message: string }> {
    const cabinet = await this.cabinetsRepository.findBySlug(input.slug);
    if (!cabinet) {
      throw new NotFoundException('Gabinete não encontrado');
    }

    const requesterMembership = await this.membersRepository.findMembership(input.requesterId, cabinet.id);
    if (!requesterMembership || requesterMembership.role !== CabinetRole.OWNER) {
      throw new ForbiddenException('Apenas proprietários de gabinetes podem atualizar as funções dos membros');
    }

    if (input.targetUserId === input.requesterId) {
      throw new BadRequestException('Você não pode alterar seu próprio cargo. Em vez disso, transfira a propriedade.');
    }

    const targetMembership = await this.membersRepository.findMembership(input.targetUserId, cabinet.id);
    if (!targetMembership) {
      throw new NotFoundException('O usuário não é membro deste gabinete');
    }

    await this.membersRepository.updateRole(input.targetUserId, cabinet.id, input.newRole);

    return { message: 'Função do membro atualizada com sucesso' };
  }
}
