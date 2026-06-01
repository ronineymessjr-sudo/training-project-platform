import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { successResponse } from '../utils/response';
import { AppError } from '../utils/errors';

export class ProjectController {
  // 获取项目列表
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const keyword = req.query.keyword as string;
      const status = req.query.status ? parseInt(req.query.status as string) : undefined;
      const myOnly = req.query.myOnly === 'true';

      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.roles?.[0];

      const result = await projectService.getProjectList(
        page,
        pageSize,
        { keyword, status, myOnly },
        userId,
        userRole
      );

      successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  // 获取项目详情
  async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        throw new AppError('无效的项目ID', 400);
      }

      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.roles?.[0];

      const project = await projectService.getProjectDetail(projectId, userId, userRole);

      successResponse(res, project);
    } catch (error) {
      next(error);
    }
  }

  // 创建项目
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, topicId, classId, startDate, endDate, config } = req.body;

      if (!name) {
        throw new AppError('项目名称不能为空', 400);
      }

      const userId = (req as any).user?.userId;

      const result = await projectService.createProject({
        name,
        description,
        topicId,
        classId,
        teacherId: userId,
        startDate,
        endDate,
        config,
      });

      successResponse(res, result, '项目创建成功');
    } catch (error) {
      next(error);
    }
  }

  // 更新项目
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        throw new AppError('无效的项目ID', 400);
      }

      const { name, description, topicId, classId, startDate, endDate, status, config } = req.body;

      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.roles?.[0];

      const result = await projectService.updateProject(
        projectId,
        { name, description, topicId, classId, startDate, endDate, status, config },
        userId,
        userRole
      );

      successResponse(res, result, '项目更新成功');
    } catch (error) {
      next(error);
    }
  }

  // 删除项目
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        throw new AppError('无效的项目ID', 400);
      }

      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.roles?.[0];

      const result = await projectService.deleteProject(projectId, userId, userRole);

      successResponse(res, result, '项目删除成功');
    } catch (error) {
      next(error);
    }
  }

  // 获取我的项目
  async getMyProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('未登录', 401);
      }

      const projects = await projectService.getMyProjects(userId);

      successResponse(res, { list: projects });
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();
