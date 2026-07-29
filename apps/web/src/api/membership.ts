import { supabase } from '../lib/supabase'

export interface ProjectGroupContext {
  groupId: number
  groupName: string
}

/** Resolve the active user's group for a project before writing group-owned records. */
export async function getCurrentUserProjectGroup(projectId: number): Promise<{
  code: number
  data: ProjectGroupContext | null
  message?: string
}> {
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id
  if (!userId) return { code: 401, data: null, message: '请先登录' }

  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups!inner(project_id, name)')
    .eq('student_id', userId)
    .eq('status', 1)

  if (error) return { code: 500, data: null, message: error.message }

  const membership = (data || []).find((item: any) => item.groups?.project_id === projectId) as any
  if (!membership) {
    return { code: 404, data: null, message: '请先加入该项目的小组，再提交过程资料' }
  }

  return {
    code: 200,
    data: { groupId: membership.group_id, groupName: membership.groups?.name || '' },
    message: 'success',
  }
}
