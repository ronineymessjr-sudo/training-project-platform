import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { successResponse } from '../utils/response';
import { AppError } from '../utils/errors';

export class AuthController {
  // 登录
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        throw new AppError('用户名和密码不能为空', 400);
      }

      const result = await authService.login({ username, password });
      
      successResponse(res, result, '登录成功');
    } catch (error) {
      next(error);
    }
  }

  // 注册
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password, realName, email, phone } = req.body;

      if (!username || !password) {
        throw new AppError('用户名和密码不能为空', 400);
      }

      const result = await authService.register({
        username,
        password,
        realName,
        email,
        phone,
      });

      successResponse(res, result, '注册成功');
    } catch (error) {
      next(error);
    }
  }

  // 获取当前用户信息
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        throw new AppError('未登录', 401);
      }

      const user = await authService.getCurrentUser(userId);
      
      successResponse(res, user);
    } catch (error) {
      next(error);
    }
  }

  // 修改密码
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { oldPassword, newPassword } = req.body;

      if (!userId) {
        throw new AppError('未登录', 401);
      }

      if (!oldPassword || !newPassword) {
        throw new AppError('旧密码和新密码不能为空', 400);
      }

      await authService.changePassword(userId, oldPassword, newPassword);
      
      successResponse(res, null, '密码修改成功');
    } catch (error) {
      next(error);
    }
  }

  // 退出登录
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // 这里可以处理 token 黑名单等逻辑
      successResponse(res, null, '退出成功');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
