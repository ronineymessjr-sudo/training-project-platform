// ==================== User Types ====================

export interface User {
  id: number;
  username: string;
  realName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  gender: Gender;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum Gender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2
}

export enum UserStatus {
  DISABLED = 0,
  ENABLED = 1
}

export interface UserCreateDto {
  username: string;
  password: string;
  realName: string;
  email?: string;
  phone?: string;
  gender?: Gender;
}

export interface UserUpdateDto {
  realName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  gender?: Gender;
  status?: UserStatus;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: User;
  expiresIn: number;
}
