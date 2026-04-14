import { Prisma } from '@prisma/client';
import { ResultEntity } from '../domain/result.entity';

export type ResultWithRelations = Prisma.ResultGetPayload<{
  include: {
    images: true;
    cabinet: { select: { id: true; name: true; slug: true; avatarUrl: true } };
    demand: { select: { id: true; title: true } };
  };
}>;

export class ResultEntityMapper {
  static toDomain(prismaModel: ResultWithRelations): ResultEntity {
    const entity = new ResultEntity();
    entity.id = prismaModel.id;
    entity.title = prismaModel.title;
    entity.description = prismaModel.description;
    entity.type = prismaModel.type;
    entity.isPublic = prismaModel.isPublic;
    entity.cabinetId = prismaModel.cabinetId;
    entity.demandId = prismaModel.demandId;
    entity.protocolFileKey = prismaModel.protocolFileKey;
    entity.protocolFileUrl = prismaModel.protocolFileUrl;
    entity.protocolFileName = prismaModel.protocolFileName;
    entity.protocolFileMimeType = prismaModel.protocolFileMimeType;
    entity.protocolFileSize = prismaModel.protocolFileSize;
    entity.createdAt = prismaModel.createdAt;
    entity.disabledAt = prismaModel.disabledAt;

    entity.images = prismaModel.images.map((img) => ({
      id: img.id,
      url: img.url,
      storageKey: img.storageKey,
      resultId: img.resultId,
    }));

    entity.cabinet = prismaModel.cabinet
      ? {
          id: prismaModel.cabinet.id,
          name: prismaModel.cabinet.name,
          slug: prismaModel.cabinet.slug,
          avatarUrl: prismaModel.cabinet.avatarUrl,
        }
      : undefined;

    entity.demand = prismaModel.demand
      ? { id: prismaModel.demand.id, title: prismaModel.demand.title }
      : null;

    return entity;
  }
}
