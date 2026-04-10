import {
  PaginatedResponse,
  PaginationParams,
} from '../domain/pagination.interface';

export class PaginationHelper {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 10;
  private static readonly MAX_LIMIT = 100;

  static getSkipTake(params: Partial<PaginationParams>) {
    const page = Math.max(1, params.page || this.DEFAULT_PAGE);
    const limit = Math.max(
      1,
      Math.min(params.limit || this.DEFAULT_LIMIT, this.MAX_LIMIT),
    );
    const skip = (page - 1) * limit;

    return {
      skip,
      take: limit,
      page,
      limit,
    };
  }

  static buildResponse<T>(
    items: T[],
    total: number,
    params: Pick<
      ReturnType<typeof PaginationHelper.getSkipTake>,
      'page' | 'limit'
    >,
  ): PaginatedResponse<T> {
    return {
      items,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}
