import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import {
  ActiveOverride,
  ActiveSubscription,
  AddOverrideInput,
  FeatureItem,
  FullOverride,
  FullSubscription,
  IPlansRepository,
  PlanWithFeatures,
  UpdatePlanInput,
} from '../domain/plans.repository.interface'
import { OverrideType } from '../domain/plans.types'

@Injectable()
export class PlansRepository implements IPlansRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveSubscription(cabinetId: string): Promise<ActiveSubscription | null> {
    const now = new Date()
    const sub = await this.prisma.cabinetSubscription.findFirst({
      where: {
        cabinetId,
        deletedAt: null,
        status: { in: ['ACTIVE', 'TRIALING'] },
        canceledAt: null,
        currentPeriodStart: { lte: now },
        currentPeriodEnd: { gte: now },
      },
      include: {
        plan: {
          include: {
            features: {
              select: {
                featureSlug: true,
                effectiveFrom: true,
              },
            },
          },
        },
      },
    })

    if (!sub) return null

    return {
      createdAt: sub.createdAt,
      plan: {
        maxMembers: sub.plan.maxMembers,
        maxDemands: sub.plan.maxDemands,
        maxStorageGb: sub.plan.maxStorageGb,
        features: sub.plan.features,
      },
    }
  }

  async getActiveOverrides(cabinetId: string): Promise<ActiveOverride[]> {
    const overrides = await this.prisma.cabinetFeatureOverride.findMany({
      where: {
        cabinetId,
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: {
        featureSlug: true,
        type: true,
      },
    })

    return overrides.map((o) => ({
      featureSlug: o.featureSlug,
      type: o.type as unknown as OverrideType,
    }))
  }

  async listPlans(): Promise<PlanWithFeatures[]> {
    const plans = await this.prisma.plan.findMany({
      where: { deletedAt: null },
      include: {
        features: {
          include: { feature: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    return plans.map((p) => ({
      id: p.id,
      tier: p.tier,
      name: p.name,
      priceInCents: p.priceInCents,
      maxMembers: p.maxMembers,
      maxDemands: p.maxDemands,
      maxStorageGb: p.maxStorageGb,
      isActive: p.isActive,
      features: p.features.map((f) => ({
        featureSlug: f.featureSlug,
        effectiveFrom: f.effectiveFrom,
        feature: { slug: f.feature.slug, name: f.feature.name, description: f.feature.description },
      })),
    }))
  }

  async updatePlan(planId: string, data: UpdatePlanInput): Promise<void> {
    await this.prisma.plan.update({ where: { id: planId }, data })
  }

  async listFeatures(): Promise<FeatureItem[]> {
    return this.prisma.feature.findMany({ orderBy: { slug: 'asc' } })
  }

  async addFeatureToPlan(planId: string, featureSlug: string, effectiveFrom: Date | null): Promise<void> {
    await this.prisma.planFeature.upsert({
      where: { planId_featureSlug: { planId, featureSlug } },
      create: { planId, featureSlug, effectiveFrom },
      update: { effectiveFrom },
    })
  }

  async removeFeatureFromPlan(planId: string, featureSlug: string): Promise<void> {
    await this.prisma.planFeature.delete({
      where: { planId_featureSlug: { planId, featureSlug } },
    })
  }

  async setPlanActive(planId: string, isActive: boolean): Promise<void> {
    await this.prisma.plan.update({ where: { id: planId }, data: { isActive } })
  }

  async listCabinetSubscriptionsSummary(): Promise<Array<{ cabinetId: string; planName: string; planTier: string; status: string }>> {
    const subs = await this.prisma.cabinetSubscription.findMany({
      where: { deletedAt: null },
      select: {
        cabinetId: true,
        status: true,
        plan: { select: { name: true, tier: true } },
      },
    })
    return subs.map((s) => ({
      cabinetId: s.cabinetId,
      planName: s.plan.name,
      planTier: s.plan.tier,
      status: s.status,
    }))
  }

  async getCabinetFullSubscription(cabinetId: string): Promise<FullSubscription | null> {
    const sub = await this.prisma.cabinetSubscription.findFirst({
      where: { cabinetId, deletedAt: null },
      include: {
        plan: {
          include: {
            features: { include: { feature: true } },
          },
        },
      },
    })
    if (!sub) return null
    return {
      id: sub.id,
      cabinetId: sub.cabinetId,
      planId: sub.planId,
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      canceledAt: sub.canceledAt,
      createdAt: sub.createdAt,
      plan: {
        id: sub.plan.id,
        tier: sub.plan.tier,
        name: sub.plan.name,
        priceInCents: sub.plan.priceInCents,
        maxMembers: sub.plan.maxMembers,
        maxDemands: sub.plan.maxDemands,
        maxStorageGb: sub.plan.maxStorageGb,
        isActive: sub.plan.isActive,
        features: sub.plan.features.map((f) => ({
          featureSlug: f.featureSlug,
          effectiveFrom: f.effectiveFrom,
          feature: { slug: f.feature.slug, name: f.feature.name, description: f.feature.description },
        })),
      },
    }
  }

  async upsertCabinetSubscription(cabinetId: string, planId: string): Promise<void> {
    await this.prisma.cabinetSubscription.upsert({
      where: { cabinetId },
      create: {
        cabinetId,
        planId,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        canceledAt: null,
        deletedAt: null,
      },
      update: {
        planId,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        canceledAt: null,
        deletedAt: null,
      },
    })
  }

  async getCabinetFullOverrides(cabinetId: string): Promise<FullOverride[]> {
    const overrides = await this.prisma.cabinetFeatureOverride.findMany({
      where: { cabinetId, deletedAt: null },
      include: { feature: true },
      orderBy: { createdAt: 'desc' },
    })
    return overrides.map((o) => ({
      id: o.id,
      cabinetId: o.cabinetId,
      featureSlug: o.featureSlug,
      type: o.type as unknown as OverrideType,
      source: o.source,
      expiresAt: o.expiresAt,
      notes: o.notes,
      createdAt: o.createdAt,
      feature: { slug: o.feature.slug, name: o.feature.name, description: o.feature.description },
    }))
  }

  async addCabinetOverride(data: AddOverrideInput): Promise<void> {
    await this.prisma.cabinetFeatureOverride.upsert({
      where: { cabinetId_featureSlug: { cabinetId: data.cabinetId, featureSlug: data.featureSlug } },
      create: {
        cabinetId: data.cabinetId,
        featureSlug: data.featureSlug,
        type: data.type as any,
        source: data.source as any,
        expiresAt: data.expiresAt ?? null,
        notes: data.notes ?? null,
        deletedAt: null,
      },
      update: {
        type: data.type as any,
        source: data.source as any,
        expiresAt: data.expiresAt ?? null,
        notes: data.notes ?? null,
        deletedAt: null,
      },
    })
  }

  async removeCabinetOverride(cabinetId: string, featureSlug: string): Promise<void> {
    await this.prisma.cabinetFeatureOverride.update({
      where: { cabinetId_featureSlug: { cabinetId, featureSlug } },
      data: { deletedAt: new Date() },
    })
  }
}
