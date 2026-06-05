import { supabase } from '../lib/supabase'
import { fromSupabase } from '../utils/supabase-helpers'

// API 响应类型
interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

// 工作量记录
interface WorkloadRecord {
  id: number
  projectId: number
  userId: number
  userName?: string
  date: string
  hours: number
  content: string
  evidence?: string[]
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: number
  reviewerName?: string
  reviewComment?: string
  createdAt: string
  updatedAt?: string
}

// 工作量汇总
interface WorkloadSummary {
  userId: number
  userName: string
  totalHours: number
  recordCount: number
  approvedHours: number
  pendingHours: number
}

// 获取个人工作量记录
export const getMyWorkload = async (params?: {
  projectId?: number
  month?: string
}): Promise<ApiResponse<WorkloadRecord[]>> => {
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('workloads')
    .select('*, projects(name)')
    .eq('student_id', user?.id)

  if (params?.projectId) {
    query = query.eq('project_id', params.projectId)
  }
  if (params?.month) {
    query = query.gte('report_date', `${params.month}-01`)
      .lt('report_date', `${params.month}-31`)
  }

  query = query.order('report_date', { ascending: false })

  const result = await query
  const response: any = fromSupabase(result)

  if (response.code === 200 && Array.isArray(response.data)) {
    response.data = response.data.map((d: any) => ({
      id: d.id,
      projectId: d.project_id,
      projectName: d.projects?.name || '',
      userId: d.student_id,
      userName: '',
      date: d.report_date,
      hours: d.actual_hours || 0,
      content: d.task_description || '',
      status: d.status === 0 ? 'pending' : d.status === 1 ? 'approved' : d.status === 2 ? 'approved' : 'pending',
      reviewerComment: '',
      createdAt: d.created_at,
    }))
  }

  return response
}

// 获取项目成员工作量（组长/教师）
export const getProjectWorkload = async (
  projectId: number
): Promise<ApiResponse<WorkloadSummary[]>> => {
  const result = await supabase
    .from('workloads')
    .select('*')
    .eq('project_id', projectId)

  const response: any = fromSupabase(result)

  if (response.code === 200) {
    const records = response.data as any[]
    // 获取学生姓名
    const studentIds = [...new Set(records.map((r: any) => r.student_id).filter(Boolean))]
    let nameMap: Record<string, string> = {}
    if (studentIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, real_name').in('id', studentIds)
      if (profiles) nameMap = Object.fromEntries(profiles.map((p: any) => [p.id, p.real_name || '']))
    }

    // 按用户汇总
    const summaryMap = new Map<string, WorkloadSummary>()
    records.forEach((r: any) => {
      const userId = r.student_id
      if (!summaryMap.has(userId)) {
        summaryMap.set(userId, {
          userId,
          userName: nameMap[userId] || '',
          totalHours: 0,
          recordCount: 0,
          approvedHours: 0,
          pendingHours: 0,
        })
      }
      const summary = summaryMap.get(userId)!
      summary.totalHours += r.hours || 0
      summary.recordCount += 1
      if (r.status === 'approved') {
        summary.approvedHours += r.hours || 0
      } else if (r.status === 'pending') {
        summary.pendingHours += r.hours || 0
      }
    })

    response.data = Array.from(summaryMap.values())
  }

  return response
}

// 提交工作量
export const submitWorkload = async (data: {
  projectId: number
  date: string
  hours: number
  content: string
  evidence?: string[]
}): Promise<ApiResponse<WorkloadRecord>> => {
  const { data: { user } } = await supabase.auth.getUser()

  const result = await supabase
    .from('workloads')
    .insert({
      project_id: data.projectId,
      student_id: user?.id,
      date: data.date,
      hours: data.hours,
      content: data.content,
      evidence: data.evidence || [],
      status: 'pending',
    })
    .select()
    .single()

  return fromSupabase(result) as any
}

// 更新工作量
export const updateWorkload = async (
  id: number,
  data: Partial<WorkloadRecord>
): Promise<ApiResponse<WorkloadRecord>> => {
  const updateData: any = {}
  if (data.date !== undefined) updateData.date = data.date
  if (data.hours !== undefined) updateData.hours = data.hours
  if (data.content !== undefined) updateData.content = data.content
  if (data.evidence !== undefined) updateData.evidence = data.evidence

  const result = await supabase
    .from('workloads')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  return fromSupabase(result) as any
}

