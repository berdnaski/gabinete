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
  neighborhood?: string | null;
  city: string;
  state: string;
  reporterId?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  cabinetId?: string | null;
  categoryId?: string | null;
  termsAcceptedAt?: Date | null;
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
  statuses?: DemandStatus[];
  priority?: DemandPriority;
  categoryId?: string;
  categories?: string | string[];
  neighborhoods?: string | string[];
  search?: string;
  assigneeMemberId?: string;
}

export interface ListReporterDemandsFilters extends PaginationParams {
  status?: DemandStatus;
  search?: string;
}

export interface DemandCommentInfo {
  id: string;
  content: string;
  isCabinetResponse: boolean;
  isStatusUpdate: boolean;
  demandId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  createdAt: Date;
}

export interface CabinetStatusCounts {
  SUBMITTED: number;
  IN_ANALYSIS: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  REJECTED: number;
  CANCELED: number;
}

export interface CabinetDemandMetrics {
  new: number;
  urgent: number;
  total: number;
  resolved: number;
  statusCounts: CabinetStatusCounts;
}

export interface DashboardCategoryStat {
  id: string;
  name: string;
  total: number;
  percentage: number;
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

export interface DemandTrendPoint {
  date: string;
  count: number;
}

export interface DemandTrendDetailedPoint {
  date: string;
  created: number;
  resolved: number;
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

export interface ReportStatusStat {
  status: DemandStatus;
  count: number;
  percentage: number;
}

export interface ReportPriorityStat {
  priority: DemandPriority;
  count: number;
  percentage: number;
}

export interface ReportCategoryStat {
  id: string;
  name: string;
  count: number;
  percentage: number;
}

export interface ReportNeighborhoodStat {
  neighborhood: string;
  count: number;
}

export interface CabinetReportData {
  period: { start: string; end: string; days: number };
  summary: {
    totalInPeriod: number;
    resolvedInPeriod: number;
    resolutionRate: number;
    openCount: number;
    rejectedCount: number;
    canceledCount: number;
  };
  byStatus: ReportStatusStat[];
  byPriority: ReportPriorityStat[];
  byCategory: ReportCategoryStat[];
  byNeighborhood: ReportNeighborhoodStat[];
  trend: DemandTrendDetailedPoint[];
  resultsInPeriod: number;
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
  abstract getDemandTrend(cabinetId: string, days: number): Promise<DemandTrendPoint[]>;
  abstract getDemandTrendDetailed(cabinetId: string, days: number): Promise<DemandTrendDetailedPoint[]>;
  abstract getCabinetReport(cabinetId: string, startDate: Date, endDate: Date): Promise<CabinetReportData>;
  abstract findBySurveyToken(token: string): Promise<DemandEntity | null>;
  abstract findContactInfo(demandId: string): Promise<{ guestEmail: string | null; guestPhone: string | null } | null>;
}
