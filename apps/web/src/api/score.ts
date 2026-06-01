import { supabase } from '../lib/supabase'
import { fromSupabase } from '../utils/supabase-helpers'

// API 响应类型
interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

// 评分
interface Score {
  id: number
  projectId: number
  type: 'guide' | 'review' | 'defense'
  teacherId: number
  teacherName?: string
  dimensionScores: Array<{
    dimensionId: number
    dimensionName?: string
    score: number
    comment?: string
  }>
  totalScore: number
  comment?: string
  createdAt: string
  updatedAt?: string
}

// 评分配置
interface ScoreConfig {
  id: number
  name: string
  type: 'guide' | 'review' | 'defense'
  dimensions: Array<{
    id: number
    name: string
    weight: number
    maxScore: number
  }>
  isDefault: boolean
  createdAt?: string
}

// 答辩评分
interface DefenseScore {
  id: number
  defenseId: number
  projectId: number
  committeeMemberId: number
  memberName?: string
  dimensionScores: Array<{
    dimensionId: number
    score: number
    comment?: string
  }>
  totalScore: number
  presentationScore: number
  answerScore: number
  overallComment?: string
  createdAt: string
}

// 获取评分配置
export const getScoreConfig = async (): Promise<ApiResponse<ScoreConfig[]>> => {
  const result = await supabase
    .from('score_configs')
    .select('*')

  return fromSupabase(result) as any
}

// 获取项目评分
export const getProjectScores = async (projectId: number): Promise<ApiResponse<{
  guideScores: Score[]
  reviewScores: Score[]
  defenseScores: DefenseScore[]
  totalScore: number
}>> => {
  const guideResult = await supabase
    .from('scores')
    .select('*, score_dimensions(name)')
    .eq('project_id', projectId)
    .eq('type', 'guide')

  const reviewResult = await supabase
    .from('scores')
    .select('*, score_dimensions(name)')
    .eq('project_id', projectId)
    .eq('type', 'review')

  const defenseResult = await supabase
    .from('defense_scores')
    .select('*')
    .eq('project_id', projectId)

  const guideScores = (guideResult.data || []).map((item: any) => ({
    ...item,
    dimensionScores: item.dimension_scores || [],
    score_dimensions: undefined,
  }))

  const reviewScores = (reviewResult.data || []).map((item: any) => ({
    ...item,
    dimensionScores: item.dimension_scores || [],
    score_dimensions: undefined,
  }))

  const defenseScores = defenseResult.data || []

  const allScores = [...guideScores, ...reviewScores, ...defenseScores]
  const totalScore = allScores.length > 0
    ? allScores.reduce((sum: number, s: any) => sum + (s.total_score || 0), 0) / allScores.length
    : 0

  return {
    code: 200,
    message: 'success',
    data: {
      guideScores,
      reviewScores,
      defenseScores,
      totalScore,
    },
  }
}

// 获取我的评分任务（教师）
export const getMyScoreTasks = async (params?: {
  type?: 'guide' | 'review' | 'defense'
  status?: string
}): Promise<ApiResponse<Array<{
  id: number
  projectId: number
  projectName: string
  studentName: string
  type: string
  deadline: string
  status: string
}>>> => {
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('scores')
    .select('*, projects(name)')
    .eq('teacher_id', user?.id)

  if (params?.type) {
    query = query.eq('type', params.type)
  }

  const result = await query

  const response: any = fromSupabase(result)

  if (response.code === 200) {
    response.data = (response.data as any[])?.map((item: any) => ({
      id: item.id,
      projectId: item.project_id,
      projectName: item.projects?.name || '',
      type: item.type,
      deadline: item.deadline || '',
      status: item.status || 'pending',
    })) || []
  }

  return response
}

