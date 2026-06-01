// ==================== Class & Major Types ====================

export interface Major {
  id: number;
  code: string;
  name: string;
  department?: string;
  description?: string;
  status: boolean;
  createdAt: string;
}

export interface Class {
  id: number;
  majorId: number;
  grade: number;
  classNo: number;
  name: string;
  counselorId?: number;
  studentCount: number;
  status: boolean;
  createdAt: string;
  major?: Major;
  counselor?: {
    id: number;
    username: string;
    realName: string;
  };
}

export interface StudentImportLog {
  id: number;
  classId: number;
  operatorId: number;
  totalCount: number;
  successCount: number;
  failCount: number;
  errorDetail?: string;
  fileUrl?: string;
  status: ImportStatus;
  createdAt: string;
}

export enum ImportStatus {
  PROCESSING = 0,
  COMPLETED = 1,
  PARTIAL_FAIL = 2
}

export interface MajorCreateDto {
  code: string;
  name: string;
  department?: string;
  description?: string;
}

export interface ClassCreateDto {
  majorId: number;
  grade: number;
  classNo: number;
  name: string;
  counselorId?: number;
}

export interface ClassQueryDto {
  majorId?: number;
  grade?: number;
  counselorId?: number;
  keyword?: string;
  page?: number;
  pageSize?: number;
}
