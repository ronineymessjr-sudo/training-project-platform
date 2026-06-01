import { groupModel } from '../models/group.model';
import { AppError } from '../utils/errors';

export class GroupService {
  // 获取分组列表
  async getGroupList(
    page: number = 1,
    pageSize: number = 10,
    filters?: { projectId?: number; leaderId?: number; status?: number; keyword?: string }
  ) {
    const result = await groupModel.findGroupsWithDetails(page, pageSize, filters);
    
    return {
      list: result.list,
      total: result.total,
      page,
      pageSize,
    };
  }

  // 获取分组详情
  async getGroupDetail(groupId: number) {
    const group = await groupModel.findGroupDetail(groupId);
    
    if (!group) {
      throw new AppError('分组不存在', 404);
    }

    return group;
  }

  // 创建分组
  async createGroup(groupData: {
    projectId: number;
    name: string;
    leaderId: number;
    description?: string;
    memberIds?: number[];
  }) {
    const { projectId, name, leaderId, description, memberIds } = groupData;

    // 检查学生是否已在该项目的其他分组中
    const isInProject = await groupModel.checkStudentInProject(leaderId, projectId);
    if (isInProject) {
      throw new AppError('您已在该项目的其他分组中', 400);
    }

    // 创建分组
    const groupId = await groupModel.create({
      project_id: projectId,
      name,
      leader_id: leaderId,
      description,
      status: 1,
    });

    // 添加组长为成员
    await groupModel.addMember(groupId, leaderId, 1); // role=1 表示组长

    // 添加其他成员
    if (memberIds && memberIds.length > 0) {
      for (const memberId of memberIds) {
        if (memberId !== leaderId) {
          const isMemberInProject = await groupModel.checkStudentInProject(memberId, projectId);
          if (!isMemberInProject) {
            await groupModel.addMember(groupId, memberId, 0); // role=0 表示普通成员
          }
        }
      }
    }

    return { id: groupId };
  }

  // 更新分组
  async updateGroup(
    groupId: number,
    groupData: {
      name?: string;
      description?: string;
      status?: number;
    },
    userId?: number,
    userRole?: string
  ) {
    // 检查分组是否存在
    const existingGroup = await groupModel.findById(groupId);
    if (!existingGroup) {
      throw new AppError('分组不存在', 404);
    }

    // 权限检查（只有组长或教师可以修改）
    if (userRole === 'student' && existingGroup.leader_id !== userId) {
      throw new AppError('无权修改该分组', 403);
    }

    const updateData: any = {};
    if (groupData.name !== undefined) updateData.name = groupData.name;
    if (groupData.description !== undefined) updateData.description = groupData.description;
    if (groupData.status !== undefined) updateData.status = groupData.status;

    await groupModel.update(groupId, updateData);
    
    return { success: true };
  }

  // 删除分组
  async deleteGroup(groupId: number, userId?: number, userRole?: string) {
    // 检查分组是否存在
    const existingGroup = await groupModel.findById(groupId);
    if (!existingGroup) {
      throw new AppError('分组不存在', 404);
    }

    // 权限检查
    if (userRole === 'student' && existingGroup.leader_id !== userId) {
      throw new AppError('无权删除该分组', 403);
    }

    await groupModel.delete(groupId);
    
    return { success: true };
  }

  // 添加成员
  async addMember(groupId: number, studentId: number, userId?: number, userRole?: string) {
    // 检查分组是否存在
    const group = await groupModel.findById(groupId);
    if (!group) {
      throw new AppError('分组不存在', 404);
    }

    // 权限检查
    if (userRole === 'student' && group.leader_id !== userId) {
      throw new AppError('无权添加成员', 403);
    }

    // 检查学生是否已在该项目的其他分组中
    const isInProject = await groupModel.checkStudentInProject(studentId, group.project_id);
    if (isInProject) {
      throw new AppError('该学生已在其他分组中', 400);
    }

    await groupModel.addMember(groupId, studentId, 0); // role=0 表示普通成员
    
    return { success: true };
  }

  // 移除成员
  async removeMember(groupId: number, studentId: number, userId?: number, userRole?: string) {
    // 检查分组是否存在
    const group = await groupModel.findById(groupId);
    if (!group) {
      throw new AppError('分组不存在', 404);
    }

    // 权限检查（不能移除组长）
    if (studentId === group.leader_id) {
      throw new AppError('不能移除组长', 400);
    }

    if (userRole === 'student' && group.leader_id !== userId) {
      throw new AppError('无权移除成员', 403);
    }

    await groupModel.removeMember(groupId, studentId);
    
    return { success: true };
  }

  // 获取我的分组
  async getMyGroups(studentId: number) {
    const groups = await groupModel.findMyGroups(studentId);
    return groups;
  }
}

export const groupService = new GroupService();
