import { BaseModel, BaseEntity } from './base.model';

export interface User extends BaseEntity {
  username: string;
  password_hash: string;
  real_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  gender?: number;
  status: number;
  last_login_at?: Date;
}

export class UserModel extends BaseModel<User> {
  constructor() {
    super('users');
  }

  // 根据用户名查找
  async findByUsername(username: string): Promise<User | null> {
    const [rows] = await this.query(
      'SELECT * FROM users WHERE username = ? AND status = 1',
      [username]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // 根据邮箱查找
  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await this.query(
      'SELECT * FROM users WHERE email = ? AND status = 1',
      [email]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // 获取用户角色
  async getUserRoles(userId: number): Promise<string[]> {
    const rows = await this.query(
      `SELECT r.name FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );
    return rows.map((row: any) => row.name);
  }

  // 获取用户权限
  async getUserPermissions(userId: number): Promise<string[]> {
    const rows = await this.query(
      `SELECT DISTINCT p.name FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       INNER JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );
    return rows.map((row: any) => row.name);
  }

  // 更新最后登录时间
  async updateLastLogin(userId: number): Promise<void> {
    await this.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [userId]
    );
  }

  // 分页查询用户列表
  async findUsersWithPagination(
    page: number,
    pageSize: number,
    filters?: { role?: string; status?: number; keyword?: string }
  ): Promise<{ list: any[]; total: number }> {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (filters?.status !== undefined) {
      whereClause += ' AND u.status = ?';
      params.push(filters.status);
    }

    if (filters?.keyword) {
      whereClause += ' AND (u.username LIKE ? OR u.real_name LIKE ? OR u.email LIKE ?)';
      const keyword = `%${filters.keyword}%`;
      params.push(keyword, keyword, keyword);
    }

    if (filters?.role) {
      whereClause += ' AND r.name = ?';
      params.push(filters.role);
    }

    // 查询列表
    const listSql = `
      SELECT u.*, GROUP_CONCAT(DISTINCT r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
    `;

    const listParams = [...params, pageSize, (page - 1) * pageSize];
    const list = await this.query(listSql, listParams);

    // 查询总数
    const countSql = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ${whereClause}
    `;

    const countResult = await this.query(countSql, params);
    const total = countResult[0]?.total || 0;

    return { list, total };
  }
}

export const userModel = new UserModel();
