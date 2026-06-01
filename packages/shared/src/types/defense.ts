// ==================== Defense Types ====================

export interface Defense {
  id: number;
  projectId: number;
  groupId: number;
  title: string;
  defenseDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  panelTeacherIds?: number[];
  secretaryId?: number;
  status: DefenseStatus;
  maxDuration: number;
  createdAt: string;
  updatedAt: string;
}

export enum DefenseStatus {
  PENDING = 0,      // 待安排
  ARRANGED = 1,     // 已安排
  IN_PROGRESS = 2, // 进行中
  COMPLETED = 3    // 已完成
}

export interface DefenseCreateDto {
  projectId: number;
  groupId: number;
  title: string;
  defenseDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  panelTeacherIds?: number[];
  secretaryId?: number;
  maxDuration?: number;
}

export interface DefenseUpdateDto {
  title?: string;
  defenseDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  panelTeacherIds?: number[];
  secretaryId?: number;
  status?: DefenseStatus;
}

export interface DefenseQueryDto {
  projectId?: number;
  groupId?: number;
  status?: DefenseStatus;
  defenseDate?: string;
  page?: number;
  pageSize?: number;
}
