import { DemandStatus, DemandPriority } from '@prisma/client';
import { DemandEntity } from './demand.entity';
import { PaginatedResult, PaginationParams } from 'src/shared/domain/pagination.interface';

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

export interface ListDemandsFilters extends PaginationParams {
  cabinetId?: string;
  status?: DemandStatus;
  priority?: DemandPriority;
  categoryId?: string;
  search?: string;
}

export abstract class IDemandsRepository {
  abstract createWithEvidences(
    demand: CreateDemandInfo,
    evidences: CreateEvidenceInfo[],
  ): Promise<DemandEntity>;
  abstract findById(id: string): Promise<DemandEntity | null>;
  abstract addEvidence(demandId: string, evidence: CreateEvidenceInfo): Promise<void>;
  abstract findAll(filters: ListDemandsFilters): Promise<PaginatedResult<DemandEntity>>;
}
