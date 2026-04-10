import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ICategoriesRepository } from '../domain/categories.repository.interface';
import { CategoryEntity } from '../domain/category.entity';
import {
  PaginatedResult,
  PaginationParams,
} from '../../../shared/domain/pagination.interface';
import { PaginationHelper } from '../../../shared/application/pagination.helper';

@Injectable()
export class CategoriesRepository implements ICategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; slug: string }): Promise<CategoryEntity> {
    const record = await this.prisma.category.create({ data });
    return this.toEntity(record);
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const record = await this.prisma.category.findFirst({
      where: { id, disabledAt: null },
    });
    return record ? this.toEntity(record) : null;
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const record = await this.prisma.category.findFirst({
      where: { slug, disabledAt: null },
    });
    return record ? this.toEntity(record) : null;
  }

  async findSlugsByBaseName(baseSlug: string): Promise<string[]> {
    const records = await this.prisma.category.findMany({
      where: {
        slug: { startsWith: baseSlug },
        disabledAt: null,
      },
      select: { slug: true },
    });
    return records.map((r) => r.slug);
  }

  async list(
    params: PaginationParams,
  ): Promise<PaginatedResult<CategoryEntity>> {
    const { skip, take } = PaginationHelper.getSkipTake(params);
    const where = { disabledAt: null };

    const [records, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      items: records.map((r) => this.toEntity(r)),
      total,
    };
  }

  async update(
    id: string,
    data: { name?: string; slug?: string },
  ): Promise<CategoryEntity> {
    const record = await this.prisma.category.update({ where: { id }, data });
    return this.toEntity(record);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.category.update({
      where: { id },
      data: { disabledAt: new Date() },
    });
  }

  private toEntity(record: {
    id: string;
    name: string;
    slug: string;
    disabledAt: Date | null;
  }): CategoryEntity {
    const entity = new CategoryEntity();
    entity.id = record.id;
    entity.name = record.name;
    entity.slug = record.slug;
    entity.disabledAt = record.disabledAt;
    return entity;
  }
}
