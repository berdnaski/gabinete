import { FeatureSlug } from 'src/shared/constants/features'

export enum OverrideType {
  GRANT = 'GRANT',
  BLOCK = 'BLOCK',
}

export interface PlanLimits {
  maxMembers: number | null
  maxDemands: number | null
  maxStorageGb: number | null
}

export interface CabinetEntitlements {
  features: FeatureSlug[]
  limits: PlanLimits
}
