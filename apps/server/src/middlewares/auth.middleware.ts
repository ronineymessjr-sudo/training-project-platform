import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { query } from '../database/connection';
import { UnauthorizedError } from '../utils/errors';
import { AuthUser } from '../utils/auth';

interface UserRow {
  id: number;
  username: string;
  real_name: string;
  password_hash: string;
  status: number;
}

// JWT payload interface
interface JwtPayload {
  id: number;
  username: string;
  realName: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// JWT authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    
    // Get user from database
    const users = await query(
      `SELECT u.*, GROUP_CONCAT(r.code) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ? AND u.status = 1
       GROUP BY u.id`,
      [decoded.id]
    );

    if (users.length === 0) {
      throw new UnauthorizedError('User not found or inactive');
    }

    const user = users[0];
    
    // Attach user to request
    req.user = {
      id: user.id,
      username: user.username,
      realName: user.real_name,
      roles: user.roles ? user.roles.split(',') : [],
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};

// Role-based access control middleware
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    const hasRole = req.user.roles.some(role => roles.includes(role));
    
    if (!hasRole) {
      next(new UnauthorizedError('Insufficient permissions'));
      return;
    }

    next();
  };
};

// Alias for requireRole to match the import in routes - accepts array of roles
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    const hasRole = req.user.roles.some(role => roles.includes(role));
    
    if (!hasRole) {
      next(new UnauthorizedError('Insufficient permissions'));
      return;
    }

    next();
  };
};

// Permission-based access control middleware
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    try {
      // Get user permissions from database
      const permissions = await query(
        `SELECT DISTINCT p.code
         FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         JOIN user_roles ur ON rp.role_id = ur.role_id
         WHERE ur.user_id = ?`,
        [req.user.id]
      );

      const hasPermission = permissions.some((p: { code: string }) => p.code === permission);
      
      if (!hasPermission) {
        next(new UnauthorizedError('Permission denied'));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    
    const users = await query(
      `SELECT u.*, GROUP_CONCAT(r.code) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ? AND u.status = 1
       GROUP BY u.id`,
      [decoded.id]
    );

    if (users.length > 0) {
      const user = users[0];
      req.user = {
        id: user.id,
        username: user.username,
        realName: user.real_name,
        roles: user.roles ? user.roles.split(',') : [],
      };
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};
