import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DemandEntity } from '../domain/demand.entity';
import {
  CreateDemandInfo,
  CreateEvidenceInfo,
  IDemandsRepository,
} from '../domain/demands.repository.interface';

@Injectable()
export class DemandsRepository implements IDemandsRepository {
  constructor(private readonly prisma: PrismaService) {}

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
}

export class DemandEntityMapper {
  static toDomain(prismaModel: any): DemandEntity {
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
      entity.evidences = prismaModel.evidences.map((e: any) => {
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

    return entity;
  }
}
