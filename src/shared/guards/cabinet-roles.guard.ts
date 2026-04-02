import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CABINET_ROLES_KEY } from '../decorators/cabinet-roles.decorator';
import { CabinetRole } from '../../modules/cabinets/domain/cabinet-role.enum';
import { UserRole } from '../../modules/users/domain/user.entity';
import { PrismaService } from '../../modules/database/prisma.service';

@Injectable()
export class CabinetRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<CabinetRole[]>(CABINET_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user, params } = request;

    if (!user) {
      return false;
    }

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const slug = params.slug;
    if (!slug) {
      throw new ForbiddenException('Missing slug parameter for cabinet authorization');
    }

    const cabinet = await this.prisma.cabinet.findUnique({
      where: { slug }
    });

    if (!cabinet) {
      return true; 
    }

    const membership = await this.prisma.cabinetMember.findUnique({
      where: {
        userId_cabinetId: {
          userId: user.id,
          cabinetId: cabinet.id,
        }
      }
    });

    if (!membership) {
      throw new ForbiddenException('Você não pertence a este gabinete.');
    }

    if (!requiredRoles.includes(membership.role as CabinetRole)) {
      throw new ForbiddenException('Você não tem o cargo necessário neste gabinete para realizar esta ação.');
    }

    return true;
  }
}
