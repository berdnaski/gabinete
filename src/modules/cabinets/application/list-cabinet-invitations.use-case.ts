import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { ICabinetInvitationsRepository } from '../domain/invitations.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';

@Injectable()
export class ListCabinetInvitationsUseCase {
  constructor(
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly membersRepository: ICabinetMembersRepository,
    private readonly invitationsRepository: ICabinetInvitationsRepository,
  ) {}

  async execute(slug: string, userId: string) {
    const cabinet = await this.cabinetsRepository.findBySlug(slug);
    if (!cabinet) {
      throw new NotFoundException('Gabinete não encontrado');
    }

    const membership = await this.membersRepository.findMembership(
      userId,
      cabinet.id,
    );
    if (!membership || membership.role !== CabinetRole.OWNER) {
      throw new ForbiddenException(
        'Apenas proprietários de gabinetes podem listar convites',
      );
    }

    return this.invitationsRepository.findByCabinetId(cabinet.id);
  }
}
