import { Injectable } from '@nestjs/common'
import { IPlansRepository } from '../domain/plans.repository.interface'
import { CabinetEntitlements, OverrideType } from '../domain/plans.types'
import { FeatureSlug } from 'src/shared/constants/features'

@Injectable()
export class GetCabinetPlanUseCase {
  constructor(private readonly repo: IPlansRepository) {}

  async execute(cabinetId: string): Promise<CabinetEntitlements> {
    const [subscription, overrides] = await Promise.all([
      this.repo.getActiveSubscription(cabinetId),
      this.repo.getActiveOverrides(cabinetId),
    ])

    const planFeatures: FeatureSlug[] = subscription?.plan.features
      .filter(
        (pf) =>
          pf.effectiveFrom === null || pf.effectiveFrom <= subscription.createdAt,
      )
      .map((pf) => pf.featureSlug as FeatureSlug) ?? []

    const granted = overrides
      .filter((override) => override.type === OverrideType.GRANT)
      .map((override) => override.featureSlug as FeatureSlug)

    const blocked = overrides
      .filter((override) => override.type === OverrideType.BLOCK)
      .map((override) => override.featureSlug)

    const features: FeatureSlug[] = [
      ...planFeatures.filter((f) => !blocked.includes(f)),
      ...granted.filter((f) => !blocked.includes(f)),
    ]

    return {
      features: [...new Set(features)],
      limits: {
        maxMembers: subscription?.plan.maxMembers ?? null,
        maxDemands: subscription?.plan.maxDemands ?? null,
        maxStorageGb: subscription?.plan.maxStorageGb ?? null,
      },
    }
  }
}
