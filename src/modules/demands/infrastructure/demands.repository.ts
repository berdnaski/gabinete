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
  CreateDemandInfo,
  CreateEvidenceInfo,
  DemandCommentInfo,
  IDemandsRepository,
  ListDemandsFilters,
} from '../domain/demands.repository.interface';

@Injectable()
export class DemandsRepository implements IDemandsRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string): Promise<DemandEntity | null> {
    const demand = await this.prisma.demand.findUnique({
      where: { id, disabledAt: null },
      include: { evidences: true },
    });
    return demand ? DemandEntityMapper.toDomain(demand) : null;
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
      include: { evidences: true },
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
      },
    });

    return DemandEntityMapper.toDomain(demand);
  }

  async findAll(
    filters: ListDemandsFilters,
  ): Promise<PaginatedResult<DemandEntity>> {
    const { skip, take } = PaginationHelper.getSkipTake(filters);
    const { cabinetId, unassignedOnly, categoryId, status, priority, search } =
      filters;

    const where: Prisma.DemandWhereInput = {
      disabledAt: null,
      cabinetId: unassignedOnly ? null : cabinetId || undefined,
      categoryId: categoryId || undefined,
      status: status || undefined,
      priority: priority || undefined,
      OR: search
        ? [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
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
          reporter: true,
          category: {
            select: {
              name: true,
            }
          }
        },
      }),
      this.prisma.demand.count({ where }),
    ]);

    console.log(items)
    return {
      items: items.map((item) => DemandEntityMapper.toDomain(item)),
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

    console.log({
      newDemandsLast24HoursCount,
      urgentOpenDemandsTotalCount,
      totalDemandsThisMonth,
      resolvedDemandsThisMonth,
      cabinetId,
    })
    return {
      new: newDemandsLast24HoursCount,
      urgent: urgentOpenDemandsTotalCount,
      total: totalDemandsThisMonth,
      resolved: resolvedDemandsThisMonth,
    };
  }
}

type DemandWithRelations = Prisma.DemandGetPayload<{ include: { evidences: true } }> & {
  reporter?: { name: string; avatarUrl: string | null } | null;
  category?: { name: string } | null;
};

export class DemandEntityMapper {
  static toDomain(prismaModel: DemandWithRelations): DemandEntity {
    const entity = new DemandEntity();
    entity.id = prismaModel.id;
    entity.title = prismaModel.title;
    entity.description = prismaModel.description;
    entity.status = prismaModel.status;
    entity.priority = prismaModel.priority;
    entity.address = prismaModel.address;
    entity.zipcode = prismaModel.zipcode;
    entity.lat = prismaModel.lat;
    entity.long = prismaModel.long;
    entity.neighborhood = prismaModel.neighborhood;
    entity.city = prismaModel.city;
    entity.state = prismaModel.state;
    entity.reporterId = prismaModel.reporterId;
    entity.guestEmail = prismaModel.guestEmail;
    entity.cabinetId = prismaModel.cabinetId;
    entity.categoryId = prismaModel.categoryId;
    entity.assigneeMemberId = prismaModel.assigneeMemberId;
    entity.createdAt = prismaModel.createdAt;
    entity.updatedAt = prismaModel.updatedAt;
    entity.disabledAt = prismaModel.disabledAt;

    if (prismaModel.evidences) {
      entity.evidences = prismaModel.evidences.map((e) => {
        return {
          id: e.id,
          storageKey: e.storageKey,
          url: e.url,
          mimeType: e.mimeType,
          size: e.size,
          demandId: e.demandId,
        };
      });
    }

    if (prismaModel.reporter !== undefined) {
      entity.reporter = prismaModel.reporter
        ? { name: prismaModel.reporter.name, avatarUrl: prismaModel.reporter.avatarUrl }
        : null;
    }

    if (prismaModel.category !== undefined) {
      entity.category = prismaModel.category ? { name: prismaModel.category.name } : null;
    }

    return entity;
  }
}
