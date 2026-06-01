import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export interface User {
  id: string
  username: string
  realName: string
  email?: string
  avatarUrl?: string
  roles: string[]
  role?: string  // 兼容旧代码
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
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

        const user: User = {
          id: data.user.id,
          username: profile?.username || data.user.email || '',
          realName: profile?.real_name || '',
          email: data.user.email || undefined,
          avatarUrl: profile?.avatar_url || undefined,
          roles,
          role: roles[0] || 'student',
        }

        set({
          user,
          token: data.session.access_token,
          isAuthenticated: true,
        })
      },

      logout: async () => {
        await supabase.auth.signOut().catch(() => {})
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      checkAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()

          if (!session) {
            set({ isLoading: false, isAuthenticated: false, user: null, token: null })
            return
          }

          // 从 profiles 表获取用户详细信息
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, real_name, avatar_url')
            .eq('id', session.user.id)
            .single()

          // 获取用户角色
          const { data: roleRecords } = await supabase
            .from('user_roles')
            .select('roles(name)')
            .eq('user_id', session.user.id)

          const roles = roleRecords?.map((r: any) => r.roles?.name).filter(Boolean) || ['student']

          const user: User = {
            id: session.user.id,
            username: profile?.username || session.user.email || '',
            realName: profile?.real_name || '',
            email: session.user.email || undefined,
            avatarUrl: profile?.avatar_url || undefined,
            roles,
            role: roles[0] || 'student',
          }

          set({
            user,
            token: session.access_token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
