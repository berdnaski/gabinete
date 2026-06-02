import { Injectable } from '@nestjs/common';
import { DemandPriority, DemandStatus, Prisma } from '@prisma/client';
import { addMonths, format, startOfMonth, subDays, subHours, subMonths } from 'date-fns';
import { PaginationHelper } from 'src/shared/application/pagination.helper';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/domain/pagination.interface';
import { PrismaService } from '../../database/prisma.service';
import { DemandEntity } from '../domain/demand.entity';
import {
  CabinetDemandMetrics,
  CabinetDashboardSummary,
  CabinetReportData,
  CabinetStatusCounts,
  CreateDemandInfo,
  CreateEvidenceInfo,
  DemandCommentInfo,
  DemandTrendDetailedPoint,
  DemandTrendPoint,
  IDemandsRepository,
  ListDemandsFilters,
  ListReporterDemandsFilters,
  RawHeatmapPoint,
  ReportCategoryStat,
  ReportNeighborhoodStat,
  ReportPriorityStat,
  ReportStatusStat,
  ReporterSummaryData,
} from '../domain/demands.repository.interface';
import { DemandEntityMapper } from './demand-entity.mapper';

@Injectable()
export class DemandsRepository implements IDemandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, userId?: string): Promise<DemandEntity | null> {
    const demand = await this.prisma.demand.findUnique({
      where: { id, disabledAt: null },
      include: {
        evidences: true,
        reporter: true,
        category: true,
        cabinet: { select: { name: true, slug: true, avatarUrl: true } },
        results: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            createdAt: true,
            protocolFileKey: true,
            protocolFileUrl: true,
          },
          where: { disabledAt: null },
        },
        _count: { select: { likes: true, comments: true } },
        likes: userId ? { where: { userId } } : false,
      },
    });
    return demand ? DemandEntityMapper.toDomain(demand, userId) : null;
  }

  async addEvidence(
    demandId: string,
    evidence: CreateEvidenceInfo,
  ): Promise<void> {
    await this.prisma.demandEvidence.create({
      data: {
        demandId,
        storageKey: evidence.storageKey,
        url: evidence.url,
        mimeType: evidence.mimeType,
        size: evidence.size,
      },
    });
  }

  async update(id: string, data: Partial<DemandEntity>): Promise<DemandEntity> {
    const updated = await this.prisma.demand.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        address: data.address,
        zipcode: data.zipcode,
        lat: data.lat,
        long: data.long,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        categoryId: data.categoryId,
        cabinetId: data.cabinetId,
        assigneeMemberId: data.assigneeMemberId,
        disabledAt: data.disabledAt,
        termsAcceptedAt: data.termsAcceptedAt,
        surveyToken: data.surveyToken,
        surveyRating: data.surveyRating,
        surveyComment: data.surveyComment,
        surveySubmittedAt: data.surveySubmittedAt,
      },
      include: {
        evidences: true,
        results: {
          where: { disabledAt: null },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            createdAt: true,
            protocolFileKey: true,
            protocolFileUrl: true,
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return DemandEntityMapper.toDomain(updated);
  }

  async createWithEvidences(
    data: CreateDemandInfo,
    evidences: CreateEvidenceInfo[],
  ): Promise<DemandEntity> {
    const demand = await this.prisma.demand.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        address: data.address,
        zipcode: data.zipcode,
        lat: data.lat,
        long: data.long,
        neighborhood: data.neighborhood ?? "",
        city: data.city,
        state: data.state,
        reporterId: data.reporterId,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        cabinetId: data.cabinetId,
        categoryId: data.categoryId,
        termsAcceptedAt: data.termsAcceptedAt,
        evidences: {
          create: evidences.map((evidence) => ({
            storageKey: evidence.storageKey,
            url: evidence.url,
            mimeType: evidence.mimeType,
            size: evidence.size,
          })),
        },
      },
      include: {
        evidences: true,
        results: {
          where: { disabledAt: null },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            createdAt: true,
            protocolFileKey: true,
            protocolFileUrl: true,
          },
        },
      },
    });

    return DemandEntityMapper.toDomain(demand);
  }

  async findAll(
    filters: ListDemandsFilters,
    userId?: string,
  ): Promise<PaginatedResult<DemandEntity>> {
    const { skip, take } = PaginationHelper.getSkipTake(filters);
    const {
      cabinetId,
      unassignedOnly,
      categoryId,
      categories,
      neighborhoods,
      status,
      statuses,
      priority,
      search,
      assigneeMemberId,
    } = filters;

    const parseArray = (
      val: string | string[] | undefined,
    ): string[] | undefined => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      return String(val)
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    };

    const parsedCategories = parseArray(categories);
    const parsedNeighborhoods = parseArray(neighborhoods);

    let categoryFilter: Prisma.StringFilter | string | undefined =
      categoryId || undefined;
    if (parsedCategories?.length) {
      categoryFilter = {
        in: parsedCategories,
      };
    }

    const where: Prisma.DemandWhereInput = {
      disabledAt: null,
      cabinetId: unassignedOnly ? null : cabinetId || undefined,
      categoryId: categoryFilter,
      neighborhood: parsedNeighborhoods?.length
        ? { in: parsedNeighborhoods }
        : undefined,
      status: statuses?.length
        ? { in: statuses }
        : status || undefined,
      priority: priority || undefined,
      assigneeMemberId: assigneeMemberId || undefined,
      OR: search
        ? [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { neighborhood: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.demand.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          evidences: true,
          results: {
            select: {
              id: true,
              title: true,
              description: true,
              type: true,
              createdAt: true,
              protocolFileKey: true,
              protocolFileUrl: true,
            },
            where: { disabledAt: null },
          },
          reporter: true,
          category: {
            select: {
              name: true,
            },
          },
          cabinet: { select: { name: true, slug: true, avatarUrl: true } },
          _count: { select: { likes: true, comments: true } },
          likes: userId ? { where: { userId } } : false,
        },
      }),
      this.prisma.demand.count({ where }),
    ]);

    return {
      items: items.map((item) => DemandEntityMapper.toDomain(item, userId)),
      total,
    };
  }

  async findByReporter(
    reporterId: string,
    filters: ListReporterDemandsFilters,
    userId?: string,
  ): Promise<PaginatedResult<DemandEntity>> {
    const { skip, take } = PaginationHelper.getSkipTake(filters);

    const where: Prisma.DemandWhereInput = {
      reporterId,
      disabledAt: null,
      status: filters.status,
      OR: filters.search
        ? [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.demand.findMany({
        where,
        skip,
        take,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        include: {
          evidences: true,
          results: {
            select: {
              id: true,
              title: true,
              description: true,
              type: true,
              createdAt: true,
              protocolFileKey: true,
              protocolFileUrl: true,
            },
            where: { disabledAt: null },
          },
          reporter: true,
          category: {
            select: {
              name: true,
            },
          },
          cabinet: { select: { name: true, slug: true, avatarUrl: true } },
          _count: { select: { likes: true, comments: true } },
          likes: userId ? { where: { userId } } : false,
        },
      }),
      this.prisma.demand.count({ where }),
    ]);

    return {
      items: items.map((item) => DemandEntityMapper.toDomain(item, userId)),
      total,
    };
  }

  async addComment(data: {
    demandId: string;
    authorId: string;
    content: string;
    isCabinetResponse: boolean;
  }): Promise<void> {
    await this.prisma.demandComment.create({
      data: {
        demandId: data.demandId,
        authorId: data.authorId,
        content: data.content,
        isCabinetResponse: data.isCabinetResponse,
      },
    });
  }

  async listComments(
    demandId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<DemandCommentInfo>> {
    const { skip, take } = PaginationHelper.getSkipTake(params);

    const [items, total] = await Promise.all([
      this.prisma.demandComment.findMany({
        where: { demandId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.demandComment.count({ where: { demandId } }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        content: item.content,
        isCabinetResponse: item.isCabinetResponse,
        isStatusUpdate: item.isCabinetResponse && item.content.startsWith('Status atualizado para'),
        demandId: item.demandId,
        authorId: item.authorId,
        authorName: item.author.name,
        authorAvatarUrl: item.author.avatarUrl,
        createdAt: item.createdAt,
      })),
      total,
    };
  }

  async toggleLike(demandId: string, userId: string): Promise<boolean> {
    const existing = await this.prisma.demandLike.findUnique({
      where: { userId_demandId: { userId, demandId } },
    });

    if (existing) {
      await this.prisma.demandLike.delete({ where: { id: existing.id } });
      return false;
    }

    await this.prisma.demandLike.create({ data: { userId, demandId } });
    return true;
  }

  async getLikeStatus(demandId: string, userId: string): Promise<boolean> {
    const existing = await this.prisma.demandLike.findUnique({
      where: {
        userId_demandId: {
          userId,
          demandId,
        },
      },
    });

    return !!existing;
  }

  async getCabinetDemandMetrics(
    cabinetId: string,
  ): Promise<CabinetDemandMetrics> {
    const now = new Date();
    const last24Hours = subHours(now, 24);
    const startOfMonthUtc = startOfMonth(now);
    const startOfNextMonthUtc = addMonths(startOfMonthUtc, 1);

    const baseWhere = { cabinetId, disabledAt: null };

    const [
      newDemandsLast24HoursCount,
      urgentOpenDemandsTotalCount,
      totalDemandsThisMonth,
      resolvedDemandsThisMonth,
      statusGroups,
    ] = await this.prisma.$transaction([
      this.prisma.demand.count({
        where: { ...baseWhere, createdAt: { gte: last24Hours } },
      }),
      this.prisma.demand.count({
        where: {
          ...baseWhere,
          priority: DemandPriority.URGENT,
          status: { notIn: [DemandStatus.RESOLVED, DemandStatus.REJECTED, DemandStatus.CANCELED] },
        },
      }),
      this.prisma.demand.count({
        where: { ...baseWhere, createdAt: { gte: startOfMonthUtc, lt: startOfNextMonthUtc } },
      }),
      this.prisma.demand.count({
        where: { ...baseWhere, status: DemandStatus.RESOLVED, createdAt: { gte: startOfMonthUtc, lt: startOfNextMonthUtc } },
      }),
      this.prisma.demand.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { status: true },
        orderBy: { status: 'asc' },
      }),
    ]);

    const statusCounts: CabinetStatusCounts = {
      SUBMITTED: 0,
      IN_ANALYSIS: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      REJECTED: 0,
      CANCELED: 0,
    };
    for (const row of statusGroups) {
      statusCounts[row.status] = (row._count as { status: number }).status;
    }

    return {
      new: newDemandsLast24HoursCount,
      urgent: urgentOpenDemandsTotalCount,
      total: totalDemandsThisMonth,
      resolved: resolvedDemandsThisMonth,
      statusCounts,
    };
  }

  async getCabinetDashboardSummary(
    cabinetId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CabinetDashboardSummary> {
    const baseWhere = {
      cabinetId,
      disabledAt: null,
      createdAt: { gte: startDate, lt: endDate },
    };

    const [total, resolved, topNeighborhoods, topCategories] =
      await this.prisma.$transaction([
        this.prisma.demand.count({ where: baseWhere }),
        this.prisma.demand.count({
          where: { ...baseWhere, status: DemandStatus.RESOLVED },
        }),
        this.prisma.demand.groupBy({
          by: ['neighborhood'],
          where: { ...baseWhere, neighborhood: { not: '' } },
          _count: { neighborhood: true },
          orderBy: { _count: { neighborhood: 'desc' } },
          take: 1,
        }),
        this.prisma.demand.groupBy({
          by: ['categoryId'],
          where: { ...baseWhere, categoryId: { not: null } },
          _count: { categoryId: true },
          orderBy: { _count: { categoryId: 'desc' } },
          take: 4,
        }),
      ]);

    const mainNeighborhoods = topNeighborhoods.map((row) => {
      const countData = row._count as { neighborhood: number };

      return {
        name: row.neighborhood,
        total: countData.neighborhood,
      };
    });

    const categoryIds = topCategories.map((c) => c.categoryId!);

    const categoryRecords =
      categoryIds.length > 0
        ? await this.prisma.category.findMany({
            where: { id: { in: categoryIds }, disabledAt: null },
            select: { id: true, name: true },
          })
        : [];

    const categoriesById = new Map(categoryRecords.map((c) => [c.id, c.name]));

    const categoriesTotal = topCategories.reduce(
      (sum, row) => sum + (row._count as { categoryId: number }).categoryId,
      0,
    );

    const categories = topCategories.map((row) => {
      const count = (row._count as { categoryId: number }).categoryId;
      return {
        id: row.categoryId!,
        name: categoriesById.get(row.categoryId!) ?? 'Unknown',
        total: count,
        percentage: categoriesTotal > 0 ? Math.round((count / categoriesTotal) * 100) : 0,
      };
    });

    return {
      total,
      resolved,
      mainNeighborhoods,
      categories,
    };
  }

  async getRawHeatmapPoints(startDate?: Date): Promise<RawHeatmapPoint[]> {
    const records = await this.prisma.demand.findMany({
      where: {
        disabledAt: null,
        lat: { not: null },
        long: { not: null },
        createdAt: startDate ? { gte: startDate } : undefined,
      },
      select: {
        id: true,
        lat: true,
        long: true,
        priority: true,
        neighborhood: true,
        title: true,
        status: true,
        category: { select: { name: true } },
      },
    });

    return records.map((r) => ({
      id: r.id,
      lat: r.lat!,
      long: r.long!,
      priority: r.priority,
      neighborhood: r.neighborhood,
      title: r.title,
      status: r.status,
      categoryName: r.category?.name ?? '',
    }));
  }

  async getDemandTrend(cabinetId: string, days: number): Promise<DemandTrendPoint[]> {
    const startDate = subDays(new Date(), days - 1);
    startDate.setHours(0, 0, 0, 0);

    const rows = await this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM demands
      WHERE cabinet_id = ${cabinetId}
        AND disabled_at IS NULL
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const dateMap = new Map(
      rows.map((r) => [new Date(r.date).toISOString().split('T')[0], Number(r.count)]),
    );

    const trend: DemandTrendPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = d.toISOString().split('T')[0];
      trend.push({ date: dateStr, count: dateMap.get(dateStr) ?? 0 });
    }

    return trend;
  }

  async getDemandTrendDetailed(cabinetId: string, days: number): Promise<DemandTrendDetailedPoint[]> {
    const startDate = subDays(new Date(), days - 1);
    startDate.setHours(0, 0, 0, 0);

    const createdRows = await this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM demands
      WHERE cabinet_id = ${cabinetId}
        AND disabled_at IS NULL
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const resolvedRows = await this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE(updated_at) as date, COUNT(*)::int as count
      FROM demands
      WHERE cabinet_id = ${cabinetId}
        AND disabled_at IS NULL
        AND status = 'RESOLVED'
        AND updated_at >= ${startDate}
      GROUP BY DATE(updated_at)
      ORDER BY date ASC
    `;

    const createdMap = new Map(
      createdRows.map((r) => [new Date(r.date).toISOString().split('T')[0], Number(r.count)]),
    );
    const resolvedMap = new Map(
      resolvedRows.map((r) => [new Date(r.date).toISOString().split('T')[0], Number(r.count)]),
    );

    const trend: DemandTrendDetailedPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = d.toISOString().split('T')[0];
      trend.push({
        date: dateStr,
        created: createdMap.get(dateStr) ?? 0,
        resolved: resolvedMap.get(dateStr) ?? 0,
      });
    }

    return trend;
  }

  async getCabinetReport(
    cabinetId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CabinetReportData> {
    const baseWhere = {
      cabinetId,
      disabledAt: null,
      createdAt: { gte: startDate, lt: endDate },
    };

    const [
      total,
      statusGroups,
      priorityGroups,
      neighborhoodGroups,
      categoryGroups,
      resultsCount,
    ] = await this.prisma.$transaction([
      this.prisma.demand.count({ where: baseWhere }),
      this.prisma.demand.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { status: true },
        orderBy: { status: 'asc' },
      }),
      this.prisma.demand.groupBy({
        by: ['priority'],
        where: baseWhere,
        _count: { priority: true },
        orderBy: { priority: 'asc' },
      }),
      this.prisma.demand.groupBy({
        by: ['neighborhood'],
        where: { ...baseWhere, neighborhood: { not: '' } },
        _count: { neighborhood: true },
        orderBy: { _count: { neighborhood: 'desc' } },
        take: 10,
      }),
      this.prisma.demand.groupBy({
        by: ['categoryId'],
        where: { ...baseWhere, categoryId: { not: null } },
        _count: { categoryId: true },
        orderBy: { _count: { categoryId: 'desc' } },
        take: 8,
      }),
      this.prisma.result.count({
        where: {
          cabinetId,
          disabledAt: null,
          createdAt: { gte: startDate, lt: endDate },
        },
      }),
    ]);

    const statusCountMap = new Map<string, number>();
    for (const row of statusGroups) {
      statusCountMap.set(row.status, (row._count as { status: number }).status);
    }

    const resolvedInPeriod = statusCountMap.get(DemandStatus.RESOLVED) ?? 0;
    const rejectedCount = statusCountMap.get(DemandStatus.REJECTED) ?? 0;
    const canceledCount = statusCountMap.get(DemandStatus.CANCELED) ?? 0;
    const openCount = total - resolvedInPeriod - rejectedCount - canceledCount;

    const byStatus: ReportStatusStat[] = Object.values(DemandStatus)
      .map((status) => ({
        status,
        count: statusCountMap.get(status) ?? 0,
        percentage: total > 0 ? Math.round(((statusCountMap.get(status) ?? 0) / total) * 100) : 0,
      }))
      .filter((s) => s.count > 0);

    const priorityCountMap = new Map<string, number>();
    for (const row of priorityGroups) {
      if (row.priority) {
        priorityCountMap.set(row.priority, (row._count as { priority: number }).priority);
      }
    }

    const byPriority: ReportPriorityStat[] = Object.values(DemandPriority)
      .map((priority) => ({
        priority,
        count: priorityCountMap.get(priority) ?? 0,
        percentage: total > 0 ? Math.round(((priorityCountMap.get(priority) ?? 0) / total) * 100) : 0,
      }))
      .filter((p) => p.count > 0);

    const categoryIds = categoryGroups.map((g) => g.categoryId!);
    const categoryRecords =
      categoryIds.length > 0
        ? await this.prisma.category.findMany({
            where: { id: { in: categoryIds }, disabledAt: null },
            select: { id: true, name: true },
          })
        : [];
    const categoriesById = new Map(categoryRecords.map((c) => [c.id, c.name]));

    const byCategory: ReportCategoryStat[] = categoryGroups.map((g) => {
      const count = (g._count as { categoryId: number }).categoryId;
      return {
        id: g.categoryId!,
        name: categoriesById.get(g.categoryId!) ?? 'Sem categoria',
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });

    const byNeighborhood: ReportNeighborhoodStat[] = neighborhoodGroups.map((g) => ({
      neighborhood: g.neighborhood,
      count: (g._count as { neighborhood: number }).neighborhood,
    }));

    const createdRows = await this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM demands
      WHERE cabinet_id = ${cabinetId}
        AND disabled_at IS NULL
        AND created_at >= ${startDate}
        AND created_at < ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const resolvedRows = await this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE(updated_at) as date, COUNT(*)::int as count
      FROM demands
      WHERE cabinet_id = ${cabinetId}
        AND disabled_at IS NULL
        AND status = 'RESOLVED'
        AND updated_at >= ${startDate}
        AND updated_at < ${endDate}
      GROUP BY DATE(updated_at)
      ORDER BY date ASC
    `;

    const createdMap = new Map(
      createdRows.map((r) => [new Date(r.date).toISOString().split('T')[0], Number(r.count)]),
    );
    const resolvedMap = new Map(
      resolvedRows.map((r) => [new Date(r.date).toISOString().split('T')[0], Number(r.count)]),
    );

    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyTrend: DemandTrendDetailedPoint[] = [];
    for (let i = 0; i < periodDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      dailyTrend.push({
        date: dateStr,
        created: createdMap.get(dateStr) ?? 0,
        resolved: resolvedMap.get(dateStr) ?? 0,
      });
    }

    const trend = this.aggregateTrend(dailyTrend, periodDays);

    return {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: periodDays,
      },
      summary: {
        totalInPeriod: total,
        resolvedInPeriod,
        resolutionRate: total > 0 ? Math.round((resolvedInPeriod / total) * 100) : 0,
        openCount: Math.max(0, openCount),
        rejectedCount,
        canceledCount,
      },
      byStatus,
      byPriority,
      byCategory,
      byNeighborhood,
      trend,
      resultsInPeriod: resultsCount,
    };
  }

  async findContactInfo(demandId: string): Promise<{ guestEmail: string | null; guestPhone: string | null } | null> {
    return this.prisma.demand.findUnique({
      where: { id: demandId },
      select: { guestEmail: true, guestPhone: true },
    });
  }

  async findBySurveyToken(token: string): Promise<DemandEntity | null> {
    const demand = await this.prisma.demand.findUnique({
      where: { surveyToken: token },
      include: {
        evidences: true,
        results: { where: { disabledAt: null }, select: { id: true, title: true, description: true, type: true, createdAt: true, protocolFileKey: true, protocolFileUrl: true } },
        cabinet: { select: { name: true, slug: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    return demand ? DemandEntityMapper.toDomain(demand) : null;
  }

  private aggregateTrend(
    daily: DemandTrendDetailedPoint[],
    periodDays: number,
  ): DemandTrendDetailedPoint[] {
    if (periodDays <= 60) return daily;

    if (periodDays <= 180) {
      const weeks: DemandTrendDetailedPoint[] = [];
      for (let i = 0; i < daily.length; i += 7) {
        const slice = daily.slice(i, i + 7);
        weeks.push({
          date: slice[0].date,
          created: slice.reduce((s, d) => s + d.created, 0),
          resolved: slice.reduce((s, d) => s + d.resolved, 0),
        });
      }
      return weeks;
    }

    const monthMap = new Map<string, DemandTrendDetailedPoint>();
    for (const point of daily) {
      const key = point.date.slice(0, 7);
      const existing = monthMap.get(key);
      if (existing) {
        existing.created += point.created;
        existing.resolved += point.resolved;
      } else {
        monthMap.set(key, { date: point.date, created: point.created, resolved: point.resolved });
      }
    }
    return Array.from(monthMap.values());
  }

  async getReporterSummary(reporterId: string): Promise<ReporterSummaryData> {
    const demands = await this.prisma.demand.findMany({
      where: { reporterId, disabledAt: null },
      select: {
        status: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { name: true } },
      },
    });

    const total = demands.length;

    const statusCounts = new Map<DemandStatus, number>();
    for (const d of demands) {
      statusCounts.set(d.status, (statusCounts.get(d.status) ?? 0) + 1);
    }

    const statusBreakdown = Object.values(DemandStatus).map((status) => ({
      status,
      count: statusCounts.get(status) ?? 0,
      percentage: total > 0 ? Math.round(((statusCounts.get(status) ?? 0) / total) * 100) : 0,
    }));

    const resolvedCount = statusCounts.get(DemandStatus.RESOLVED) ?? 0;
    const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

    const resolvedDemands = demands.filter((d) => d.status === DemandStatus.RESOLVED);
    const avgDaysToResolve =
      resolvedDemands.length > 0
        ? Math.round(
            resolvedDemands.reduce((sum, d) => {
              return sum + (d.updatedAt.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            }, 0) / resolvedDemands.length,
          )
        : null;

    const now = new Date();
    const monthlyActivity = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, 5 - i);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const count = demands.filter(
        (d) => d.createdAt.getMonth() + 1 === month && d.createdAt.getFullYear() === year,
      ).length;
      return { label: format(date, 'MMM'), month, year, count };
    });

    const categoryMap = new Map<string, { count: number; resolvedCount: number }>();
    for (const d of demands) {
      const name = d.category?.name ?? 'Sem categoria';
      const existing = categoryMap.get(name) ?? { count: 0, resolvedCount: 0 };
      categoryMap.set(name, {
        count: existing.count + 1,
        resolvedCount: existing.resolvedCount + (d.status === DemandStatus.RESOLVED ? 1 : 0),
      });
    }

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { totalDemands: total, statusBreakdown, resolutionRate, avgDaysToResolve, monthlyActivity, categoryBreakdown };
  }

  async getNeighborhoods(cabinetId?: string): Promise<string[]> {
    const demands = await this.prisma.demand.findMany({
      where: {
        disabledAt: null,
        cabinetId: cabinetId || undefined,
        neighborhood: { not: '' },
      },
      select: {
        neighborhood: true,
      },
      distinct: ['neighborhood'],
      orderBy: {
        neighborhood: 'asc',
      },
    });

    return demands.map((d) => d.neighborhood);
  }
}