// 删除工作量
export const deleteWorkload = async (id: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('workloads')
    .delete()
    .eq('id', id)

  return fromSupabase(result) as any
}

// 获取工作量统计
export const getWorkloadStatistics = async (
  projectId: number
): Promise<ApiResponse<{
  totalHours: number
  memberStats: Array<{
    userId: number
    name: string
    totalHours: number
    contribution: number
  }>
  dailyHours: Array<{ date: string; hours: number }>
}>> => {
  const result = await supabase
    .from('workloads')
    .select('*')
    .eq('project_id', projectId)

  const response: any = fromSupabase(result)

  if (response.code === 200) {
    const records = response.data as any[]
    const studentIds = [...new Set(records.map((r: any) => r.student_id).filter(Boolean))]
    let nameMap: Record<string, string> = {}
    if (studentIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, real_name').in('id', studentIds)
      if (profiles) nameMap = Object.fromEntries(profiles.map((p: any) => [p.id, p.real_name || '']))
    }
    const totalHours = records.reduce((sum: number, r: any) => sum + (r.hours || 0), 0)

    // 按用户统计
    const memberMap = new Map<string, { userId: number; name: string; totalHours: number }>()
    records.forEach((r: any) => {
      const userId = r.student_id
      if (!memberMap.has(userId)) {
        memberMap.set(userId, {
          userId,
          name: nameMap[userId] || '',
          totalHours: 0,
        })
      }
      memberMap.get(userId)!.totalHours += r.hours || 0
    })

    // 按日期统计
    const dailyMap = new Map<string, number>()
    records.forEach((r: any) => {
      const date = r.date?.split('T')[0] || ''
      dailyMap.set(date, (dailyMap.get(date) || 0) + (r.hours || 0))
    })

    response.data = {
      totalHours,
      memberStats: Array.from(memberMap.values()).map(m => ({
        ...m,
        contribution: totalHours > 0 ? m.totalHours / totalHours : 0,
      })),
      dailyHours: Array.from(dailyMap.entries()).map(([date, hours]) => ({ date, hours })),
    }
  }

  return response
}

// 导出工作量报表
export const exportWorkloadReport = async (projectId: number): Promise<ApiResponse<{ url: string }>> => {
  // Supabase 不支持直接导出，返回数据供前端处理
  const result = await supabase
    .from('workloads')
    .select('*')
    .eq('project_id', projectId)

  return fromSupabase(result) as any
}

// 审核工作量（教师）
export const reviewWorkload = async (
  id: number,
  data: { approved: boolean; comment?: string }
): Promise<ApiResponse<void>> => {
  const { data: { user } } = await supabase.auth.getUser()

  const result = await supabase
    .from('workloads')
    .update({
      status: data.approved ? 'approved' : 'rejected',
      reviewed_by: user?.id,
      review_comment: data.comment,
    })
    .eq('id', id)

  return fromSupabase(result) as any
}

// 获取待审核工作量（教师）
export const getPendingWorkloadReviews = async (): Promise<ApiResponse<WorkloadRecord[]>> => {
  const result = await supabase
    .from('workloads')
    .select('*, projects(name)')
    .eq('status', 0) // 0 = pending in DB

  const response: any = fromSupabase(result)

  if (response.code === 200 && Array.isArray(response.data)) {
    const raw = response.data
    // 获取学生姓名
    const studentIds = [...new Set(raw.map((item: any) => item.student_id).filter(Boolean))]
    let nameMap: Record<string, string> = {}
    if (studentIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, real_name').in('id', studentIds)
      if (profiles) nameMap = Object.fromEntries(profiles.map((p: any) => [p.id, p.real_name || '']))
    }
    response.data = raw.map((item: any) => ({
      id: item.id,
      projectId: item.project_id,
      projectName: item.projects?.name || '',
      userId: item.student_id,
      userName: nameMap[item.student_id] || '',
      date: item.report_date,
      hours: item.actual_hours || 0,
      content: item.task_description || '',
      status: 'pending',
      reviewerComment: item.review_comment || '',
      createdAt: item.created_at,
    }))
  }

  return response
}
