import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Cabinet as PrismaCabinet } from '@prisma/client';
import { CabinetEntity } from '../domain/cabinet.entity';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';
import { PaginatedResult, PaginationParams } from 'src/shared/domain/pagination.interface';
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
    });
    return record ? this.toEntity(record) : null;
  }

  async findBySlug(slug: string): Promise<CabinetEntity | null> {
    const record = await this.prisma.cabinet.findFirst({
      where: { slug, disabledAt: null },
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

  async list(params?: PaginationParams): Promise<PaginatedResult<CabinetEntity>> {
    const { skip, take } = PaginationHelper.getSkipTake(params ?? { page: 1, limit: 100 });
    const where = { disabledAt: null };

    const [records, total] = await Promise.all([
      this.prisma.cabinet.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
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

  async softDelete(id: string): Promise<void> {
    await this.prisma.cabinet.update({
      where: { id },
      data: { disabledAt: new Date() },
    });
  }

  private toEntity(record: PrismaCabinet): CabinetEntity {
    const entity = new CabinetEntity();
    entity.id = record.id;
    entity.name = record.name;
    entity.slug = record.slug;
    entity.email = record.email;
    entity.description = record.description;
    entity.avatarUrl = record.avatarUrl;
    entity.disabledAt = record.disabledAt;
    return entity;
  }
}
