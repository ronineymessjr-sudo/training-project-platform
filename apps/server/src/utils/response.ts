// Standard API response helpers

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface PageResult<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function success<T>(data: T, message?: string): ApiResponse<T> {
  return {
    code: 200,
    message: message || '操作成功',
    data,
    timestamp: Date.now(),
  };
}

// Alias for backward compatibility - supports both (res, data, message) and (data, message) patterns
export function successResponse<T>(res: any, data: T, message?: string): void {
  const response = {
    code: 200,
    message: message || '操作成功',
    data,
    timestamp: Date.now(),
  };
  res.json(response);
}

export function error(code: number, message: string): ApiResponse {
  return {
    code,
    message,
    data: null,
    timestamp: Date.now(),
  };
}

export function pageSuccess<T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number
): ApiResponse<PageResult<T>> {
  return {
    code: 200,
    message: '查询成功',
    data: {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
    timestamp: Date.now(),
  };
}

// Pagination helper
export function getPagination(page?: number, pageSize?: number): { offset: number; limit: number } {
  const p = Math.max(1, page || 1);
  const ps = Math.min(100, Math.max(1, pageSize || 10));
  return {
    offset: (p - 1) * ps,
    limit: ps,
  };
}
