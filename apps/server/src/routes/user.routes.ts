import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../database/connection';
import { success, pageSuccess, getPagination } from '../utils/response';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { authenticate, requireRole, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /users - Get user list (admin only)
router.get('/', requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, pageSize, keyword, status, role } = req.query;
    const { offset, limit } = getPagination(
      parseInt(page as string),
      parseInt(pageSize as string)
    );
    
    let whereClause = '1=1';
    const params: any[] = [];
    
    if (keyword) {
      whereClause += ' AND (u.username LIKE ? OR u.real_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    
    if (status !== undefined) {
      whereClause += ' AND u.status = ?';
      params.push(parseInt(status as string));
    }
    
    // Count total
    let countSql = `SELECT COUNT(*) as total FROM users u WHERE ${whereClause}`;
    if (role) {
      countSql = `
        SELECT COUNT(*) as total FROM users u
        INNER JOIN user_roles ur ON u.id = ur.user_id
        INNER JOIN roles r ON ur.role_id = r.id
        WHERE ${whereClause} AND r.name = ?
      `;
      params.push(role);
    }
    
    const [countResult] = await query<[{ total: number }]>(countSql, params);
    const total = countResult.total;
    
    // Get list
    let sql = `
      SELECT u.id, u.username, u.real_name, u.email, u.phone, u.avatar_url, 
             u.gender, u.status, u.last_login_at, u.created_at,
             GROUP_CONCAT(r.display_name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    if (role) {
      sql = `
        SELECT u.id, u.username, u.real_name, u.email, u.phone, u.avatar_url, 
               u.gender, u.status, u.last_login_at, u.created_at,
               GROUP_CONCAT(r.display_name) as roles
        FROM users u
        INNER JOIN user_roles ur ON u.id = ur.user_id
        INNER JOIN roles r ON ur.role_id = r.id
        WHERE ${whereClause}
        GROUP BY u.id
        HAVING SUM(r.name = ?) > 0
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `;
    }
    
    const listParams = role ? [...params.slice(0, -1), role, limit, offset] : [...params, limit, offset];
    const users = await query(sql, listParams);
    
    res.json(pageSuccess(
      users.map((u: any) => ({
        ...u,
        roles: u.roles ? u.roles.split(',') : [],
      })),
      total,
      parseInt(page as string) || 1,
      limit
    ));
  } catch (err) {
    next(err);
  }
});

// GET /users/:id - Get user detail
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check permission: admin can view all, or user can view themselves
    if (req.user!.id !== parseInt(id) && !req.user!.roles.includes('admin')) {
      throw new ForbiddenError('无权查看此用户');
    }
    
    const users = await query(`
      SELECT u.id, u.username, u.real_name, u.email, u.phone, u.avatar_url, 
             u.gender, u.status, u.last_login_at, u.created_at
      FROM users u WHERE u.id = ?
    `, [id]);
    
    if ((users as any[]).length === 0) {
      throw new NotFoundError('用户不存在');
    }
    
    const user = (users as any[])[0];
    
    // Get roles
    const roles = await query(`
      SELECT r.id, r.name, r.display_name 
      FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `, [id]);
    
    res.json(success({
      ...user,
      roles,
    }));
  } catch (err) {
    next(err);
  }
});

// POST /users - Create user (admin only)
router.post('/', requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, realName, email, phone, gender, roleIds } = req.body;
    
    if (!username || !password || !realName) {
      throw new BadRequestError('用户名、密码和真实姓名不能为空');
    }
    
    // Check if username exists
    const existing = await query('SELECT id FROM users WHERE username = ?', [username]);
    if ((existing as any[]).length > 0) {
      throw new BadRequestError('用户名已存在');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const result = await query(`
      INSERT INTO users (username, password_hash, real_name, email, phone, gender)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [username, hashedPassword, realName, email, phone, gender || 0]);
    
    const userId = (result as any).insertId;
    
    // Assign roles
    if (roleIds && roleIds.length > 0) {
      const roleValues = roleIds.map((roleId: number) => `(${userId}, ${roleId})`).join(',');
      await query(`INSERT INTO user_roles (user_id, role_id) VALUES ${roleValues}`);
    }
    
    res.json(success({ id: userId }, '用户创建成功'));
  } catch (err) {
    next(err);
  }
});

// PUT /users/:id - Update user
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Only admin or self can update
    if (req.user!.id !== parseInt(id) && !req.user!.roles.includes('admin')) {
      throw new ForbiddenError('无权修改此用户');
    }
    
    const { realName, email, phone, avatarUrl, gender, status } = req.body;
    
    const updates: string[] = [];
    const params: any[] = [];
    
    if (realName !== undefined) {
      updates.push('real_name = ?');
      params.push(realName);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      params.push(avatarUrl);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      params.push(gender);
    }
    // Only admin can change status
    if (status !== undefined && req.user!.roles.includes('admin')) {
      updates.push('status = ?');
      params.push(status);
    }
    
    if (updates.length === 0) {
      throw new BadRequestError('没有要更新的字段');
    }
    
    params.push(id);
    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    
    res.json(success(null, '用户更新成功'));
  } catch (err) {
    next(err);
  }
});

// DELETE /users/:id - Delete user (admin only)
router.delete('/:id', requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Cannot delete yourself
    if (req.user!.id === parseInt(id)) {
      throw new BadRequestError('不能删除自己');
    }
    
    await query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json(success(null, '用户删除成功'));
  } catch (err) {
    next(err);
  }
});

export default router;
