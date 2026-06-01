// ==================== Progress Types ====================

export interface Progress {
  id: number;
  projectId: number;
  groupId: number;
  phaseId?: number;
  title: string;
  content?: string;
  completionRate: number;
  reporterId: number;
  reportDate: string;
  status: ProgressStatus;
  createdAt: string;
  updatedAt: string;
  logs?: ProgressLog[];
}

export enum ProgressStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2
}

export interface ProgressLog {
  id: number;
  progressId: number;
  content: string;
  createdBy: number;
  createdAt: string;
}

export interface ProgressCreateDto {
  projectId: number;
  groupId: number;
  phaseId?: number;
  title: string;
  content?: string;
  completionRate?: number;
  reportDate: string;
}

export interface ProgressUpdateDto {
  title?: string;
  content?: string;
  completionRate?: number;
  status?: ProgressStatus;
}

export interface ProgressLogCreateDto {
  content: string;
}

export interface ProgressQueryDto {
  projectId?: number;
  groupId?: number;
  phaseId?: number;
  reporterId?: number;
  status?: ProgressStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}
