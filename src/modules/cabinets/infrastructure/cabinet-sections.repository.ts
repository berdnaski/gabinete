import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CabinetSectionEntity } from '../domain/cabinet-section.entity';
import { CabinetSection as PrismaCabinetSection, CabinetSectionType } from '@prisma/client';

export interface UpsertSectionInput {
  type: CabinetSectionType;
  title?: string;
  subtitle?: string;
  enabled: boolean;
  sortOrder: number;
  config?: Record<string, any>;
}

@Injectable()
export class CabinetSectionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCabinetId(cabinetId: string): Promise<CabinetSectionEntity[]> {
    const records = await this.prisma.cabinetSection.findMany({
      where: { cabinetId },
      orderBy: { sortOrder: 'asc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findEnabledByCabinetId(cabinetId: string): Promise<CabinetSectionEntity[]> {
    const records = await this.prisma.cabinetSection.findMany({
      where: { cabinetId, enabled: true },
      orderBy: { sortOrder: 'asc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  async upsertMany(cabinetId: string, sections: UpsertSectionInput[]): Promise<CabinetSectionEntity[]> {
    return this.prisma.$transaction(async (tx) => {
      const results: CabinetSectionEntity[] = [];
      for (const section of sections) {
        const record = await tx.cabinetSection.upsert({
          where: {
            cabinetId_type: {
              cabinetId,
              type: section.type,
            },
          },
          update: {
            title: section.title,
            subtitle: section.subtitle,
            enabled: section.enabled,
            sortOrder: section.sortOrder,
            config: section.config ? (section.config as any) : undefined,
          },
          create: {
            cabinetId,
            type: section.type,
            title: section.title,
            subtitle: section.subtitle,
            enabled: section.enabled,
            sortOrder: section.sortOrder,
            config: section.config ? (section.config as any) : undefined,
          },
        });
        results.push(this.toEntity(record));
      }
      return results;
    });
  }

  private toEntity(record: PrismaCabinetSection): CabinetSectionEntity {
    const entity = new CabinetSectionEntity();
    entity.id = record.id;
    entity.cabinetId = record.cabinetId;
    entity.type = record.type;
    entity.title = record.title ?? null;
    entity.subtitle = record.subtitle ?? null;
    entity.enabled = record.enabled;
    entity.sortOrder = record.sortOrder;
    entity.config = record.config as Record<string, any> | null;
    entity.createdAt = record.createdAt;
    entity.updatedAt = record.updatedAt;
    return entity;
  }
}
