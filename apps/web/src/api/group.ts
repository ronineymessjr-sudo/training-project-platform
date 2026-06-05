import { supabase } from '../lib/supabase'
import { fromSupabase } from '../utils/supabase-helpers'

export interface Group {
  id: number
  projectId: number
  name: string
  description?: string
  leaderId?: string
  leaderName?: string
  maxMembers: number
  memberCount?: number
  status: number
  projectName?: string
  createdAt: string
  members?: GroupMember[]
}

export interface GroupMember {
  id: number
  groupId: number
  studentId: number
  username?: string
  realName?: string
  avatarUrl?: string
  role: number // 0: member, 1: leader
  status: number
}

export interface GroupApplication {
  id: number
  groupId: number
  studentId: number
  username?: string
  realName?: string
  type: number
  status: number
  message?: string
  createdAt: string
}

export interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

export interface GroupListResponse {
  list: Group[]
  total: number
}

export const getGroupList = async (params?: {
  page?: number
  pageSize?: number
  projectId?: number
  status?: number
  keyword?: string
}): Promise<ApiResponse<GroupListResponse>> => {
  let query = supabase
    .from('groups')
    .select('*, projects(name)', { count: 'exact' })

  if (params?.projectId) {
    query = query.eq('project_id', params.projectId)
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

  if (response.code === 200 && result.data) {
    const items = result.data as any[]

    // 批量获取组长姓名
    const leaderIds = [...new Set(items.map((item: any) => item.leader_id).filter(Boolean))]
    let leaderMap: Record<string, string> = {}
    if (leaderIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, real_name')
        .in('id', leaderIds as any)
      if (profilesData) {
        leaderMap = Object.fromEntries(profilesData.map((p: any) => [p.id, p.real_name || '']))
      }
    }

    // 批量获取各组的实时成员数
    const groupIds = items.map((item: any) => item.id).filter(Boolean)
    let memberCountMap: Record<number, number> = {}
    if (groupIds.length > 0) {
      // 对每个组单独count，避免 Supabase 跨表聚合问题
      for (const gid of groupIds) {
        const { count } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', gid)
        if (count !== null) memberCountMap[gid] = count
      }
    }

    const list = items.map((item: any) => ({
      id: item.id,
      projectId: item.project_id,
      name: item.name,
      description: item.description,
      leaderId: item.leader_id,
      leaderName: leaderMap[item.leader_id] || '',
      maxMembers: item.max_members || 4,
      memberCount: memberCountMap[item.id] || 0,
      status: item.status,
      projectName: item.projects?.name || '',
      createdAt: item.created_at,
      projects: undefined,
    })) || []

    response.data = {
      list,
      total: result.count || 0,
    }
  }

  return response
}

export const getGroupDetail = async (id: number): Promise<ApiResponse<Group>> => {
  const result = await supabase
    .from('groups')
    .select('*, projects(name), group_members(*)')
    .eq('id', id)
    .single()

  const response: any = fromSupabase(result)

  if (response.code === 200 && response.data) {
    const item = response.data as any

    // 批量获取成员用户信息（profiles）
    const studentIds = [...new Set((item.group_members || []).map((gm: any) => gm.student_id).filter(Boolean))]
    let profileMap: Record<string, { real_name: string; username: string }> = {}
    if (studentIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, real_name, username')
        .in('id', studentIds as any)
      if (profilesData) {
        profileMap = Object.fromEntries(profilesData.map((p: any) => [p.id, { real_name: p.real_name || '', username: p.username || '' }]))
      }
    }

    response.data = {
      id: item.id,
      projectId: item.project_id,
      name: item.name,
      description: item.description,
      leaderId: item.leader_id,
      maxMembers: item.max_members,
      memberCount: (item.group_members || []).length,
      status: item.status,
      projectName: item.projects?.name,
      leaderName: '',
      createdAt: item.created_at,
      members: item.group_members?.map((gm: any) => ({
        ...gm,
        realName: profileMap[gm.student_id]?.real_name || '',
        username: profileMap[gm.student_id]?.username || '',
      })) || [],
      group_members: undefined,
    } as Group
  }

  return response
}

export const createGroup = async (data: {
  projectId: number
  name: string
  description?: string
  maxMembers?: number
}): Promise<ApiResponse<Group>> => {
  const insertData: any = {
    project_id: data.projectId,
    name: data.name,
    description: data.description,
    max_members: data.maxMembers || 5,
    status: 1,
  }

  const result = await supabase
    .from('groups')
    .insert(insertData)
    .select()
    .single()

  return fromSupabase(result) as any
}

export const updateGroup = async (id: number, data: Partial<Group>): Promise<ApiResponse<Group>> => {
  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.maxMembers !== undefined) updateData.max_members = data.maxMembers
  if (data.status !== undefined) updateData.status = data.status
  if (data.leaderId !== undefined) updateData.leader_id = data.leaderId

  const result = await supabase
    .from('groups')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  return fromSupabase(result) as any
}

export const deleteGroup = async (id: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('groups')
    .delete()
    .eq('id', id)

  return fromSupabase(result) as any
}

export const addGroupMember = async (groupId: number, studentId: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      student_id: studentId,
      role: 0,
    })

  return fromSupabase(result) as any
}

export const removeGroupMember = async (groupId: number, studentId: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('student_id', studentId)

  // 检查是否有行被实际删除（RLS可能静默拒绝）
  if (result.error) {
    return { code: 500, message: result.error.message, data: undefined }
  }

  // 确认删除后该成员已不存在
  const { count } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)
    .eq('student_id', studentId)

  if (count && count > 0) {
    return { code: 500, message: '退出分组失败，请稍后重试', data: undefined }
  }

  return { code: 200, message: 'success', data: undefined }
}

export const applyToGroup = async (groupId: number, message?: string): Promise<ApiResponse<void>> => {
  const { data: { user } } = await supabase.auth.getUser()
  const result = await supabase
    .from('group_applications')
    .insert({
      group_id: groupId,
      student_id: user?.id,
      type: 0,
      status: 0,
      message,
    })

  return fromSupabase(result) as any
}

export const getGroupApplications = async (groupId: number): Promise<ApiResponse<GroupApplication[]>> => {
  const result = await supabase
    .from('group_applications')
    .select('*, profiles(real_name, username)')
    .eq('group_id', groupId)

  const response: any = fromSupabase(result)

  if (response.code === 200) {
    response.data = (response.data as any[])?.map((item: any) => ({
      ...item,
      realName: item.profiles?.real_name,
      username: item.profiles?.username,
      profiles: undefined,
    })) || []
  }

  return response
}

export const processGroupApplication = async (
  groupId: number,
  appId: number,
  action: 'accept' | 'reject'
): Promise<ApiResponse<void>> => {
  const status = action === 'accept' ? 1 : 2
  const result = await supabase
    .from('group_applications')
    .update({ status })
    .eq('id', appId)

  // 如果接受申请，自动添加为成员
  if (action === 'accept') {
    const { data: app } = await supabase
      .from('group_applications')
      .select('student_id')
      .eq('id', appId)
      .single()

    if (app?.student_id) {
      await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          student_id: app.student_id,
          role: 0,
        })
    }
  }

  return fromSupabase(result) as any
}

export const groupApi = {
  getList: getGroupList,
  getDetail: getGroupDetail,
  create: createGroup,
  update: updateGroup,
  delete: deleteGroup,
  addMember: addGroupMember,
  removeMember: removeGroupMember,
  apply: applyToGroup,
  getApplications: getGroupApplications,
  processApplication: processGroupApplication,
}
