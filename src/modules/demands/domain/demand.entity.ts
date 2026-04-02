import { DemandStatus, DemandPriority } from '@prisma/client';
import { DemandEvidenceEntity } from './demand-evidence.entity';

export class DemandEntity {
  id: string;
  title: string;
  description: string;
  status: DemandStatus;
  priority: DemandPriority;
  address: string;
  zipcode: string;
  lat: number | null;
  long: number | null;
  neighborhood: string;
  city: string;
  state: string;
  reporterId: string | null;
  guestEmail: string | null;
  cabinetId: string | null;
  categoryId: string | null;
  assigneeMemberId: string | null;
  createdAt: Date;
  updatedAt: Date;
  disabledAt: Date | null;
  evidences?: DemandEvidenceEntity[];
}
