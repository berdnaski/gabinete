export const FEATURES = {
  HEATMAP:    'heatmap',
  CSV_EXPORT: 'csv_export',
  WIDGET:     'widget',
} as const

export type FeatureSlug = (typeof FEATURES)[keyof typeof FEATURES]
