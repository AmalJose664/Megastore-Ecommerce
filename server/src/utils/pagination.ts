import { PaginationQuery } from '../types';
import config from '../config/env';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const parsePagination = (query: PaginationQuery): PaginationOptions => {
  const page = Math.max(1, parseInt(String(query.page || 1), 10));
  const limit = Math.min(
    config.pagination.maxPageSize,
    Math.max(1, parseInt(String(query.limit || config.pagination.defaultPageSize), 10))
  );
  const sort = query.sort || 'createdAt';
  const order = query.order === 'asc' ? 'asc' : 'desc';

  return { page, limit, sort, order };
};

export const buildPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): any => {
  return {
    success: true,
    message: `Retrieved ${data.length} items successfully`,
    data,
    totalItems: data.length,
    total,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const calculateSkip = (page: number, limit: number): number => {
  return (page - 1) * limit;
};