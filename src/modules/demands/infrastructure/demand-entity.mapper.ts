import { Prisma } from '@prisma/client';
import { DemandEntity } from '../domain/demand.entity';

export type DemandWithRelations = Prisma.DemandGetPayload<{
  include: { evidences: true };
}> & {
  reporter?: { name: string; avatarUrl: string | null } | null;
  category?: { name: string } | null;
  _count?: { likes: number };
  likes?: { userId: string }[];
};

export class DemandEntityMapper {
  static toDomain(prismaModel: DemandWithRelations, userId?: string): DemandEntity {
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
      entity.evidences = prismaModel.evidences.map((e) => ({
        id: e.id,
        storageKey: e.storageKey,
        url: e.url,
        mimeType: e.mimeType,
        size: e.size,
        demandId: e.demandId,
      }));
    }

    if (prismaModel.reporter !== undefined) {
      entity.reporter = prismaModel.reporter
        ? { name: prismaModel.reporter.name, avatarUrl: prismaModel.reporter.avatarUrl }
        : null;
    }

    if (prismaModel.category !== undefined) {
      entity.category = prismaModel.category
        ? { name: prismaModel.category.name }
        : null;
    }

    entity.likesCount = prismaModel._count?.likes ?? 0;
    entity.isLiked = userId ? !!prismaModel.likes?.length : false;

    return entity;
  }
}
