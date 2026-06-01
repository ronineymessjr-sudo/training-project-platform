import { supabase } from '../lib/supabase'
import { fromSupabase } from '../utils/supabase-helpers'

export interface Project {
  id: number
  topicId?: number
  name: string
  description?: string
  classId: number
  teacherId: number
  startDate: string
  endDate: string
  status: number
  className?: string
  teacherName?: string
  topicName?: string
  groupCount?: number
  createdAt: string
}

export interface ProjectQuery {
  page?: number
  pageSize?: number
  classId?: number
  teacherId?: number
  status?: number
  keyword?: string
  myOnly?: boolean
}

export interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

export interface ProjectListResponse {
  list: Project[]
  total: number
}

export const getProjectList = async (params?: ProjectQuery): Promise<ApiResponse<ProjectListResponse>> => {
  let query = supabase
    .from('projects')
    .select('*, classes(name), profiles!projects_teacher_id_fkey(real_name)', { count: 'exact' })

  if (params?.classId) {
    query = query.eq('class_id', params.classId)
  }
  if (params?.teacherId) {
    query = query.eq('teacher_id', params.teacherId)
  }
  if (params?.status !== undefined) {
    query = query.eq('status', params.status)
  }
  if (params?.keyword) {
    query = query.ilike('name', `%${params.keyword}%`)
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query.range(from, to).order('created_at', { ascending: false })

  const result = await query
  const response: any = fromSupabase(result)

  if (response.code === 200) {
    // 转换字段名
    const list = (result.data as any[])?.map((item: any) => ({
      ...item,
      className: item.classes?.name,
      teacherName: item.profiles?.real_name,
      classes: undefined,
      profiles: undefined,
    })) || []

    response.data = {
      list,
      total: result.count || 0,
    }
  }

  return response
}

export const getProjectDetail = async (id: number): Promise<ApiResponse<Project>> => {
  const result = await supabase
    .from('projects')
    .select('*, classes(name), profiles!projects_teacher_id_fkey(real_name)')
    .eq('id', id)
    .single()

  const response: any = fromSupabase(result)

  if (response.code === 200 && response.data) {
    const item = response.data as any
    response.data = {
      ...item,
      className: item.classes?.name,
      teacherName: item.profiles?.real_name,
      classes: undefined,
      profiles: undefined,
    } as Project
  }

  return response
}

export const createProject = async (data: Partial<Project>): Promise<ApiResponse<Project>> => {
  const insertData: any = {
    name: data.name,
    description: data.description,
    class_id: data.classId,
    teacher_id: data.teacherId,
    start_date: data.startDate,
    end_date: data.endDate,
    status: data.status ?? 0,
  }

  const result = await supabase
    .from('projects')
    .insert(insertData)
    .select()
    .single()

  return fromSupabase(result) as any
}

export const updateProject = async (id: number, data: Partial<Project>): Promise<ApiResponse<Project>> => {
  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.classId !== undefined) updateData.class_id = data.classId
  if (data.teacherId !== undefined) updateData.teacher_id = data.teacherId
  if (data.startDate !== undefined) updateData.start_date = data.startDate
  if (data.endDate !== undefined) updateData.end_date = data.endDate
  if (data.status !== undefined) updateData.status = data.status

  const result = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  return fromSupabase(result) as any
}

export const deleteProject = async (id: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  return fromSupabase(result) as any
}

export const getProjectGroups = async (id: number): Promise<ApiResponse<any[]>> => {
  const result = await supabase
    .from('groups')
    .select('*')
    .eq('project_id', id)

  return fromSupabase(result) as any
}

export const getProjectProgress = async (id: number): Promise<ApiResponse<any[]>> => {
  const result = await supabase
    .from('progress')
    .select('*')
    .eq('project_id', id)

  return fromSupabase(result) as any
}

export const projectApi = {
  getList: getProjectList,
  getDetail: getProjectDetail,
  create: createProject,
  update: updateProject,
  delete: deleteProject,
  getGroups: getProjectGroups,
  getProgress: getProjectProgress,
}
