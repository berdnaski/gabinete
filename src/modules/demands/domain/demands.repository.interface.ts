import { DemandStatus, DemandPriority } from '@prisma/client';
import { DemandEntity } from './demand.entity';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/domain/pagination.interface';

export interface CreateDemandInfo {
  title: string;
  description: string;
  status?: DemandStatus;
  priority?: DemandPriority;
  address: string;
  zipcode?: string | null;
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
  unassignedOnly?: boolean;
  status?: DemandStatus;
  priority?: DemandPriority;
  categoryId?: string;
  categories?: string | string[];
  neighborhoods?: string | string[];
  search?: string;
}

export interface ListReporterDemandsFilters extends PaginationParams {
  status?: DemandStatus;
  search?: string;
}

export interface DemandCommentInfo {
  id: string;
  content: string;
  isCabinetResponse: boolean;
  demandId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  createdAt: Date;
}

export interface CabinetDemandMetrics {
  new: number;
  urgent: number;
  total: number;
  resolved: number;
}

export interface DashboardCategoryStat {
  id: string;
  name: string;
  total: number;
}

export interface DashboardNeighborhoodStat {
  name: string;
  total: number;
}

export interface CabinetDashboardSummary {
  total: number;
  resolved: number;
  mainNeighborhoods: DashboardNeighborhoodStat[];
  categories: DashboardCategoryStat[];
}

export interface HeatmapPoint {
  id: string;
  lat: number;
  lng: number;
  weight: number;
  title: string;
  status: string;
  categoryName: string;
  neighborhood: string | null;
}

export interface HeatmapData {
  points: HeatmapPoint[];
  insight: {
    topNeighborhood: string;
    occurrenceCount: number;
    text: string;
  };
}

export interface RawHeatmapPoint {
  id: string;
  lat: number;
  long: number;
  priority: DemandPriority;
  neighborhood: string | null;
  title: string;
  status: string;
  categoryName: string;
}

export abstract class IDemandsRepository {
  abstract createWithEvidences(
    demand: CreateDemandInfo,
    evidences: CreateEvidenceInfo[],
  ): Promise<DemandEntity>;
  abstract findById(id: string, userId?: string): Promise<DemandEntity | null>;
  abstract update(
    id: string,
    data: Partial<DemandEntity>,
  ): Promise<DemandEntity>;
  abstract addEvidence(
    demandId: string,
    evidence: CreateEvidenceInfo,
  ): Promise<void>;
  abstract findAll(
    filters: ListDemandsFilters,
    userId?: string,
  ): Promise<PaginatedResult<DemandEntity>>;
  abstract findByReporter(
    reporterId: string,
    filters: ListReporterDemandsFilters,
    userId?: string,
  ): Promise<PaginatedResult<DemandEntity>>;
  abstract addComment(data: {
    demandId: string;
    authorId: string;
    content: string;
    isCabinetResponse: boolean;
  }): Promise<void>;
  abstract listComments(
    demandId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<DemandCommentInfo>>;
  abstract toggleLike(demandId: string, userId: string): Promise<boolean>;
  abstract getLikeStatus(demandId: string, userId: string): Promise<boolean>;
  abstract getCabinetDemandMetrics(
    cabinetId: string,
  ): Promise<CabinetDemandMetrics>;
  abstract getCabinetDashboardSummary(
    cabinetId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CabinetDashboardSummary>;
  abstract getRawHeatmapPoints(startDate?: Date): Promise<RawHeatmapPoint[]>;
  abstract getNeighborhoods(cabinetId?: string): Promise<string[]>;
}
