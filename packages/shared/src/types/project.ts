// ==================== Project Types ====================

import { ProjectStatus } from '../constants/project-status';

export interface Topic {
  id: number;
  title: string;
  description?: string;
  requirements?: string;
  difficulty: number;
  estimatedDays?: number;
  techStack?: string[];
  maxGroupSize: number;
  minGroupSize: number;
  creatorId: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  topicId?: number;
  name: string;
  description?: string;
  classId: number;
  teacherId: number;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  config?: ProjectConfig;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectConfig {
  scoreDimensions?: ScoreDimensionConfig[];
  defenseConfig?: DefenseConfig;
  [key: string]: any;
}

export interface ScoreDimensionConfig {
  dimensionId: number;
  weight: number;
  maxScore: number;
}

export interface DefenseConfig {
  maxDuration: number;
  panelCount: number;
}

export interface ProjectPhase {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  weight: number;
  sortOrder: number;
  status: number;
}

export interface ProjectCreateDto {
  topicId?: number;
  name: string;
  description?: string;
  classId: number;
  teacherId: number;
  startDate: string;
  endDate: string;
  config?: ProjectConfig;
}

export interface ProjectUpdateDto {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
  config?: ProjectConfig;
}

export interface ProjectQueryDto {
  classId?: number;
  teacherId?: number;
  status?: ProjectStatus;
  keyword?: string;
  page?: number;
  pageSize?: number;
}
