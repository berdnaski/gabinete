import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ResultEntity } from '../domain/result.entity';
import {
  CreateResultImageInfo,
  CreateResultInfo,
  IResultsRepository,
  ListResultsFilters,
  ResultProtocolInfo,
  UpdateResultInfo,
} from '../domain/results.repository.interface';
import { ResultEntityMapper } from './result-entity.mapper';
import { PaginatedResult } from '../../../shared/domain/pagination.interface';
import { PaginationHelper } from '../../../shared/application/pagination.helper';

const RESULT_INCLUDE = {
  images: true,
  cabinet: { select: { id: true, name: true, slug: true, avatarUrl: true } },
  demand: { select: { id: true, title: true } },
} as const;

@Injectable()
export class ResultsRepository implements IResultsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateResultInfo): Promise<ResultEntity> {
    const result = await this.prisma.result.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        cabinetId: data.cabinetId,
        demandId: data.demandId ?? null,
        protocolFileKey: data.protocolFileKey ?? null,
        protocolFileUrl: data.protocolFileUrl ?? null,
        protocolFileName: data.protocolFileName ?? null,
        protocolFileMimeType: data.protocolFileMimeType ?? null,
        protocolFileSize: data.protocolFileSize ?? null,
        images: {
          create: (data.images ?? []).map((img) => ({
            storageKey: img.storageKey,
            url: img.url,
          })),
        },
      },
      include: RESULT_INCLUDE,
    });

    return ResultEntityMapper.toDomain(result);
  }

  async findById(id: string): Promise<ResultEntity | null> {
    const result = await this.prisma.result.findUnique({
      where: { id, disabledAt: null },
      include: RESULT_INCLUDE,
    });

    return result ? ResultEntityMapper.toDomain(result) : null;
  }

  async findAll(filters: ListResultsFilters): Promise<PaginatedResult<ResultEntity>> {
    const { skip, take } = PaginationHelper.getSkipTake(filters);

    const where = {
      disabledAt: null,
      cabinetId: filters.cabinetId ?? undefined,
      demandId: filters.demandId ?? undefined,
      type: filters.type ?? undefined,
      OR: filters.search
        ? [
            { title: { contains: filters.search, mode: 'insensitive' as const } },
            { description: { contains: filters.search, mode: 'insensitive' as const } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.result.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: RESULT_INCLUDE,
      }),
      this.prisma.result.count({ where }),
    ]);

    return {
      items: items.map(ResultEntityMapper.toDomain),
      total,
    };
  }

  async update(id: string, data: UpdateResultInfo): Promise<ResultEntity> {
    const result = await this.prisma.result.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        demandId: data.demandId,
      },
      include: RESULT_INCLUDE,
    });

    return ResultEntityMapper.toDomain(result);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.result.update({
      where: { id },
      data: { disabledAt: new Date() },
    });
  }

  async addImages(resultId: string, images: CreateResultImageInfo[]): Promise<void> {
    await this.prisma.resultImage.createMany({
      data: images.map((img) => ({
        resultId,
        storageKey: img.storageKey,
        url: img.url,
      })),
    });
  }

  async setProtocol(resultId: string, protocol: ResultProtocolInfo): Promise<ResultEntity> {
    const result = await this.prisma.result.update({
      where: { id: resultId },
      data: {
        protocolFileKey: protocol.protocolFileKey,
        protocolFileUrl: protocol.protocolFileUrl,
        protocolFileName: protocol.protocolFileName,
        protocolFileMimeType: protocol.protocolFileMimeType,
        protocolFileSize: protocol.protocolFileSize,
      },
      include: RESULT_INCLUDE,
    });

    return ResultEntityMapper.toDomain(result);
  }
}
