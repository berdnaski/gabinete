import { DemandEntity } from './demand.entity';
import { DemandStatus, DemandPriority } from '@prisma/client';

export interface CreateDemandInfo {
  title: string;
  description: string;
  status?: DemandStatus;
  priority?: DemandPriority;
  address: string;
  zipcode: string;
  lat?: number | null;
  long?: number | null;
  neighborhood: string;
  city: string;
  state: string;
  reporterId?: string | null;
  guestEmail?: string | null;
  cabinetId?: string | null;
  categoryId?: string | null;
}

export interface CreateEvidenceInfo {
  storageKey: string;
  url: string;
  mimeType: string;
  size?: number | null;
}

export abstract class IDemandsRepository {
  abstract createWithEvidences(
    demand: CreateDemandInfo,
    evidences: CreateEvidenceInfo[],
  ): Promise<DemandEntity>;

  abstract findById(id: string): Promise<DemandEntity | null>;
  abstract addEvidence(
    demandId: string,
    evidence: CreateEvidenceInfo,
  ): Promise<void>;
}
