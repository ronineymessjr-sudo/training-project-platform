import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userModel, User } from '../models/user.model';
import { config } from '../config';
import { AppError } from '../utils/errors';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  roles: string[];
  permissions: string[];
}

export class AuthService {
  // 登录
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { username, password } = credentials;

    // 查找用户
    const user = await userModel.findByUsername(username);
    if (!user) {
      throw new AppError('用户名或密码错误', 401);
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('用户名或密码错误', 401);
    }

    // 检查用户状态
    if (user.status !== 1) {
      throw new AppError('账号已被禁用', 403);
    }

    // 获取角色和权限
    const roles = await userModel.getUserRoles(user.id);
    const permissions = await userModel.getUserPermissions(user.id);

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, roles },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // 更新最后登录时间
    await userModel.updateLastLogin(user.id);

    // 返回用户信息（不包含密码）
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      roles,
      permissions,
    };
  }

  // 注册
  async register(userData: {
    username: string;
    password: string;
    realName?: string;
    email?: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const { username, password, realName, email, phone } = userData;

    // 检查用户名是否已存在
    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      throw new AppError('用户名已存在', 409);
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await userModel.findByEmail(email);
      if (existingEmail) {
        throw new AppError('邮箱已被注册', 409);
      }
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const userId = await userModel.create({
      username,
      password_hash: passwordHash,
      real_name: realName,
      email,
      phone,
      status: 1,
    });

    // 分配默认角色（学生）
    await userModel.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES (?, (SELECT id FROM roles WHERE name = "student"))',
      [userId]
    );

    // 返回登录信息
    return this.login({ username, password });
  }

  // 验证 Token
  async verifyToken(token: string): Promise<{ userId: number; username: string; roles: string[] }> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      return {
        userId: decoded.userId,
        username: decoded.username,
        roles: decoded.roles,
      };
    } catch (error) {
      throw new AppError('无效的令牌', 401);
    }
  }

  // 获取当前用户信息
  async getCurrentUser(userId: number): Promise<any> {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    const roles = await userModel.getUserRoles(userId);
    const permissions = await userModel.getUserPermissions(userId);

    const { password_hash, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      roles,
      permissions,
    };
  }

  // 修改密码
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    // 验证旧密码
    const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('旧密码错误', 400);
    }

    // 加密新密码
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await userModel.update(userId, { password_hash: newPasswordHash } as any);
  }
}

export const authService = new AuthService();
