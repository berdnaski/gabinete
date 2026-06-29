import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../modules/database/prisma.service';
import { UserEntity } from '../../modules/users/domain/user.entity';

interface ActiveSubscriptionRequest {
  user?: UserEntity;
  params: Record<string, string>;
}

/**
 * Blocks the request with 403 when the resolved cabinet has no active subscription.
 * Resolves the cabinet from (in order): params.cabinetId, params.slug, or params.id
 * (treated as a demand id — falls back to the caller's own cabinet membership when
 * the demand has no cabinet yet, e.g. the "claim" flow).
 * Passes through (returns true) when no cabinet can be resolved from the request.
 */
@Injectable()
export class ActiveSubscriptionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<ActiveSubscriptionRequest>();

    const cabinetId = await this.resolveCabinetId(request);
    if (!cabinetId) return true;

    const now = new Date();
    const subscription = await this.prisma.cabinetSubscription.findFirst({
      where: {
        cabinetId,
        deletedAt: null,
        status: { in: ['ACTIVE', 'TRIALING'] },
        canceledAt: null,
        currentPeriodStart: { lte: now },
        OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gte: now } }],
      },
    });

    if (!subscription) {
      throw new ForbiddenException(
        'Este gabinete não possui uma assinatura ativa. Entre em contato com um Consultor para continuar.',
      );
    }

    return true;
  }

  private async resolveCabinetId(
    request: ActiveSubscriptionRequest,
  ): Promise<string | null> {
    const { params, user } = request;

    if (params.cabinetId) {
      return params.cabinetId;
    }

    if (params.slug) {
      const cabinet = await this.prisma.cabinet.findUnique({
        where: { slug: params.slug },
      });
      return cabinet?.id ?? null;
    }

    if (params.id) {
      const demand = await this.prisma.demand.findUnique({
        where: { id: params.id },
      });
      if (demand?.cabinetId) {
        return demand.cabinetId;
      }
      if (demand && !demand.cabinetId && user) {
        const membership = await this.prisma.cabinetMember.findFirst({
          where: { userId: user.id },
        });
        return membership?.cabinetId ?? null;
      }
    }

    return null;
  }
}
