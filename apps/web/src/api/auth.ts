import { supabase } from '../lib/supabase'
import { handleAuthError } from '../utils/request'

export interface UserProfile {
  id: string
  username: string
  realName: string
  email?: string
  avatarUrl?: string
  roles: string[]
  role?: string
}

export const authApi = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw new Error(handleAuthError(error))
    }

    // 从 profiles 表获取用户详细信息
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, real_name, avatar_url')
      .eq('id', data.user.id)
      .single()

    // 获取用户角色
    const { data: roleRecords } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', data.user.id)

    const roles = roleRecords?.map((r: any) => r.roles?.name).filter(Boolean) || ['student']

    const user: UserProfile = {
      id: data.user.id,
      username: profile?.username || data.user.email || '',
      realName: profile?.real_name || '',
      email: data.user.email || undefined,
      avatarUrl: profile?.avatar_url || undefined,
      roles,
      role: roles[0] || 'student',
    }

    return {
      user,
      token: data.session.access_token,
    }
  },

  register: async (email: string, password: string, username: string, realName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          real_name: realName,
        },
      },
    })
    if (error) {
      throw new Error(handleAuthError(error))
    }
    return data
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      throw new Error('未登录')
    }

    // 从 profiles 表获取用户详细信息
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, real_name, avatar_url')
      .eq('id', authUser.id)
      .single()

    // 获取用户角色
    const { data: roleRecords } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', authUser.id)

    const roles = roleRecords?.map((r: any) => r.roles?.name).filter(Boolean) || ['student']

    return {
      id: authUser.id,
      username: profile?.username || authUser.email || '',
      realName: profile?.real_name || '',
      email: authUser.email || undefined,
      avatarUrl: profile?.avatar_url || undefined,
      roles,
      role: roles[0] || 'student',
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
  },

  changePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) {
      throw new Error(handleAuthError(error))
    }
  },
}
