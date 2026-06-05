import { supabase } from '../lib/supabase'
import { fromSupabase } from '../utils/supabase-helpers'

// API 响应类型
interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

// 答辩（与数据库 defenses 表字段一致）
interface Defense {
  id: number
  projectId: number
  projectName?: string
  groupId: number
  title: string
  defenseDate: string        // YYYY-MM-DD
  startTime: string           // HH:mm
  endTime: string             // HH:mm
  location: string
  panelTeacherIds: string[]
  secretaryId?: string
  status: string              // 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  maxDuration: number
  createdAt?: string
  updatedAt?: string
}

// 状态映射：数据库 SMALLINT ↔ 前端字符串
const STATUS_MAP_DB_TO_STR: Record<number, string> = {
  0: 'scheduled',
  1: 'in_progress',
  2: 'completed',
  3: 'cancelled',
}
const STATUS_MAP_STR_TO_DB: Record<string, number> = {
  'scheduled': 0,
  'in_progress': 1,
  'completed': 2,
  'cancelled': 3,
}

function toDefense(item: any): Defense {
  return {
    id: item.id,
    projectId: item.project_id,
    projectName: item.projects?.name || '',
    groupId: item.group_id,
    title: item.title,
    defenseDate: item.defense_date,
    startTime: item.start_time?.slice(0, 5) || '',
    endTime: item.end_time?.slice(0, 5) || '',
    location: item.location || '',
    panelTeacherIds: item.panel_teacher_ids || [],
    secretaryId: item.secretary_id,
    status: STATUS_MAP_DB_TO_STR[item.status] || 'scheduled',
    maxDuration: item.max_duration || 30,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
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
    query = query.eq('status', STATUS_MAP_STR_TO_DB[params.status] ?? params.status)
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query.range(from, to).order('defense_date', { ascending: true }).order('start_time', { ascending: true })

  const result = await query
  const response: any = fromSupabase(result)

  if (response.code === 200) {
    const list = (result.data || []).map(toDefense)
    response.data = { list, total: result.count || 0 }
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

  const response: any = fromSupabase(result)
  if (response.code === 200 && response.data) {
    response.data = toDefense(response.data)
  }

  return response
}

// 获取我的答辩（学生）— 通过 group_members 查出 group_id 再查 defense
export const getMyDefense = async (): Promise<ApiResponse<Defense | null>> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) return { code: 401, message: '未登录', data: null }

  // 1. 查学生所在的组
  const { data: members } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('student_id', user.id)
    .limit(1)

  const groupId = members && members.length > 0 ? (members[0] as any).group_id : null
  if (!groupId) return { code: 404, message: '未找到所在小组', data: null }

  // 2. 查该组的答辩
  const result = await supabase
    .from('defenses')
    .select('*, projects(name)')
    .eq('group_id', groupId)
    .single()

  const response: any = fromSupabase(result)
  if (response.code === 200 && response.data) {
    response.data = toDefense(response.data)
  }

  return response
}

// 获取答辩日程（按日期和地点分组）
export const getDefenseSchedule = async (params?: {
  date?: string
  location?: string
}): Promise<ApiResponse<any[]>> => {
  let query = supabase
    .from('defenses')
    .select('*, projects(name)')

  if (params?.date) {
    query = query.eq('defense_date', params.date)
  }
  if (params?.location) {
    query = query.eq('location', params.location)
  }

  query = query.order('defense_date', { ascending: true }).order('start_time', { ascending: true })

  const result = await query
  const response: any = fromSupabase(result)

  if (response.code === 200) {
    const defenses = (result.data || []).map(toDefense)
    // 按日期和地点分组
    const scheduleMap = new Map<string, any>()
    defenses.forEach((d: Defense) => {
      const key = `${d.defenseDate}_${d.location}`
      if (!scheduleMap.has(key)) {
        scheduleMap.set(key, {
          date: d.defenseDate,
          location: d.location,
          defenses: [],
        })
      }
      scheduleMap.get(key)!.defenses.push(d)
    })
    response.data = Array.from(scheduleMap.values())
  }

  return response
}

