import { projectModel } from '../models/project.model';
import { AppError } from '../utils/errors';

export class ProjectService {
  // 获取项目列表
  async getProjectList(
    page: number = 1,
    pageSize: number = 10,
    filters?: { teacherId?: number; classId?: number; status?: number; keyword?: string; myOnly?: boolean },
    userId?: number,
    userRole?: string
  ) {
    // 根据角色过滤
    let queryFilters = { ...filters };
    
    if (userRole === 'teacher' && userId) {
      queryFilters.teacherId = userId;
    }

    const result = await projectModel.findProjectsWithDetails(page, pageSize, queryFilters);
    
    return {
      list: result.list,
      total: result.total,
      page,
      pageSize,
    };
  }

  // 获取项目详情
  async getProjectDetail(projectId: number, userId?: number, userRole?: string) {
    const project = await projectModel.findProjectDetail(projectId);
    
    if (!project) {
      throw new AppError('项目不存在', 404);
    }

    // 权限检查
    if (userRole === 'teacher' && project.teacher_id !== userId) {
      throw new AppError('无权访问该项目', 403);
    }

    return project;
  }

  // 创建项目
  async createProject(projectData: {
    name: string;
    description?: string;
    topicId?: number;
    classId?: number;
    teacherId: number;
    startDate?: string;
    endDate?: string;
    config?: any;
  }) {
    const { name, description, topicId, classId, teacherId, startDate, endDate, config } = projectData;

    const projectId = await projectModel.create({
      name,
      description,
      topic_id: topicId,
      class_id: classId,
      teacher_id: teacherId,
      start_date: startDate ? new Date(startDate) : undefined,
      end_date: endDate ? new Date(endDate) : undefined,
      status: 1,
      config: config ? JSON.stringify(config) : undefined,
    });

    return { id: projectId };
  }

  // 更新项目
  async updateProject(
    projectId: number,
    projectData: {
      name?: string;
      description?: string;
      topicId?: number;
      classId?: number;
      startDate?: string;
      endDate?: string;
      status?: number;
      config?: any;
    },
    userId?: number,
    userRole?: string
  ) {
    // 检查项目是否存在
    const existingProject = await projectModel.findById(projectId);
    if (!existingProject) {
      throw new AppError('项目不存在', 404);
    }

    // 权限检查
    if (userRole === 'teacher' && existingProject.teacher_id !== userId) {
      throw new AppError('无权修改该项目', 403);
    }

    const updateData: any = {};
    if (projectData.name !== undefined) updateData.name = projectData.name;
    if (projectData.description !== undefined) updateData.description = projectData.description;
    if (projectData.topicId !== undefined) updateData.topic_id = projectData.topicId;
    if (projectData.classId !== undefined) updateData.class_id = projectData.classId;
    if (projectData.startDate !== undefined) updateData.start_date = projectData.startDate ? new Date(projectData.startDate) : null;
    if (projectData.endDate !== undefined) updateData.end_date = projectData.endDate ? new Date(projectData.endDate) : null;
    if (projectData.status !== undefined) updateData.status = projectData.status;
    if (projectData.config !== undefined) updateData.config = JSON.stringify(projectData.config);

    await projectModel.update(projectId, updateData);
    
    return { success: true };
  }

  // 删除项目
  async deleteProject(projectId: number, userId?: number, userRole?: string) {
    // 检查项目是否存在
    const existingProject = await projectModel.findById(projectId);
    if (!existingProject) {
      throw new AppError('项目不存在', 404);
    }

    // 权限检查
    if (userRole === 'teacher' && existingProject.teacher_id !== userId) {
      throw new AppError('无权删除该项目', 403);
    }

    await projectModel.delete(projectId);
    
    return { success: true };
  }

  // 获取我的项目（学生）
  async getMyProjects(studentId: number) {
    const projects = await projectModel.findMyProjects(studentId);
    return projects;
  }
}

export const projectService = new ProjectService();
