export class UserNeighborhoodEntity {
  id: string;
  userId: string;
  neighborhood: string;
  city: string;
  state: string;
  label: string | null;
  isPrimary: boolean;
  createdAt: Date;
}
