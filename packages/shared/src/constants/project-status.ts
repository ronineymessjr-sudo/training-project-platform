// ==================== Project Status Types ====================

export enum GroupStatus {
  NOT_FORMED = 0,     // 未组队
  FORMED = 1,         // 已组队（待审核）
  PENDING_REVIEW = 2, // 待审核
  IN_PROGRESS = 3,    // 开发中
  SUBMITTED = 4,      // 已提交
  DEFENDED = 5,      // 已答辩
  SCORED = 6         // 已评分
}

export enum ProjectStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  ARCHIVED = 3
}

export enum TopicStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  ARCHIVED = 2
}

export enum TopicDifficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3
}

// 状态流转校验函数
export function canTransitionGroupStatus(from: GroupStatus, to: GroupStatus): boolean {
  const transitions: Record<GroupStatus, GroupStatus[]> = {
    [GroupStatus.NOT_FORMED]: [GroupStatus.FORMED],
    [GroupStatus.FORMED]: [GroupStatus.PENDING_REVIEW],
    [GroupStatus.PENDING_REVIEW]: [GroupStatus.IN_PROGRESS, GroupStatus.FORMED],
    [GroupStatus.IN_PROGRESS]: [GroupStatus.SUBMITTED],
    [GroupStatus.SUBMITTED]: [GroupStatus.DEFENDED],
    [GroupStatus.DEFENDED]: [GroupStatus.SCORED],
    [GroupStatus.SCORED]: []
  };
  return transitions[from]?.includes(to) ?? false;
}

// 状态显示文本
export const GroupStatusText: Record<GroupStatus, string> = {
  [GroupStatus.NOT_FORMED]: '未组队',
  [GroupStatus.FORMED]: '已组队',
  [GroupStatus.PENDING_REVIEW]: '待审核',
  [GroupStatus.IN_PROGRESS]: '开发中',
  [GroupStatus.SUBMITTED]: '已提交',
  [GroupStatus.DEFENDED]: '已答辩',
  [GroupStatus.SCORED]: '已评分'
};

export const ProjectStatusText: Record<ProjectStatus, string> = {
  [ProjectStatus.NOT_STARTED]: '未开始',
  [ProjectStatus.IN_PROGRESS]: '进行中',
  [ProjectStatus.COMPLETED]: '已完成',
  [ProjectStatus.ARCHIVED]: '已归档'
};
