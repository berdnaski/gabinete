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
      throw new NotFoundException('Cabinet not found');
    }

    const requesterMembership = await this.membersRepository.findMembership(input.requesterId, cabinet.id);
    if (!requesterMembership || requesterMembership.role !== CabinetRole.OWNER) {
      throw new ForbiddenException('Only cabinet owners can update member roles');
    }

    if (input.targetUserId === input.requesterId) {
      throw new BadRequestException('You cannot change your own role. Transfer ownership instead.');
    }

    const targetMembership = await this.membersRepository.findMembership(input.targetUserId, cabinet.id);
    if (!targetMembership) {
      throw new NotFoundException('User is not a member of this cabinet');
    }

    await this.membersRepository.updateRole(input.targetUserId, cabinet.id, input.newRole);

    return { message: `Member role updated to ${input.newRole} successfully` };
  }
}
