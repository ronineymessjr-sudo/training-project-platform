import { supabase } from '../lib/supabase'
import { fromSupabase } from '../utils/supabase-helpers'

export interface Announcement {
  id: number
  title: string
  content: string
  type: number
  priority: number
  publisher_id: string
  target_roles: string[]
  status: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 获取公告列表
export const getAnnouncementList = async (params?: {
  type?: number
  page?: number
  pageSize?: number
  userRole?: string  // 当前用户角色，用于按角色过滤公告
}): Promise<ApiResponse<{ list: Announcement[]; total: number }>> => {
  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('announcements')
    .select('*', { count: 'exact' })
    .eq('status', 1)  // 只查已发布的公告
    .order('created_at', { ascending: false })
    .range(from, to)

  if (params?.type) {
    query = query.eq('type', params.type)
  }

  // 非管理员只能看到与自己角色匹配的公告
  if (params?.userRole && params.userRole !== 'admin') {
    // target_roles 为 null 表示全员可见，或者包含当前角色
    query = query.or(`target_roles.is.null,target_roles.cs.{${params.userRole}}`)
  }

  const result = await query
  const response: any = fromSupabase(result)

  if (response.code === 200) {
    return {
      code: 200,
      message: 'success',
      data: {
        list: (result.data || []) as Announcement[],
        total: result.count || 0,
      },
    }
  }
  return response
}

// 获取公告详情
export const getAnnouncementDetail = async (id: number): Promise<ApiResponse<Announcement>> => {
  const result = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .single()
  return fromSupabase(result) as any
}

// 创建公告
export const createAnnouncement = async (data: {
  title: string
  content: string
  type: number
  priority?: number
  target_roles?: string[]
}): Promise<ApiResponse<Announcement>> => {
  const { data: { user } } = await supabase.auth.getUser()
  const result = await supabase
    .from('announcements')
    .insert({ ...data, publisher_id: user?.id })
    .select()
    .single()
  return fromSupabase(result) as any
}

// 更新公告
export const updateAnnouncement = async (
  id: number,
  data: Partial<Announcement>
): Promise<ApiResponse<Announcement>> => {
  const result = await supabase
    .from('announcements')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  return fromSupabase(result) as any
}

// 删除公告
export const deleteAnnouncement = async (id: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)
  return fromSupabase(result) as any
}

// 发布公告
export const publishAnnouncement = async (id: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('announcements')
    .update({ status: 1, published_at: new Date().toISOString() })
    .eq('id', id)
  return fromSupabase(result) as any
}

// 撤回公告
export const withdrawAnnouncement = async (id: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('announcements')
    .update({ status: 2 })
    .eq('id', id)
  return fromSupabase(result) as any
}

// 获取阅读记录
export const getAnnouncementReads = async (
  id: number
): Promise<ApiResponse<Array<{ user_id: string; read_at: string }>>> => {
  const result = await supabase
    .from('announcement_reads')
    .select('user_id, read_at')
    .eq('announcement_id', id)
  return fromSupabase(result) as any
}

// 获取未读公告数量
export const getUnreadCount = async (userRole?: string): Promise<ApiResponse<{ count: number }>> => {
  const { data: { user } } = await supabase.auth.getUser()

  // 已读公告ID列表
  const readIds = (await supabase.from('announcement_reads').select('announcement_id').eq('user_id', user?.id)).data?.map(r => r.announcement_id) || []

  let query = supabase
    .from('announcements')
    .select('*', { count: 'exact', head: true })
    .eq('status', 1) // 只计已发布的

  if (readIds.length > 0) {
    query = query.not('id', 'in', `(${readIds.join(',')})`)
  }

  // 非管理员只统计自己角色能看到的
  if (userRole && userRole !== 'admin') {
    query = query.or(`target_roles.is.null,target_roles.cs.{${userRole}}`)
  }

  const { count } = await query
  return { code: 200, message: 'success', data: { count: count || 0 } }
}

// 标记已读
export const markAsRead = async (id: number): Promise<ApiResponse<void>> => {
  const { data: { user } } = await supabase.auth.getUser()
  const result = await supabase
    .from('announcement_reads')
    .upsert({ announcement_id: id, user_id: user?.id }, { onConflict: 'announcement_id,user_id' })
  return fromSupabase(result) as any
}