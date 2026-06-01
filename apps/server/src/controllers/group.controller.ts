import { Request, Response, NextFunction } from 'express';
import { groupService } from '../services/group.service';
import { successResponse } from '../utils/response';
import { AppError } from '../utils/errors';

export class GroupController {
  // 获取分组列表
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const keyword = req.query.keyword as string;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const status = req.query.status ? parseInt(req.query.status as string) : undefined;

      const result = await groupService.getGroupList(page, pageSize, {
        keyword,
        projectId,
        status,
      });

      successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  // 获取分组详情
  async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = parseInt(req.params.id);
      
      if (isNaN(groupId)) {
        throw new AppError('无效的分组ID', 400);
      }

      const group = await groupService.getGroupDetail(groupId);

      successResponse(res, group);
    } catch (error) {
      next(error);
    }
  }

  // 创建分组
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, name, description, memberIds } = req.body;

      if (!projectId || !name) {
        throw new AppError('项目ID和分组名称不能为空', 400);
      }

      const leaderId = (req as any).user?.userId;

      const result = await groupService.createGroup({
        projectId,
        name,
        leaderId,
        description,
        memberIds,
      });

      successResponse(res, result, '分组创建成功');
    } catch (error) {
      next(error);
    }
  }

  // 更新分组
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = parseInt(req.params.id);
      
      if (isNaN(groupId)) {
        throw new AppError('无效的分组ID', 400);
      }

      const { name, description, status } = req.body;

      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.roles?.[0];

      const result = await groupService.updateGroup(
        groupId,
        { name, description, status },
        userId,
        userRole
      );

      successResponse(res, result, '分组更新成功');
    } catch (error) {
      next(error);
    }
  }

  // 删除分组
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = parseInt(req.params.id);
      
      if (isNaN(groupId)) {
        throw new AppError('无效的分组ID', 400);
      }

      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.roles?.[0];

      const result = await groupService.deleteGroup(groupId, userId, userRole);

      successResponse(res, result, '分组删除成功');
    } catch (error) {
      next(error);
    }
  }

  // 添加成员
  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = parseInt(req.params.id);
      const { studentId } = req.body;
      
      if (isNaN(groupId) || !studentId) {
        throw new AppError('分组ID和学生ID不能为空', 400);
      }

      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.roles?.[0];

      const result = await groupService.addMember(groupId, studentId, userId, userRole);

      successResponse(res, result, '成员添加成功');
    } catch (error) {
      next(error);
    }
  }

  // 移除成员
  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = parseInt(req.params.id);
      const studentId = parseInt(req.params.studentId);
      
      if (isNaN(groupId) || isNaN(studentId)) {
        throw new AppError('分组ID和学生ID不能为空', 400);
      }

      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.roles?.[0];

      const result = await groupService.removeMember(groupId, studentId, userId, userRole);

      successResponse(res, result, '成员移除成功');
    } catch (error) {
      next(error);
    }
  }

  // 获取我的分组
  async getMyGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('未登录', 401);
      }

      const groups = await groupService.getMyGroups(userId);

      successResponse(res, { list: groups });
    } catch (error) {
      next(error);
    }
  }
}

export const groupController = new GroupController();
