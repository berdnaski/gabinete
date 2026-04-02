import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../modules/users/domain/user.entity';
import { PrismaService } from '../../modules/database/prisma.service';

@Injectable()
export class DemandAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
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

    const demand = await this.prisma.demand.findUnique({
      where: { id: demandId }
    });

    if (!demand) {
      return true;
    }

    // Reporter always allowed
    if (demand.reporterId === user.id) {
      return true;
    }

    // If demand doesn't belong to a cabinet, and not reporter, forbidden.
    if (!demand.cabinetId) {
      throw new ForbiddenException('Acesso negado. Você só pode adicionar evidências nas suas próprias demandas.');
    }

    // Check if user is STAFF/OWNER in the cabinet
    const membership = await this.prisma.cabinetMember.findUnique({
      where: {
        userId_cabinetId: {
          userId: user.id,
          cabinetId: demand.cabinetId,
        }
      }
    });

    if (!membership) {
      throw new ForbiddenException('Você não tem permissão para adicionar evidências a esta demanda.');
    }

    return true;
  }
}
