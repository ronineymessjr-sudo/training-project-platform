import { supabase } from '../lib/supabase'
import { fromSupabase } from '../utils/supabase-helpers'

interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

// ========================================
// 评分配置
// ========================================

// 获取评分维度列表（从 score_dimensions 表）
export const getScoreConfig = async (): Promise<ApiResponse<Array<{
  id: number
  name: string
  maxScore: number
  weight: number
}>>> => {
  const result = await supabase
    .from('score_dimensions')
    .select('*')
    .order('id')

  const response: any = fromSupabase(result)
  if (response.code === 200) {
    response.data = (response.data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      maxScore: 100,
      weight: d.default_weight || 0,
    }))
  }
  return response
}

// ========================================
// 待评分任务（教师视角：查教师负责的项目+组）
// ========================================
export const getMyScoreTasks = async (params?: {
  type?: string
  status?: string
}): Promise<ApiResponse<Array<{
  id: number
  projectId: number
  projectName: string
  groupId: number
  groupName: string
  studentName: string
  type: string
  status: string
}>>> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) return { code: 401, message: '未登录', data: [] as any }

  // 查教师负责的项目
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, teacher_id')
    .eq('teacher_id', user.id)

  if (!projects || projects.length === 0) {
    return { code: 200, message: 'success', data: [] }
  }

  const projectIds = projects.map((p: any) => p.id)

  // 查这些项目的所有小组
  const { data: groups } = await supabase
    .from('groups')
    .select('id, name, project_id')
    .in('project_id', projectIds)
    .eq('status', 1)

  if (!groups || groups.length === 0) {
    return { code: 200, message: 'success', data: [] }
  }

  // 查已有评分（用于判断哪些组已经评过分）
  const { data: existingScores } = await supabase
    .from('scores')
    .select('project_id, group_id, scorer_id')
    .eq('scorer_id', user.id)
    .in('project_id', projectIds)

  const scoredKeys = new Set(
    (existingScores || []).map((s: any) => `${s.project_id}-${s.group_id}`)
  )

  // 查小组组长/成员姓名
  const groupIds = groups.map((g: any) => g.id)
  const { data: leaders } = await supabase
    .from('group_members')
    .select('group_id, profiles:student_id(real_name)')
    .in('group_id', groupIds)
    .eq('role', 1) // leader

  const leaderMap: Record<number, string> = {}
  if (leaders) {
    for (const l of leaders) {
      leaderMap[(l as any).group_id] = (l as any).profiles?.real_name || ''
    }
  }

  const projectMap = Object.fromEntries(projects.map((p: any) => [p.id, p.name]))

  // 组装任务列表 - 每个组产生两个任务（指导评分 + 评阅评分）
  const tasks: any[] = []
  for (const g of groups) {
    const key = `${g.project_id}-${g.id}`
    const leaderName = leaderMap[g.id] || '待分配'
    const projectName = projectMap[g.project_id] || ''

    // 指导评分
    if (!scoredKeys.has(key)) {
      tasks.push({
        id: g.id,
        projectId: g.project_id,
        projectName,
        groupId: g.id,
        groupName: g.name,
        studentName: leaderName,
        type: 'guide',
        status: 'pending',
      })
    }

    // 评阅评分（可分别处理，简化处理也显示待评分）
    tasks.push({
      id: -g.id, // 用负id区分
      projectId: g.project_id,
      projectName,
      groupId: g.id,
      groupName: g.name,
      studentName: leaderName,
      type: 'review',
      status: scoredKeys.has(key) ? 'submitted' : 'pending',
    })
  }

  return { code: 200, message: 'success', data: tasks }
}

// ========================================
// 读取项目评分（按组聚合）
// ========================================
export const getProjectScores = async (projectId: number): Promise<ApiResponse<{
  guideScores: any[]
  reviewScores: any[]
  defenseScores: any[]
  totalScore: number
}>> => {
  // 读取 scores 表（按组+评分人聚合，每个维度一行）
  const { data: allScores, error } = await supabase
    .from('scores')
    .select('*, score_dimensions(name), profiles:scorer_id(real_name)')
    .eq('project_id', projectId)

  if (error) {
    return {
      code: 500,
      message: error.message,
      data: { guideScores: [], reviewScores: [], defenseScores: [], totalScore: 0 },
    }
  }

  // 按 group_id 和 scorer_id 分组
  const groupMap = new Map<string, any[]>()
  for (const row of allScores || []) {
    const key = `${row.group_id}-${row.scorer_id}`
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key)!.push(row)
  }

  // 每个分组聚合成一个 Score 对象
  const guideScores: any[] = []
  const reviewScores: any[] = []

  for (const [, rows] of groupMap) {
    const first = rows[0]
    const entry: any = {
      id: first.id,
      projectId: first.project_id,
      groupId: first.group_id,
      scorerId: first.scorer_id,
      scorerName: first.profiles?.real_name || '',
      dimensionScores: rows.map((r: any) => ({
        dimensionId: r.dimension_id,
        dimensionName: r.score_dimensions?.name || '',
        score: r.score,
        comment: r.comment,
      })),
      totalScore: rows.reduce((sum: number, r: any) => sum + (r.score || 0), 0),
      comment: rows[0]?.comment || '',
      createdAt: rows[0]?.scored_at || rows[0]?.created_at,
    }
    if (entry.totalScore > 0) {
      guideScores.push(entry)
    }
  }

  // defense_scores
  const { data: defScores } = await supabase
    .from('defense_scores')
    .select('*, profiles:scorer_id(real_name)')
    .eq('project_id', projectId)

  const defenseScores = (defScores || []).map((item: any) => ({
    id: item.id,
    defenseId: item.defense_id,
    groupId: item.group_id,
    projectId: item.project_id,
    scorerId: item.scorer_id,
    scorerName: item.profiles?.real_name || '',
    totalScore: item.total_score,
    presentationScore: item.presentation_score,
    qaScore: item.qa_score,
    documentScore: item.document_score,
    comment: item.comment,
    createdAt: item.created_at,
  }))

  const allScoresList = [...guideScores, ...reviewScores, ...defenseScores]
  const totalScore = allScoresList.length > 0
    ? allScoresList.reduce((sum: number, s: any) => sum + (s.totalScore || 0), 0) / allScoresList.length
    : 0

  return {
    code: 200,
    message: 'success',
    data: { guideScores, reviewScores, defenseScores, totalScore },
  }
}

