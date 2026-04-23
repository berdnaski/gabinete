export class CabinetEntity {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  description: string | null;
  avatarUrl: string | null;
  disabledAt: Date | null;
  score: number;
  demand_count: number;
}
