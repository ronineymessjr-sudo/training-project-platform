// ==================== Role & Permission Types ====================

export interface Role {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  createdAt: string;
}

export interface Permission {
  id: number;
  name: string;
  displayName: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
}

export interface Menu {
  id: number;
  parentId: number;
  name: string;
  path?: string;
  component?: string;
  icon?: string;
  sortOrder: number;
  menuType: MenuType;
  visible: boolean;
  status: boolean;
  permissionId?: number;
  children?: Menu[];
}

export enum MenuType {
  CATALOG = 1,
  MENU = 2,
  BUTTON = 3
}

export interface RoleCreateDto {
  name: string;
  displayName: string;
  description?: string;
}

export interface RoleUpdateDto {
  displayName?: string;
  description?: string;
}

export interface RoleMenuDto {
  menuIds: number[];
}

export interface RolePermissionDto {
  permissionIds: number[];
}
