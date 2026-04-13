import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, UserEntity } from '../../modules/users/domain/user.entity';
import { IDemandsRepository } from '../../modules/demands/domain/demands.repository.interface';
import { ICabinetMembersRepository } from '../../modules/cabinets/domain/cabinet-members.repository.interface';
import { CabinetRole } from '../../modules/cabinets/domain/cabinet-role.enum';
import { DemandEntity } from '../../modules/demands/domain/demand.entity';

@Injectable()
export class DemandAccessGuard implements CanActivate {
  constructor(
    private readonly demandsRepository: IDemandsRepository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user: UserEntity;
      params: Record<string, string>;
      demand?: DemandEntity;
    }>();
    const { user, params } = request;

    if (!user) {
      return false;
    }

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const demandId = params.id;
    if (!demandId) {
      return true;
    }

    const demand = await this.demandsRepository.findById(demandId);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada');
    }

    request.demand = demand;

    if (!demand.cabinetId) {
      throw new ForbiddenException(
        'O gerenciamento de demandas globais é restrito a administradores. Reivindique-a para um gabinete primeiro.',
      );
    }

    const membership = await this.cabinetMembersRepository.findMembership(
      user.id,
      demand.cabinetId,
    );

    if (!membership) {
      throw new ForbiddenException(
        'Você não tem permissão para gerenciar demandas de outro gabinete.',
      );
    }

    const isManager =
      membership.role === CabinetRole.OWNER ||
      membership.role === CabinetRole.STAFF;

    if (!isManager) {
      throw new ForbiddenException(
        'Apenas proprietários de gabinetes ou membros da equipe podem realizar esta ação.',
      );
    }

    return true;
  }
}