// 提交指导教师评分
export const submitGuideScore = async (data: {
  projectId: number
  dimensionScores: Array<{
    dimensionId: number
    score: number
    comment?: string
  }>
  totalScore: number
  comment?: string
}): Promise<ApiResponse<void>> => {
  const { data: { user } } = await supabase.auth.getUser()

  const result = await supabase
    .from('scores')
    .insert({
      project_id: data.projectId,
      type: 'guide',
      teacher_id: user?.id,
      dimension_scores: data.dimensionScores,
      total_score: data.totalScore,
      comment: data.comment,
    })

  return fromSupabase(result) as any
}

// 提交评阅教师评分
export const submitReviewScore = async (data: {
  projectId: number
  dimensionScores: Array<{
    dimensionId: number
    score: number
    comment?: string
  }>
  totalScore: number
  comment?: string
}): Promise<ApiResponse<void>> => {
  const { data: { user } } = await supabase.auth.getUser()

  const result = await supabase
    .from('scores')
    .insert({
      project_id: data.projectId,
      type: 'review',
      teacher_id: user?.id,
      dimension_scores: data.dimensionScores,
      total_score: data.totalScore,
      comment: data.comment,
    })

  return fromSupabase(result) as any
}

// 获取答辩评分
export const getDefenseScores = async (defenseId: number): Promise<ApiResponse<DefenseScore[]>> => {
  const result = await supabase
    .from('defense_scores')
    .select('*')
    .eq('defense_id', defenseId)

  return fromSupabase(result) as any
}

// 提交答辩评分
export const submitDefenseScore = async (data: {
  defenseId: number
  projectId: number
  dimensionScores: Array<{
    dimensionId: number
    score: number
    comment?: string
  }>
  totalScore: number
  presentationScore: number
  answerScore: number
  overallComment: string
}): Promise<ApiResponse<void>> => {
  const { data: { user } } = await supabase.auth.getUser()

  const result = await supabase
    .from('defense_scores')
    .insert({
      defense_id: data.defenseId,
      project_id: data.projectId,
      committee_member_id: user?.id,
      dimension_scores: data.dimensionScores,
      total_score: data.totalScore,
      presentation_score: data.presentationScore,
      answer_score: data.answerScore,
      overall_comment: data.overallComment,
    })

  return fromSupabase(result) as any
}

// 更新评分（截止日期前）
export const updateScore = async (
  scoreId: number,
  data: Partial<Score>
): Promise<ApiResponse<void>> => {
  const updateData: any = {}
  if (data.totalScore !== undefined) updateData.total_score = data.totalScore
  if (data.comment !== undefined) updateData.comment = data.comment
  if (data.dimensionScores !== undefined) updateData.dimension_scores = data.dimensionScores

  const result = await supabase
    .from('scores')
    .update(updateData)
    .eq('id', scoreId)

  return fromSupabase(result) as any
}

// 获取学生成绩单
export const getTranscript = async (studentId?: string): Promise<ApiResponse<{
  projectName: string
  guideScore: number
  reviewScore: number
  defenseScore: number
  totalScore: number
  rank: number
  statistics: {
    avgScore: number
    maxScore: number
    minScore: number
  }
}>> => {
  const userId = studentId || (await supabase.auth.getUser()).data.user?.id

  const result = await supabase
    .from('scores')
    .select('*, projects(name)')
    .eq('teacher_id', userId)

  const response: any = fromSupabase(result)

  if (response.code === 200) {
    const scores = response.data as any[]
    const guideScore = scores.filter((s: any) => s.type === 'guide').reduce((sum: number, s: any) => sum + (s.total_score || 0), 0)
    const reviewScore = scores.filter((s: any) => s.type === 'review').reduce((sum: number, s: any) => sum + (s.total_score || 0), 0)

    response.data = {
      projectName: scores[0]?.projects?.name || '',
      guideScore,
      reviewScore,
      defenseScore: 0,
      totalScore: guideScore + reviewScore,
      rank: 0,
      statistics: {
        avgScore: 0,
        maxScore: 0,
        minScore: 0,
      },
    }
  }

  return response
}
