import { ResultType } from '@prisma/client';
import { ResultEntity } from './result.entity';
import {
  PaginatedResult,
  PaginationParams,
} from '../../../shared/domain/pagination.interface';

export interface CreateResultInfo {
  title: string;
  description: string;
  type: ResultType;
  cabinetId: string;
  demandId?: string | null;
  images?: CreateResultImageInfo[];
  protocolFileKey?: string | null;
  protocolFileUrl?: string | null;
  protocolFileName?: string | null;
  protocolFileMimeType?: string | null;
  protocolFileSize?: number | null;
}

export interface CreateResultImageInfo {
  storageKey: string;
  url: string;
}

export interface UpdateResultInfo {
  title?: string;
  description?: string;
  type?: ResultType;
  demandId?: string | null;
}

export interface ResultProtocolInfo {
  protocolFileKey: string;
  protocolFileUrl: string;
  protocolFileName: string;
  protocolFileMimeType: string;
  protocolFileSize: number;
}

export interface ListResultsFilters extends PaginationParams {
  cabinetId?: string;
  demandId?: string;
  type?: ResultType;
  search?: string;
}

export abstract class IResultsRepository {
  abstract create(data: CreateResultInfo): Promise<ResultEntity>;
  abstract findById(id: string): Promise<ResultEntity | null>;
  abstract findAll(
    filters: ListResultsFilters,
  ): Promise<PaginatedResult<ResultEntity>>;
  abstract update(id: string, data: UpdateResultInfo): Promise<ResultEntity>;
  abstract softDelete(id: string): Promise<void>;
  abstract addImages(
    resultId: string,
    images: CreateResultImageInfo[],
  ): Promise<void>;
  abstract setProtocol(
    resultId: string,
    protocol: ResultProtocolInfo,
  ): Promise<ResultEntity>;
}
