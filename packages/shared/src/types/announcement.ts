// ==================== Announcement Types ====================

export interface Announcement {
  id: number;
  projectId?: number;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  publisherId: number;
  targetRoles?: string[];
  status: AnnouncementStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  publisher?: {
    id: number;
    username: string;
    realName: string;
  };
}

export enum AnnouncementType {
  NOTIFICATION = 1,  // 通知
  ANNOUNCEMENT = 2,   // 公告
  REMINDER = 3        // 提醒
}

export enum AnnouncementPriority {
  NORMAL = 0,
  IMPORTANT = 1,
  URGENT = 2
}

export enum AnnouncementStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  WITHDRAWN = 2
}

export interface AnnouncementCreateDto {
  projectId?: number;
  title: string;
  content: string;
  type: AnnouncementType;
  priority?: AnnouncementPriority;
  targetRoles?: string[];
}

export interface AnnouncementUpdateDto {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  status?: AnnouncementStatus;
}

export interface AnnouncementQueryDto {
  projectId?: number;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  status?: AnnouncementStatus;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export const AnnouncementTypeText: Record<AnnouncementType, string> = {
  [AnnouncementType.NOTIFICATION]: '通知',
  [AnnouncementType.ANNOUNCEMENT]: '公告',
  [AnnouncementType.REMINDER]: '提醒'
};

export const AnnouncementPriorityText: Record<AnnouncementPriority, string> = {
  [AnnouncementPriority.NORMAL]: '普通',
  [AnnouncementPriority.IMPORTANT]: '重要',
  [AnnouncementPriority.URGENT]: '紧急'
};
