// ==================== Score Types ====================

export interface ScoreDimension {
  id: number;
  name: string;
  description?: string;
  defaultWeight: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Score {
  id: number;
  projectId: number;
  groupId: number;
  dimensionId: number;
  score: number;
  comment?: string;
  scorerId: number;
  scoredAt: string;
}

export interface ScoreSummary {
  id: number;
  projectId: number;
  groupId: number;
  totalScore: number;
  weightedScore?: number;
  rank?: number;
  evaluatorId?: number;
  evaluatedAt?: string;
  scores?: Score[];
}

export interface ScoreConfig {
  dimensionId: number;
  weight: number;
  maxScore: number;
}

export interface ScoreCreateDto {
  projectId: number;
  groupId: number;
  dimensionId: number;
  score: number;
  comment?: string;
}

export interface ScoreConfigUpdateDto {
  dimensions: ScoreConfig[];
}

// 答辩评分
export interface DefenseScore {
  id: number;
  defenseId: number;
  groupId: number;
  scorerId: number;
  scorerRole: DefenseScorerRole;
  presentationScore?: number;
  qaScore?: number;
  documentScore?: number;
  totalScore: number;
  comment?: string;
  createdAt: string;
}

export enum DefenseScorerRole {
  SUPERVISOR = 1,  // 指导教师
  REVIEWER = 2,    // 评阅教师
  PANEL = 3        // 答辩评委
}

export interface DefenseScoreCreateDto {
  defenseId: number;
  groupId: number;
  presentationScore?: number;
  qaScore?: number;
  documentScore?: number;
  totalScore: number;
  comment?: string;
}
