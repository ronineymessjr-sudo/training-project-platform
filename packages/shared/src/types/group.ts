// ==================== Group Types ====================

import { GroupStatus } from '../constants/project-status';

export interface Group {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  leaderId?: number;
  maxMembers: number;
  status: GroupStatus;
  createdAt: string;
  updatedAt: string;
  members?: GroupMember[];
}

export interface GroupMember {
  id: number;
  groupId: number;
  studentId: number;
  role: GroupMemberRole;
  joinedAt: string;
  status: GroupMemberStatus;
  student?: {
    id: number;
    username: string;
    realName: string;
    avatarUrl?: string;
  };
}

export enum GroupMemberRole {
  MEMBER = 0,
  LEADER = 1
}

export enum GroupMemberStatus {
  ACTIVE = 1,
  REMOVED = 0
}

export interface GroupApplication {
  id: number;
  groupId: number;
  studentId: number;
  type: ApplicationType;
  status: ApplicationStatus;
  message?: string;
  processedBy?: number;
  processedAt?: string;
  createdAt: string;
}

export enum ApplicationType {
  APPLY_TO_JOIN = 1,
  INVITE = 2
}

export enum ApplicationStatus {
  PENDING = 0,
  ACCEPTED = 1,
  REJECTED = 2
}

export interface GroupCreateDto {
  projectId: number;
  name: string;
  description?: string;
  leaderId?: number;
  maxMembers?: number;
}

export interface GroupUpdateDto {
  name?: string;
  description?: string;
  maxMembers?: number;
  status?: GroupStatus;
}

export interface GroupAddMemberDto {
  studentId: number;
  role?: GroupMemberRole;
  message?: string;
}

export interface GroupQueryDto {
  projectId?: number;
  status?: GroupStatus;
  keyword?: string;
  page?: number;
  pageSize?: number;
}
