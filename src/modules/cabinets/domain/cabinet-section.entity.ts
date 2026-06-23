export class CabinetSectionEntity {
  id: string;
  cabinetId: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  enabled: boolean;
  sortOrder: number;
  config: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}
