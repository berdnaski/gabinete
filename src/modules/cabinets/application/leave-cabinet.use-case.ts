import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';

@Injectable()
export class LeaveCabinetUseCase {
  constructor(
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly membersRepository: ICabinetMembersRepository,
  ) { }

  async execute(slug: string, userId: string): Promise<{ message: string }> {
    const cabinet = await this.cabinetsRepository.findBySlug(slug);
    if (!cabinet) {
      throw new NotFoundException('Cabinet not found');
    }

    const membership = await this.membersRepository.findMembership(userId, cabinet.id);
    if (!membership) {
      throw new BadRequestException('You are not a member of this cabinet');
    }

    // Se for o OWNER, verificar se ele é o único dono.
    // Em um sistema real, ele precisaria deletar o gabinete ou transferir a posse.
    if (membership.role === CabinetRole.OWNER) {
      throw new BadRequestException('As the cabinet owner, you cannot leave. Transfer ownership or delete the cabinet instead.');
    }

    await this.membersRepository.remove(cabinet.id, userId);

    return { message: 'You have left the cabinet successfully' };
  }
}
