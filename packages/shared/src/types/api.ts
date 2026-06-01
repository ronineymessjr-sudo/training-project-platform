// ==================== API Response Types ====================

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

export interface ApiError {
  code: number;
  message: string;
  details?: Record<string, string>;
}

// 常用错误码
export const ErrorCodes = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  // 业务错误码 1000+
  USER_NOT_FOUND: 1001,
  INVALID_PASSWORD: 1002,
  USERNAME_EXISTS: 1003,
  USER_DISABLED: 1004,
  // 项目错误码 2000+
  PROJECT_NOT_FOUND: 2001,
  PROJECT_ACCESS_DENIED: 2002,
  // 分组错误码 3000+
  GROUP_NOT_FOUND: 3001,
  GROUP_FULL: 3002,
  GROUP_ACCESS_DENIED: 3003,
  ALREADY_IN_GROUP: 3004,
  // 进度错误码 4000+
  PROGRESS_NOT_FOUND: 4001,
  // 文档错误码 5000+
  DOCUMENT_NOT_FOUND: 5001,
  FILE_UPLOAD_FAILED: 5002,
  // 评分错误码 6000+
  SCORE_NOT_FOUND: 6001,
  SCORE_ALREADY_EXISTS: 6002,
  // 状态流转错误码 7000+
  INVALID_STATUS_TRANSITION: 7001,
} as const;

// 辅助函数
export function success<T>(data: T, message = '操作成功'): ApiResponse<T> {
  return {
    code: ErrorCodes.SUCCESS,
    message,
    data,
    timestamp: Date.now()
  };
}

export function error(code: number, message: string): ApiResponse {
  return {
    code,
    message,
    data: null,
    timestamp: Date.now()
  };
}

export function pageSuccess<T>(list: T[], total: number, page: number, pageSize: number): ApiResponse<PageResult<T>> {
  return success({
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }, '查询成功');
}
