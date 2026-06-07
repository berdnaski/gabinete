import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { FEATURE_KEY } from '../decorators/require-feature.decorator'
import { FeatureSlug } from '../constants/features'
import { OverrideType } from '../../modules/plans/domain/plans.types'
import { PrismaService } from '../../modules/database/prisma.service'
import { UserEntity } from '../../modules/users/domain/user.entity'

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<FeatureSlug>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!feature) return true

    const request = context
      .switchToHttp()
      .getRequest<{ user: UserEntity; params: Record<string, string> }>()

    const slug = request.params.slug
    if (!slug) return true

    const cabinet = await this.prisma.cabinet.findUnique({ where: { slug } })
    if (!cabinet) return true

    const sub = await this.prisma.cabinetSubscription.findFirst({
      where: {
        cabinetId: cabinet.id,
        deletedAt: null,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      include: {
        plan: {
          include: { features: { select: { featureSlug: true, effectiveFrom: true } } },
        },
      },
    })

    const planFeatures: string[] = sub?.plan.features
      .filter(
        (pf) => pf.effectiveFrom === null || pf.effectiveFrom <= sub.createdAt,
      )
      .map((pf) => pf.featureSlug) ?? []

    const overrides = await this.prisma.cabinetFeatureOverride.findMany({
      where: {
        cabinetId: cabinet.id,
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { featureSlug: true, type: true },
    })

    const granted = overrides.filter((o) => o.type === OverrideType.GRANT).map((o) => o.featureSlug)
    const blocked = overrides.filter((o) => o.type === OverrideType.BLOCK).map((o) => o.featureSlug)

    if (blocked.includes(feature)) {
      throw new ForbiddenException(`Plan does not include feature: ${feature}`)
    }

    const hasFeature =
      planFeatures.includes(feature) || granted.includes(feature)

    if (!hasFeature) {
      throw new ForbiddenException(`Plan does not include feature: ${feature}`)
    }

    return true
  }
}