// ========================================
// 提交评分（每维度一行）
// ========================================
async function submitDimensionScores(
  projectId: number,
  groupId: number,
  scorerId: string | undefined,
  dimensionScores: Array<{ dimensionId: number; score: number; comment?: string }>
): Promise<ApiResponse<void>> {
  if (!scorerId) return { code: 401, message: '未登录', data: undefined }

  const rows = dimensionScores.map((ds) => ({
    project_id: projectId,
    group_id: groupId,
    dimension_id: ds.dimensionId,
    score: ds.score,
    comment: ds.comment || null,
    scorer_id: scorerId,
  }))

  // 逐行upsert
  for (const row of rows) {
    const { error } = await supabase.from('scores').upsert(row, {
      onConflict: 'project_id,group_id,dimension_id,scorer_id',
    })
    if (error) return { code: 500, message: error.message, data: undefined }
  }

  return { code: 200, message: '评分成功', data: undefined }
}

export const submitGuideScore = async (data: {
  projectId: number
  groupId: number
  dimensionScores: Array<{ dimensionId: number; score: number; comment?: string }>
  totalScore: number
  comment?: string
}): Promise<ApiResponse<void>> => {
  const { data: { user } } = await supabase.auth.getUser()
  return submitDimensionScores(data.projectId, data.groupId, user?.id, data.dimensionScores)
}

export const submitReviewScore = async (data: {
  projectId: number
  groupId: number
  dimensionScores: Array<{ dimensionId: number; score: number; comment?: string }>
  totalScore: number
  comment?: string
}): Promise<ApiResponse<void>> => {
  const { data: { user } } = await supabase.auth.getUser()
  return submitDimensionScores(data.projectId, data.groupId, user?.id, data.dimensionScores)
}

export const submitDefenseScore = async (data: {
  defenseId: number
  groupId: number
  projectId: number
  presentationScore: number
  qaScore: number
  documentScore: number
  totalScore: number
  comment?: string
  scorerRole?: number
}): Promise<ApiResponse<void>> => {
  const { data: { user } } = await supabase.auth.getUser()

  const result = await supabase
    .from('defense_scores')
    .insert({
      defense_id: data.defenseId,
      group_id: data.groupId,
      project_id: data.projectId,
      scorer_id: user?.id,
      scorer_role: data.scorerRole || 3,
      presentation_score: data.presentationScore,
      qa_score: data.qaScore,
      document_score: data.documentScore,
      total_score: data.totalScore,
      comment: data.comment || null,
    })

  return fromSupabase(result) as any
}

// ========================================
// 更新评分
// ========================================
export const updateScore = async (
  scoreId: number,
  data: { totalScore?: number; comment?: string }
): Promise<ApiResponse<void>> => {
  const updateData: any = {}
  if (data.totalScore !== undefined) updateData.total_score = data.totalScore
  if (data.comment !== undefined) updateData.comment = data.comment

  const result = await supabase
    .from('scores')
    .update({ ...updateData, scored_at: new Date().toISOString() })
    .eq('id', scoreId)

  return fromSupabase(result) as any
}

// ========================================
// 获取学生成绩单
// ========================================
export const getTranscript = async (studentId?: string): Promise<ApiResponse<{
  projectName: string
  guideScore: number
  reviewScore: number
  defenseScore: number
  totalScore: number
  rank: number
  statistics: { avgScore: number; maxScore: number; minScore: number }
}>> => {
  const { data: { user } } = await supabase.auth.getUser()
  const userId = studentId || user?.id
  if (!userId) return { code: 401, message: '未登录', data: null as any }

  // 查学生所在的组，再查项目的分
  const { data: members } = await supabase
    .from('group_members')
    .select('groups!inner(project_id, projects!inner(name))')
    .eq('student_id', userId)
    .limit(1)

  let projectName = ''
  let projectId = 0
  if (members && members.length > 0) {
    const m = members[0] as any
    projectId = m.groups?.project_id || 0
    projectName = m.groups?.projects?.name || ''
  }

  if (!projectId) {
    return { code: 200, message: 'success', data: { projectName: '', guideScore: 0, reviewScore: 0, defenseScore: 0, totalScore: 0, rank: 0, statistics: { avgScore: 0, maxScore: 0, minScore: 0 } } }
  }

  const { data: scoreRows } = await supabase
    .from('scores')
    .select('score')
    .eq('project_id', projectId)

  const guideScore = (scoreRows || []).reduce((sum: number, r: any) => sum + (r.score || 0), 0)

  return {
    code: 200,
    message: 'success',
    data: {
      projectName,
      guideScore,
      reviewScore: 0,
      defenseScore: 0,
      totalScore: guideScore,
      rank: 0,
      statistics: { avgScore: 0, maxScore: 0, minScore: 0 },
    },
  }
}
