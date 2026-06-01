// ==================== Workload Types ====================

export interface Workload {
  id: number;
  projectId: number;
  groupId: number;
  studentId: number;
  taskName: string;
  taskDescription?: string;
  taskType: WorkloadTaskType;
  estimatedHours?: number;
  actualHours?: number;
  completionRate: number;
  contributionRatio?: number;
  status: WorkloadStatus;
  reportDate?: string;
  verifiedBy?: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    username: string;
    realName: string;
  };
}

export enum WorkloadTaskType {
  REQUIREMENT = 1,  // 需求分析
  DESIGN = 2,        // 设计
  CODING = 3,       // 编码
  TESTING = 4,      // 测试
  DOCUMENT = 5,     // 文档
  DEPLOYMENT = 6    // 部署
}

export enum WorkloadStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2
}

export interface WorkloadCreateDto {
  projectId: number;
  groupId: number;
  taskName: string;
  taskDescription?: string;
  taskType: WorkloadTaskType;
  estimatedHours?: number;
  actualHours?: number;
  completionRate?: number;
  reportDate?: string;
}

export interface WorkloadUpdateDto {
  taskName?: string;
  taskDescription?: string;
  taskType?: WorkloadTaskType;
  estimatedHours?: number;
  actualHours?: number;
  completionRate?: number;
  contributionRatio?: number;
  status?: WorkloadStatus;
}

export interface WorkloadVerifyDto {
  verified: boolean;
  comment?: string;
}

export interface WorkloadQueryDto {
  projectId?: number;
  groupId?: number;
  studentId?: number;
  taskType?: WorkloadTaskType;
  status?: WorkloadStatus;
  page?: number;
  pageSize?: number;
}

export const WorkloadTaskTypeText: Record<WorkloadTaskType, string> = {
  [WorkloadTaskType.REQUIREMENT]: '需求分析',
  [WorkloadTaskType.DESIGN]: '设计',
  [WorkloadTaskType.CODING]: '编码',
  [WorkloadTaskType.TESTING]: '测试',
  [WorkloadTaskType.DOCUMENT]: '文档',
  [WorkloadTaskType.DEPLOYMENT]: '部署'
};
