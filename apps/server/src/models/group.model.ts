import { BaseModel, BaseEntity } from './base.model';

export interface Group extends BaseEntity {
  project_id: number;
  name: string;
  leader_id: number;
  description?: string;
  status: number;
}

export interface GroupMember {
  id: number;
  group_id: number;
  student_id: number;
  role: 'leader' | 'member';
  status: number;
  join_time?: Date;
  created_at?: Date;
}

export class GroupModel extends BaseModel<Group> {
  constructor() {
    super('groups');
  }

  // 获取分组列表（带关联信息）
  async findGroupsWithDetails(
    page: number,
    pageSize: number,
    filters?: { projectId?: number; leaderId?: number; status?: number; keyword?: string }
  ): Promise<{ list: any[]; total: number }> {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (filters?.projectId) {
      whereClause += ' AND g.project_id = ?';
      params.push(filters.projectId);
    }

    if (filters?.leaderId) {
      whereClause += ' AND g.leader_id = ?';
      params.push(filters.leaderId);
    }

    if (filters?.status !== undefined) {
      whereClause += ' AND g.status = ?';
      params.push(filters.status);
    }

    if (filters?.keyword) {
      whereClause += ' AND g.name LIKE ?';
      params.push(`%${filters.keyword}%`);
    }

    // 查询列表
    const listSql = `
      SELECT 
        g.*,
        p.name as project_name,
        u.real_name as leader_name,
        COUNT(DISTINCT gm.id) as member_count
      FROM groups g
      LEFT JOIN projects p ON g.project_id = p.id
      LEFT JOIN users u ON g.leader_id = u.id
      LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = 1
      ${whereClause}
      GROUP BY g.id
      ORDER BY g.id DESC
      LIMIT ? OFFSET ?
    `;

    const listParams = [...params, pageSize, (page - 1) * pageSize];
    const list = await this.query(listSql, listParams);

    // 查询总数
    const countSql = `
      SELECT COUNT(*) as total FROM groups g
      ${whereClause}
    `;

    const countResult = await this.query(countSql, params);
    const total = countResult[0]?.total || 0;

    return { list, total };
  }

  // 获取分组详情
  async findGroupDetail(groupId: number): Promise<any | null> {
    const rows = await this.query(
      `
      SELECT 
        g.*,
        p.name as project_name,
        p.teacher_id,
        u.real_name as leader_name
      FROM groups g
      LEFT JOIN projects p ON g.project_id = p.id
      LEFT JOIN users u ON g.leader_id = u.id
      WHERE g.id = ?
      `,
      [groupId]
    );

    if (rows.length === 0) return null;

    const group = rows[0];

    // 获取成员列表
    const members = await this.query(
      `
      SELECT 
        gm.*,
        u.username,
        u.real_name,
        u.email,
        u.avatar_url
      FROM group_members gm
      LEFT JOIN users u ON gm.student_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.role = 'leader' DESC, gm.created_at ASC
      `,
      [groupId]
    );

    return {
      ...group,
      members,
    };
  }

  // 添加成员
  async addMember(groupId: number, studentId: number, role: number = 0): Promise<number> {
    const [result] = await this.query(
      'INSERT INTO group_members (group_id, student_id, role, status, joined_at) VALUES (?, ?, ?, 1, NOW())',
      [groupId, studentId, role]
    );
    return result.insertId;
  }

  // 移除成员
  async removeMember(groupId: number, studentId: number): Promise<boolean> {
    const [result] = await this.query(
      'UPDATE group_members SET status = 0 WHERE group_id = ? AND student_id = ?',
      [groupId, studentId]
    );
    return result.affectedRows > 0;
  }

  // 检查学生是否已在某项目的分组中
  async checkStudentInProject(studentId: number, projectId: number): Promise<boolean> {
    const rows = await this.query(
      `
      SELECT 1 FROM group_members gm
      INNER JOIN groups g ON gm.group_id = g.id
      WHERE gm.student_id = ? AND g.project_id = ? AND gm.status = 1
      LIMIT 1
      `,
      [studentId, projectId]
    );
    return rows.length > 0;
  }

  // 获取我的分组
  async findMyGroups(studentId: number): Promise<any[]> {
    const rows = await this.query(
      `
      SELECT 
        g.*,
        p.name as project_name,
        gm.role as my_role
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN projects p ON g.project_id = p.id
      WHERE gm.student_id = ? AND gm.status = 1
      ORDER BY g.id DESC
      `,
      [studentId]
    );
    return rows;
  }
}

export const groupModel = new GroupModel();
