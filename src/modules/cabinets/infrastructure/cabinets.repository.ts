import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Cabinet as PrismaCabinet, DemandStatus } from '@prisma/client';
import { CabinetEntity } from '../domain/cabinet.entity';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/domain/pagination.interface';
import { PaginationHelper } from 'src/shared/application/pagination.helper';

@Injectable()
export class CabinetsRepository implements ICabinetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    slug: string;
    email?: string;
    description?: string;
    avatarUrl?: string;
  }): Promise<CabinetEntity> {
    const record = await this.prisma.cabinet.create({ data });
    return this.toEntity(record);
  }

  async findById(id: string): Promise<CabinetEntity | null> {
    const record = await this.prisma.cabinet.findFirst({
      where: { id, disabledAt: null },
      include: {
        _count: { select: { demands: { where: { disabledAt: null } } } },
      },
    });
    return record ? this.toEntity(record) : null;
  }

  async findBySlug(slug: string): Promise<CabinetEntity | null> {
    const record = await this.prisma.cabinet.findFirst({
      where: { slug, disabledAt: null },
      include: {
        _count: { select: { demands: { where: { disabledAt: null } } } },
      },
    });
    return record ? this.toEntity(record) : null;
  }

  async findSlugsByBaseName(baseSlug: string): Promise<string[]> {
    const records = await this.prisma.cabinet.findMany({
      where: { slug: { startsWith: baseSlug }, disabledAt: null },
      select: { slug: true },
    });
    return records.map((r) => r.slug);
  }

  async list(
    params?: PaginationParams & { search?: string; hasDemands?: boolean },
  ): Promise<PaginatedResult<CabinetEntity>> {
    const { skip, take } = PaginationHelper.getSkipTake(
      params ?? { page: 1, limit: 100 },
    );
    const where: Record<string, unknown> = { disabledAt: null };

    if (params?.search) {
      const q = params.search.trim();
      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }
    }

    if (params?.hasDemands === true) {
      where.demands = { some: { disabledAt: null } };
    }
    if (params?.hasDemands === false) {
      where.demands = { none: { disabledAt: null } };
    }

    const [records, total] = await Promise.all([
      this.prisma.cabinet.findMany({
        where,
        skip,
        take,
        orderBy: [{ score: 'desc' }, { name: 'asc' }],
        include: {
          _count: {
            select: { demands: { where: { disabledAt: null } } },
          },
        },
      }),
      this.prisma.cabinet.count({ where }),
    ]);
    return { items: records.map((r) => this.toEntity(r)), total };
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      email?: string;
      description?: string;
      avatarUrl?: string;
    },
  ): Promise<CabinetEntity> {
    const record = await this.prisma.cabinet.update({ where: { id }, data });
    return this.toEntity(record);
  }

  async findByUserId(userId: string): Promise<CabinetEntity[]> {
    const records = await this.prisma.cabinet.findMany({
      where: {
        disabledAt: null,
        members: { some: { userId } },
      },
      orderBy: { name: 'asc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.cabinet.update({
      where: { id },
      data: { disabledAt: new Date() },
    });
  }

  async updateScoreCounters(
    cabinetId: string,
    deltas: {
      score?: number;
      inProgressDelta?: number;
      resolvedDelta?: number;
    },
  ): Promise<void> {
    const data: Record<string, unknown> = {};
    if (deltas.score !== undefined && deltas.score !== 0) {
      data.score = { increment: deltas.score };
    }
    if (deltas.inProgressDelta !== undefined && deltas.inProgressDelta !== 0) {
      data.in_progress_count = { increment: deltas.inProgressDelta };
    }
    if (deltas.resolvedDelta !== undefined && deltas.resolvedDelta !== 0) {
      data.resolved_count = { increment: deltas.resolvedDelta };
    }
    if (Object.keys(data).length === 0) return;
    await this.prisma.cabinet.update({ where: { id: cabinetId }, data });
  }

  private toEntity(
    record: PrismaCabinet & { _count?: { demands?: number } },
  ): CabinetEntity {
    const entity = new CabinetEntity();
    entity.id = record.id;
    entity.name = record.name;
    entity.slug = record.slug;
    entity.email = record.email;
    entity.description = record.description;
    entity.avatarUrl = record.avatarUrl;
    entity.disabledAt = record.disabledAt;
    entity.score = record.score ?? 0;
    entity.demand_count = record._count?.demands ?? 0;
    entity.in_progress_count = record.in_progress_count ?? 0;
    entity.resolved_count = record.resolved_count ?? 0;
    return entity;
  }
}
