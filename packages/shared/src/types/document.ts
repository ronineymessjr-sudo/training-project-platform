// ==================== Document Types ====================

export interface Document {
  id: number;
  projectId: number;
  groupId?: number;
  uploaderId: number;
  name: string;
  type?: string;
  fileUrl: string;
  fileSize?: number;
  fileHash?: string;
  description?: string;
  category: DocumentCategory;
  status: DocumentStatus;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  versions?: DocumentVersion[];
}

export enum DocumentCategory {
  REQUIREMENT = 1,  // 需求文档
  DESIGN = 2,       // 设计文档
  CODE = 3,         // 代码
  TEST = 4,         // 测试文档
  REPORT = 5,       // 报告
  OTHER = 6         // 其他
}

export enum DocumentStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  version: string;
  fileUrl: string;
  fileSize?: number;
  changeLog?: string;
  createdBy: number;
  createdAt: string;
}

export interface DocumentCreateDto {
  projectId: number;
  groupId?: number;
  name: string;
  type?: string;
  fileUrl: string;
  fileSize?: number;
  fileHash?: string;
  description?: string;
  category: DocumentCategory;
}

export interface DocumentUpdateDto {
  name?: string;
  description?: string;
  category?: DocumentCategory;
  status?: DocumentStatus;
}

export interface DocumentVersionCreateDto {
  version: string;
  fileUrl: string;
  fileSize?: number;
  changeLog?: string;
}

export interface DocumentQueryDto {
  projectId?: number;
  groupId?: number;
  category?: DocumentCategory;
  uploaderId?: number;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export const DocumentCategoryText: Record<DocumentCategory, string> = {
  [DocumentCategory.REQUIREMENT]: '需求文档',
  [DocumentCategory.DESIGN]: '设计文档',
  [DocumentCategory.CODE]: '代码',
  [DocumentCategory.TEST]: '测试文档',
  [DocumentCategory.REPORT]: '报告',
  [DocumentCategory.OTHER]: '其他'
};
