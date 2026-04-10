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
      throw new NotFoundException('Demand not found');
    }

    request.demand = demand;

    if (!demand.cabinetId) {
      throw new ForbiddenException(
        'Management of global demands is restricted to administrators. Claim it for a cabinet first.',
      );
    }

    const membership = await this.cabinetMembersRepository.findMembership(
      user.id,
      demand.cabinetId,
    );

    if (!membership) {
      throw new ForbiddenException(
        'You do not have permission to manage demands from another cabinet.',
      );
    }

    const isManager =
      membership.role === CabinetRole.OWNER ||
      membership.role === CabinetRole.STAFF;

    if (!isManager) {
      throw new ForbiddenException(
        'Only cabinet owners or staff members can perform this action.',
      );
    }

    return true;
  }
}
