import { SetMetadata } from '@nestjs/common'
import { FeatureSlug } from '../constants/features'

export const FEATURE_KEY = 'required_feature'
export const RequireFeature = (feature: FeatureSlug) => SetMetadata(FEATURE_KEY, feature)
