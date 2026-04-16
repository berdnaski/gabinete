import { Injectable } from '@nestjs/common';
import { DemandPriority, DemandStatus, Prisma } from '@prisma/client';
import { addMonths, startOfMonth, subHours } from 'date-fns';
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
  CreateDemandInfo,
  CreateEvidenceInfo,
  DemandCommentInfo,
  IDemandsRepository,
  ListDemandsFilters,
  ListReporterDemandsFilters,
  RawHeatmapPoint,
} from '../domain/demands.repository.interface';
import { DemandEntityMapper } from './demand-entity.mapper';

@Injectable()
export class DemandsRepository implements IDemandsRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string, userId?: string): Promise<DemandEntity | null> {
    const demand = await this.prisma.demand.findUnique({
      where: { id, disabledAt: null },
      include: {
        evidences: true,
        reporter: true,
        category: true,
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
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        reporterId: data.reporterId,
        guestEmail: data.guestEmail,
        cabinetId: data.cabinetId,
        categoryId: data.categoryId,
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
      priority,
      search,
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
      status: status || undefined,
      priority: priority || undefined,
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

    const [
      newDemandsLast24HoursCount,
      urgentOpenDemandsTotalCount,
      totalDemandsThisMonth,
      resolvedDemandsThisMonth,
    ] = await this.prisma.$transaction([
      this.prisma.demand.count({
        where: {
          cabinetId,
          disabledAt: null,
          createdAt: { gte: last24Hours },
        },
      }),
      this.prisma.demand.count({
        where: {
          cabinetId,
          disabledAt: null,
          priority: DemandPriority.URGENT,
          status: {
            notIn: [
              DemandStatus.RESOLVED,
              DemandStatus.REJECTED,
              DemandStatus.CANCELED,
            ],
          },
        },
      }),
      this.prisma.demand.count({
        where: {
          cabinetId,
          disabledAt: null,
          createdAt: { gte: startOfMonthUtc, lt: startOfNextMonthUtc },
        },
      }),
      this.prisma.demand.count({
        where: {
          cabinetId,
          disabledAt: null,
          status: DemandStatus.RESOLVED,
          createdAt: { gte: startOfMonthUtc, lt: startOfNextMonthUtc },
        },
      }),
    ]);

    return {
      new: newDemandsLast24HoursCount,
      urgent: urgentOpenDemandsTotalCount,
      total: totalDemandsThisMonth,
      resolved: resolvedDemandsThisMonth,
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

    const categories = topCategories.map((row) => {
      const countData = row._count as { categoryId: number };

      return {
        id: row.categoryId!,
        name: categoriesById.get(row.categoryId!) ?? 'Unknown',
        total: countData.categoryId,
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
        lat: true,
        long: true,
        priority: true,
        neighborhood: true,
      },
    });

    return records.map((r) => ({
      lat: r.lat!,
      long: r.long!,
      priority: r.priority,
      neighborhood: r.neighborhood,
    }));
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
