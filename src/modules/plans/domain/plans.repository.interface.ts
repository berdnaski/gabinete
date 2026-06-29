import { OverrideType } from './plans.types'


export interface ActiveSubscription {
  createdAt: Date
  currentPeriodEnd: Date | null
  plan: {
    maxMembers: number | null
    maxDemands: number | null
    maxStorageBytes: number | null
    features: Array<{
      featureSlug: string
      effectiveFrom: Date | null
    }>
  }
}

export interface ActiveOverride {
  featureSlug: string
  type: OverrideType
}

export interface FeatureItem {
  slug: string
  name: string
  description: string | null
}

export interface PlanWithFeatures {
  id: string
  tier: string
  name: string
  priceInCents: number
  maxMembers: number | null
  maxDemands: number | null
  maxStorageBytes: number | null
  isActive: boolean
  features: Array<{
    featureSlug: string
    effectiveFrom: Date | null
    feature: FeatureItem
  }>
}

export interface FullSubscription {
  id: string
  cabinetId: string
  planId: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date | null
  canceledAt: Date | null
  createdAt: Date
  plan: PlanWithFeatures
  priceInCents: number | null
  maxMembers: number | null
  maxDemands: number | null
  maxStorageBytes: number | null
}

export interface UpdateSubscriptionInput {
  priceInCents?: number | null
  maxMembers?: number | null
  maxDemands?: number | null
  maxStorageBytes?: number | null
}

export interface FullOverride {
  id: string
  cabinetId: string
  featureSlug: string
  type: OverrideType
  source: string
  expiresAt: Date | null
  notes: string | null
  createdAt: Date
  feature: FeatureItem
}

export interface AddOverrideInput {
  cabinetId: string
  featureSlug: string
  type: OverrideType
  source: string
  expiresAt?: Date | null
  notes?: string | null
}

export interface UpdatePlanInput {
  name?: string
  priceInCents?: number
  maxMembers?: number | null
  maxDemands?: number | null
  maxStorageBytes?: number | null
}

export abstract class IPlansRepository {
  abstract getActiveSubscription(cabinetId: string): Promise<ActiveSubscription | null>
  abstract getActiveOverrides(cabinetId: string): Promise<ActiveOverride[]>
  abstract getCabinetUsage(cabinetId: string): Promise<{ memberCount: number; demandCount: number; storageUsedBytes: number }>

  abstract listPlans(): Promise<PlanWithFeatures[]>
  abstract updatePlan(planId: string, data: UpdatePlanInput): Promise<void>
  abstract listFeatures(): Promise<FeatureItem[]>
  abstract addFeatureToPlan(planId: string, featureSlug: string, effectiveFrom: Date | null): Promise<void>
  abstract removeFeatureFromPlan(planId: string, featureSlug: string): Promise<void>
  abstract setPlanActive(planId: string, isActive: boolean): Promise<void>
  abstract listCabinetSubscriptionsSummary(): Promise<Array<{ cabinetId: string; planName: string; planTier: string; status: string }>>
  abstract getCabinetFullSubscription(cabinetId: string): Promise<FullSubscription | null>
  abstract getCabinetSubscriptionHistory(cabinetId: string): Promise<FullSubscription[]>
  abstract upsertCabinetSubscription(cabinetId: string, planId: string): Promise<void>
  abstract updateCabinetSubscription(cabinetId: string, data: UpdateSubscriptionInput): Promise<void>
  abstract getCabinetFullOverrides(cabinetId: string): Promise<FullOverride[]>
  abstract addCabinetOverride(data: AddOverrideInput): Promise<void>
  abstract removeCabinetOverride(cabinetId: string, featureSlug: string): Promise<void>
}
