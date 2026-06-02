import { supabase } from '../lib/supabase'
import { fromSupabase } from '../utils/supabase-helpers'

// API 响应类型
interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

// 进度
interface Progress {
  id: number
  projectId: number
  phaseId: number
  phaseName?: string
  title: string
  content: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  attachments?: string[]
  reviewedBy?: number
  reviewerName?: string
  reviewComment?: string
  submittedAt?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

// 进度提交
interface ProgressSubmission {
  title: string
  content: string
  attachments?: string[]
}

// 获取进度列表
export const getProgressList = async (params?: {
  projectId?: number
  phaseId?: number
  status?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse<{ list: Progress[]; total: number }>> => {
  let query = supabase
    .from('progress')
    .select('*, profiles:reporter_id(real_name), project_phases(name)', { count: 'exact' })

  if (params?.projectId) {
    query = query.eq('project_id', params.projectId)
  }
  if (params?.phaseId) {
    query = query.eq('phase_id', params.phaseId)
  }
  if (params?.status) {
    query = query.eq('status', params.status)
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query.range(from, to).order('created_at', { ascending: false })

  const result = await query
  const response: any = fromSupabase(result)

  if (response.code === 200) {
    const list = (result.data as any[])?.map((item: any) => ({
      ...item,
      reviewerName: item.profiles?.real_name,
      phaseName: item.project_phases?.name,
      profiles: undefined,
      project_phases: undefined,
    })) || []

    response.data = {
      list,
      total: result.count || 0,
    }
  }

  return response
}

// 获取进度详情
export const getProgressDetail = async (id: number): Promise<ApiResponse<Progress>> => {
  const result = await supabase
    .from('progress')
    .select('*, profiles:reporter_id(real_name), project_phases(name)')
    .eq('id', id)
    .single()

  const response: any = fromSupabase(result)

  if (response.code === 200 && response.data) {
    const item = response.data as any
    response.data = {
      ...item,
      reviewerName: item.profiles?.real_name,
      phaseName: item.project_phases?.name,
      profiles: undefined,
      project_phases: undefined,
    } as Progress
  }

  return response
}

// 创建进度提交
export const createProgress = async (data: {
  projectId: number
  phaseId: number
  title: string
  content: string
  attachments?: string[]
}): Promise<ApiResponse<Progress>> => {
  const { data: { user } } = await supabase.auth.getUser()

  const result = await supabase
    .from('progress')
    .insert({
      project_id: data.projectId,
      phase_id: data.phaseId,
      title: data.title,
      content: data.content,
      attachments: data.attachments || [],
      reporter_id: user?.id,
      status: 'draft',
    })
    .select()
    .single()

  return fromSupabase(result) as any
}

// 更新进度
export const updateProgress = async (
  id: number,
  data: Partial<ProgressSubmission>
): Promise<ApiResponse<Progress>> => {
  const updateData: any = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.content !== undefined) updateData.content = data.content
  if (data.attachments !== undefined) updateData.attachments = data.attachments

  const result = await supabase
    .from('progress')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  return fromSupabase(result) as any
}

// 提交进度审核
export const submitProgress = async (id: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('progress')
    .update({ status: 'submitted', submitted_at: new Date().toISOString() })
    .eq('id', id)

  return fromSupabase(result) as any
}

// 审核进度（教师）
export const reviewProgress = async (
  id: number,
  data: {
    status: 'approved' | 'rejected'
    comment?: string
  }
): Promise<ApiResponse<void>> => {
  const { data: { user } } = await supabase.auth.getUser()

  const result = await supabase
    .from('progress')
    .update({
      status: data.status,
      reviewed_by: user?.id,
      review_comment: data.comment,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  return fromSupabase(result) as any
}

// 删除进度
export const deleteProgress = async (id: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('progress')
    .delete()
    .eq('id', id)

  return fromSupabase(result) as any
}

// 获取项目所有阶段进度
export const getProjectPhases = async (projectId: number): Promise<ApiResponse<{
  phases: Array<{
    id: number
    name: string
    deadline: string
    progress: Progress | null
  }>
}>> => {
  const phasesResult = await supabase
    .from('project_phases')
    .select('*')
    .eq('project_id', projectId)
    .order('order_num', { ascending: true })

  const phasesResponse: any = fromSupabase(phasesResult)

  if (phasesResponse.code === 200 && phasesResponse.data) {
    const phases = phasesResponse.data as any[]

    // 获取该项目所有进度
    const progressResult = await supabase
      .from('progress')
      .select('*')
      .eq('project_id', projectId)

    const progressList = progressResult.data || []

    phasesResponse.data = {
      phases: phases.map((phase: any) => {
        const progress = progressList.find((p: any) => p.phase_id === phase.id)
        return {
          id: phase.id,
          name: phase.name,
          deadline: phase.deadline,
          progress: progress || null,
        }
      }),
    }
  }

  return phasesResponse
}