// 创建答辩安排（管理员/教师）
export const createDefense = async (data: {
  projectId: number
  groupId: number
  title: string
  defenseDate: string   // YYYY-MM-DD
  startTime: string     // HH:mm
  endTime: string       // HH:mm
  location: string
  panelTeacherIds: string[]
  secretaryId?: string
  maxDuration: number
}): Promise<ApiResponse<Defense>> => {
  const result = await supabase
    .from('defenses')
    .insert({
      project_id: data.projectId,
      group_id: data.groupId,
      title: data.title,
      defense_date: data.defenseDate,
      start_time: data.startTime,
      end_time: data.endTime,
      location: data.location,
      panel_teacher_ids: data.panelTeacherIds,
      secretary_id: data.secretaryId || null,
      status: 0,
      max_duration: data.maxDuration,
    })
    .select()
    .single()

  const response: any = fromSupabase(result)
  if (response.code === 200 && response.data) {
    response.data = toDefense(response.data)
  }

  return response
}

// 更新答辩安排
export const updateDefense = async (
  id: number,
  data: Partial<{
    title: string
    defenseDate: string
    startTime: string
    endTime: string
    location: string
    panelTeacherIds: string[]
    maxDuration: number
    status: string
  }>
): Promise<ApiResponse<Defense>> => {
  const dbData: any = {}
  if (data.title !== undefined) dbData.title = data.title
  if (data.defenseDate !== undefined) dbData.defense_date = data.defenseDate
  if (data.startTime !== undefined) dbData.start_time = data.startTime
  if (data.endTime !== undefined) dbData.end_time = data.endTime
  if (data.location !== undefined) dbData.location = data.location
  if (data.panelTeacherIds !== undefined) dbData.panel_teacher_ids = data.panelTeacherIds
  if (data.maxDuration !== undefined) dbData.max_duration = data.maxDuration
  if (data.status !== undefined) dbData.status = STATUS_MAP_STR_TO_DB[data.status] ?? data.status

  const result = await supabase
    .from('defenses')
    .update({ ...dbData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  const response: any = fromSupabase(result)
  if (response.code === 200 && response.data) {
    response.data = toDefense(response.data)
  }

  return response
}

// 取消答辩
export const cancelDefense = async (id: number, reason?: string): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('defenses')
    .update({ status: 3, updated_at: new Date().toISOString() })
    .eq('id', id)

  return fromSupabase(result) as any
}

// 开始答辩
export const startDefense = async (id: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('defenses')
    .update({ status: 1, updated_at: new Date().toISOString() })
    .eq('id', id)

  return fromSupabase(result) as any
}

// 结束答辩
export const endDefense = async (id: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('defenses')
    .update({ status: 2, updated_at: new Date().toISOString() })
    .eq('id', id)

  return fromSupabase(result) as any
}

// 获取答辩评分列表
export const getDefenseScores = async (defenseId: number): Promise<ApiResponse<any[]>> => {
  const result = await supabase
    .from('defense_scores')
    .select('*, profiles:scorer_id(real_name)')
    .eq('defense_id', defenseId)

  const response: any = fromSupabase(result)
  if (response.code === 200) {
    response.data = (response.data || []).map((item: any) => ({
      id: item.id,
      defenseId: item.defense_id,
      groupId: item.group_id,
      scorerId: item.scorer_id,
      scorerName: item.profiles?.real_name || '',
      scorerRole: item.scorer_role,
      presentationScore: item.presentation_score,
      qaScore: item.qa_score,
      documentScore: item.document_score,
      totalScore: item.total_score,
      comment: item.comment,
      createdAt: item.created_at,
    }))
  }

  return response
}

// 提交答辩评分（教师/评委）
export const submitDefenseScore = async (data: {
  defenseId: number
  groupId: number
  presentationScore: number
  qaScore: number
  documentScore: number
  totalScore: number
  comment?: string
  scorerRole?: number  // 1=指导教师, 2=评阅教师, 3=答辩委员
}): Promise<ApiResponse<void>> => {
  const { data: { user } } = await supabase.auth.getUser()

  const result = await supabase
    .from('defense_scores')
    .insert({
      defense_id: data.defenseId,
      group_id: data.groupId,
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

// 获取答辩统计
export const getDefenseStatistics = async (): Promise<ApiResponse<{
  total: number
  completed: number
  scheduled: number
  inProgress: number
}>> => {
  const { count: total } = await supabase.from('defenses').select('*', { count: 'exact', head: true })
  const { count: completed } = await supabase.from('defenses').select('*', { count: 'exact', head: true }).eq('status', 2)
  const { count: scheduled } = await supabase.from('defenses').select('*', { count: 'exact', head: true }).eq('status', 0)
  const { count: inProgress } = await supabase.from('defenses').select('*', { count: 'exact', head: true }).eq('status', 1)

  return {
    code: 200,
    message: 'success',
    data: {
      total: total || 0,
      completed: completed || 0,
      scheduled: scheduled || 0,
      inProgress: inProgress || 0,
    },
  }
}
