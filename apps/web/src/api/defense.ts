import { supabase } from '../lib/supabase'
import { fromSupabase } from '../utils/request'

// API 响应类型
interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

// 答辩
interface Defense {
  id: number
  projectId: number
  projectName?: string
  studentId?: number
  studentName?: string
  scheduledAt: string
  duration: number
  classroom: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  committeeMembers?: Array<{
    id: number
    name: string
    role: string
  }>
  scores?: Array<{
    memberId: number
    score: number
  }>
  createdAt?: string
  updatedAt?: string
}

// 答辩日程
interface DefenseSchedule {
  id: number
  date: string
  startTime: string
  endTime: string
  classroom: string
  defenses: Defense[]
}

// 答辩记录
interface DefenseRecord {
  id: number
  defenseId: number
  presentationMinutes: number
  answerMinutes: number
  keyPoints: string[]
  issues: string[]
  suggestions: string[]
  createdAt?: string
}

// 获取答辩安排列表
export const getDefenseList = async (params?: {
  projectId?: number
  status?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse<{ list: Defense[]; total: number }>> => {
  let query = supabase
    .from('defenses')
    .select('*, projects(name)', { count: 'exact' })

  if (params?.projectId) {
    query = query.eq('project_id', params.projectId)
  }
  if (params?.status) {
    query = query.eq('status', params.status)
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query.range(from, to).order('scheduled_at', { ascending: true })

  const result = await query
  const response = fromSupabase(result)

  if (response.code === 200) {
    const list = (result.data as any[])?.map((item: any) => ({
      ...item,
      projectName: item.projects?.name,
      projects: undefined,
    })) || []

    response.data = {
      list,
      total: result.count || 0,
    }
  }

  return response
}

// 获取答辩详情
export const getDefenseDetail = async (id: number): Promise<ApiResponse<Defense>> => {
  const result = await supabase
    .from('defenses')
    .select('*, projects(name)')
    .eq('id', id)
    .single()

  const response = fromSupabase(result)

  if (response.code === 200 && response.data) {
    const item = response.data as any
    response.data = {
      ...item,
      projectName: item.projects?.name,
      projects: undefined,
    } as Defense
  }

  return response
}

// 获取我的答辩（学生）
export const getMyDefense = async (): Promise<ApiResponse<Defense>> => {
  const { data: { user } } = await supabase.auth.getUser()

  const result = await supabase
    .from('defenses')
    .select('*, projects(name)')
    .eq('student_id', user?.id)
    .single()

  const response = fromSupabase(result)

  if (response.code === 200 && response.data) {
    const item = response.data as any
    response.data = {
      ...item,
      projectName: item.projects?.name,
      projects: undefined,
    } as Defense
  }

  return response
}

// 获取答辩日程（教师/评委）
export const getDefenseSchedule = async (params?: {
  date?: string
  classroom?: string
}): Promise<ApiResponse<DefenseSchedule[]>> => {
  let query = supabase
    .from('defenses')
    .select('*, projects(name)')

  if (params?.date) {
    query = query.gte('scheduled_at', params.date)
      .lt('scheduled_at', `${params.date}T23:59:59`)
  }
  if (params?.classroom) {
    query = query.eq('classroom', params.classroom)
  }

  query = query.order('scheduled_at', { ascending: true })

  const result = await query
  const response = fromSupabase(result)

  if (response.code === 200) {
    const defenses = (response.data as any[])?.map((item: any) => ({
      ...item,
      projectName: item.projects?.name,
      projects: undefined,
    })) || []

    // 按日期和教室分组
    const scheduleMap = new Map<string, DefenseSchedule>()
    defenses.forEach((d: any) => {
      const date = d.scheduled_at?.split('T')[0] || ''
      const key = `${date}_${d.classroom}`
      if (!scheduleMap.has(key)) {
        scheduleMap.set(key, {
          id: 0,
          date,
          startTime: d.scheduled_at,
          endTime: '',
          classroom: d.classroom,
          defenses: [],
        })
      }
      scheduleMap.get(key)!.defenses.push(d)
    })

    response.data = Array.from(scheduleMap.values())
  }

  return response
}

// 创建答辩安排（管理员）
export const createDefense = async (data: {
  projectId: number
  scheduledAt: string
  duration: number
  classroom: string
  committeeMembers: number[]
}): Promise<ApiResponse<Defense>> => {
  const result = await supabase
    .from('defenses')
    .insert({
      project_id: data.projectId,
      scheduled_at: data.scheduledAt,
      duration: data.duration,
      classroom: data.classroom,
      committee_members: data.committeeMembers,
      status: 'pending',
    })
    .select()
    .single()

  return fromSupabase(result)
}

// 更新答辩安排
export const updateDefense = async (
  id: number,
  data: Partial<Defense>
): Promise<ApiResponse<Defense>> => {
  const updateData: any = {}
  if (data.scheduledAt !== undefined) updateData.scheduled_at = data.scheduledAt
  if (data.duration !== undefined) updateData.duration = data.duration
  if (data.classroom !== undefined) updateData.classroom = data.classroom
  if (data.status !== undefined) updateData.status = data.status
  if (data.committeeMembers !== undefined) updateData.committee_members = data.committeeMembers

  const result = await supabase
    .from('defenses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  return fromSupabase(result)
}

// 取消答辩
export const cancelDefense = async (id: number, reason?: string): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('defenses')
    .update({
      status: 'cancelled',
      cancel_reason: reason,
    })
    .eq('id', id)

  return fromSupabase(result)
}

// 开始答辩
export const startDefense = async (id: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('defenses')
    .update({ status: 'in_progress' })
    .eq('id', id)

  return fromSupabase(result)
}

// 结束答辩
export const endDefense = async (id: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('defenses')
    .update({ status: 'completed' })
    .eq('id', id)

  return fromSupabase(result)
}

// 获取答辩记录
export const getDefenseRecord = async (id: number): Promise<ApiResponse<DefenseRecord>> => {
  const result = await supabase
    .from('defense_records')
    .select('*')
    .eq('defense_id', id)
    .single()

  return fromSupabase(result)
}

// 提交答辩记录
export const submitDefenseRecord = async (
  id: number,
  data: {
    presentationMinutes: number
    answerMinutes: number
    keyPoints: string[]
    issues: string[]
    suggestions: string[]
  }
): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('defense_records')
    .insert({
      defense_id: id,
      presentation_minutes: data.presentationMinutes,
      answer_minutes: data.answerMinutes,
      key_points: data.keyPoints,
      issues: data.issues,
      suggestions: data.suggestions,
    })

  return fromSupabase(result)
}

// 获取答辩统计
export const getDefenseStatistics = async (): Promise<ApiResponse<{
  total: number
  completed: number
  pending: number
  inProgress: number
  averageScore: number
}>> => {
  const { count: total } = await supabase
    .from('defenses')
    .select('*', { count: 'exact', head: true })

  const { count: completed } = await supabase
    .from('defenses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

  const { count: pending } = await supabase
    .from('defenses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: inProgress } = await supabase
    .from('defenses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'in_progress')

  return {
    code: 200,
    message: 'success',
    data: {
      total: total || 0,
      completed: completed || 0,
      pending: pending || 0,
      inProgress: inProgress || 0,
      averageScore: 0,
    },
  }
}

// 获取评委待评分列表
export const getPendingDefenseScores = async (): Promise<ApiResponse<Defense[]>> => {
  const { data: { user } } = await supabase.auth.getUser()

  const result = await supabase
    .from('defenses')
    .select('*, projects(name)')
    .eq('status', 'completed')
    .contains('committee_members', [user?.id])

  const response = fromSupabase(result)

  if (response.code === 200) {
    response.data = (response.data as any[])?.map((item: any) => ({
      ...item,
      projectName: item.projects?.name,
      projects: undefined,
    })) || []
  }

  return response
}

// 提交答辩评分
export const submitDefenseScore = async (data: {
  defenseId: number
  projectId: number
  dimensionScores: Array<{ dimensionId: number; score: number; comment: string }>
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

  return fromSupabase(result)
}
