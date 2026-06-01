import { Request } from 'express';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface AuthUser {
  id: number;
  username: string;
  realName: string;
  roles: string[];
  permissions?: string[];
}

export interface AuthRequest extends Request {
  user: AuthUser;
}

export function hasRole(user: AuthUser | undefined, ...roles: string[]): boolean {
  if (!user) return false;
  return roles.some(role => user.roles.includes(role));
}

export function hasPermission(user: AuthUser | undefined, ...permissions: string[]): boolean {
  if (!user) return false;
  if (user.roles.includes('admin')) return true; // Admin has all permissions
  if (!user.permissions) return false;
  return permissions.some(perm => user.permissions!.includes(perm));
}

// Generate JWT token
export function generateToken(payload: { id: number; username: string; realName: string }): string {
  const jwt = require('jsonwebtoken');
  const { config } = require('../config');
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

// Get user with roles
export async function getUserWithRoles(userId: number): Promise<any> {
  const { query } = require('../database/connection');
  const users = await query(
    `SELECT u.*, GROUP_CONCAT(r.code) as roles
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.id
     WHERE u.id = ? AND u.status = 1
     GROUP BY u.id`,
    [userId]
  );
  return users[0];
}
