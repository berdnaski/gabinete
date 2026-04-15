import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';

@Injectable()
export class LeaveCabinetUseCase {
  constructor(
    private readonly cabinetsRepository: ICabinetsRepository,
    private readonly membersRepository: ICabinetMembersRepository,
  ) {}

  async execute(slug: string, userId: string): Promise<{ message: string }> {
    const cabinet = await this.cabinetsRepository.findBySlug(slug);
    if (!cabinet) {
      throw new NotFoundException('Gabinete não encontrado');
    }

    const membership = await this.membersRepository.findMembership(
      userId,
      cabinet.id,
    );
    if (!membership) {
      throw new ForbiddenException('Você não é membro deste gabinete');
    }

    if (membership.role === CabinetRole.OWNER) {
      throw new BadRequestException(
        'Proprietários não podem sair do gabinete. Transfira a propriedade primeiro ou exclua o gabinete.',
      );
    }

    await this.membersRepository.remove(cabinet.id, userId);

    return { message: 'You have left the cabinet successfully' };
  }
}
