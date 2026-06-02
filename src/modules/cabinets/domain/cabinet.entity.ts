export class CabinetEntity {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  description: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  logoUrl: string | null;
  accentColor: string | null;
  tagline: string | null;
  postDemandMessage: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  websiteUrl: string | null;
  twitterUrl: string | null;
  disabledAt: Date | null;
  score: number;
  demand_count: number;
  in_progress_count: number;
  resolved_count: number;
  resolution_rate: number;
}
