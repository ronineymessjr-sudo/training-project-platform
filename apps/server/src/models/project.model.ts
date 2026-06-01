import { BaseModel, BaseEntity } from './base.model';

export interface Project extends BaseEntity {
  topic_id?: number;
  name: string;
  description?: string;
  class_id?: number;
  teacher_id: number;
  start_date?: Date;
  end_date?: Date;
  status: number;
  config?: string;
}

export class ProjectModel extends BaseModel<Project> {
  constructor() {
    super('projects');
  }

  // 获取项目列表（带关联信息）
  async findProjectsWithDetails(
    page: number,
    pageSize: number,
    filters?: { teacherId?: number; classId?: number; status?: number; keyword?: string }
  ): Promise<{ list: any[]; total: number }> {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (filters?.teacherId) {
      whereClause += ' AND p.teacher_id = ?';
      params.push(filters.teacherId);
    }

    if (filters?.classId) {
      whereClause += ' AND p.class_id = ?';
      params.push(filters.classId);
    }

    if (filters?.status !== undefined) {
      whereClause += ' AND p.status = ?';
      params.push(filters.status);
    }

    if (filters?.keyword) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const keyword = `%${filters.keyword}%`;
      params.push(keyword, keyword);
    }

    // 查询列表
    const listSql = `
      SELECT 
        p.*,
        t.name as topic_name,
        c.name as class_name,
        u.real_name as teacher_name,
        COUNT(DISTINCT g.id) as group_count,
        COUNT(DISTINCT gm.student_id) as student_count
      FROM projects p
      LEFT JOIN topics t ON p.topic_id = t.id
      LEFT JOIN classes c ON p.class_id = c.id
      LEFT JOIN users u ON p.teacher_id = u.id
      LEFT JOIN groups g ON p.id = g.project_id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `;

    const listParams = [...params, pageSize, (page - 1) * pageSize];
    const list = await this.query(listSql, listParams);

    // 查询总数
    const countSql = `
      SELECT COUNT(*) as total FROM projects p
      ${whereClause}
    `;

    const countResult = await this.query(countSql, params);
    const total = countResult[0]?.total || 0;

    return { list, total };
  }

  // 获取项目详情
  async findProjectDetail(projectId: number): Promise<any | null> {
    const rows = await this.query(
      `
      SELECT 
        p.*,
        t.name as topic_name,
        t.description as topic_description,
        c.name as class_name,
        c.grade,
        c.class_no,
        u.real_name as teacher_name,
        u.email as teacher_email
      FROM projects p
      LEFT JOIN topics t ON p.topic_id = t.id
      LEFT JOIN classes c ON p.class_id = c.id
      LEFT JOIN users u ON p.teacher_id = u.id
      WHERE p.id = ?
      `,
      [projectId]
    );

    if (rows.length === 0) return null;

    const project = rows[0];

    // 获取项目阶段
    const phases = await this.query(
      'SELECT * FROM project_phases WHERE project_id = ? ORDER BY sort_order',
      [projectId]
    );

    // 获取分组列表
    const groups = await this.query(
      `
      SELECT g.*, u.real_name as leader_name, COUNT(gm.id) as member_count
      FROM groups g
      LEFT JOIN users u ON g.leader_id = u.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      WHERE g.project_id = ?
      GROUP BY g.id
      `,
      [projectId]
    );

    return {
      ...project,
      phases,
      groups,
    };
  }

  // 获取我参与的项目（学生视角）
  async findMyProjects(studentId: number): Promise<any[]> {
    const rows = await this.query(
      `
      SELECT DISTINCT
        p.*,
        t.name as topic_name,
        c.name as class_name,
        u.real_name as teacher_name,
        g.id as my_group_id,
        g.name as my_group_name
      FROM projects p
      INNER JOIN groups g ON p.id = g.project_id
      INNER JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN topics t ON p.topic_id = t.id
      LEFT JOIN classes c ON p.class_id = c.id
      LEFT JOIN users u ON p.teacher_id = u.id
      WHERE gm.student_id = ? AND gm.status = 1
      ORDER BY p.id DESC
      `,
      [studentId]
    );
    return rows;
  }
}

export const projectModel = new ProjectModel();
