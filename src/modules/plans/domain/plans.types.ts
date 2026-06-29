import { FeatureSlug } from 'src/shared/constants/features'

export enum OverrideType {
  GRANT = 'GRANT',
  BLOCK = 'BLOCK',
}

export interface PlanLimits {
  maxMembers: number | null
  maxDemands: number | null
  maxStorageBytes: number | null
}

export interface CabinetUsage {
  memberCount: number
  demandCount: number
  storageUsedBytes: number
}

export interface CabinetSubscriptionStatus {
  hasActiveSubscription: boolean
  currentPeriodEnd: Date | null
}

export interface CabinetEntitlements {
  features: FeatureSlug[]
  limits: PlanLimits
  subscription: CabinetSubscriptionStatus
}
