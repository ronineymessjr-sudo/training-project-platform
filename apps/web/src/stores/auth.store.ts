import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

// Mock 模式：当没有真实 Supabase 配置时使用
const isMockMode = !import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL === 'https://your-project.supabase.co'

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
  // 角色判断getter
  isAdmin: () => boolean
  isTeacher: () => boolean
  isStudent: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        // Mock 模式：模拟登录成功
        if (isMockMode) {
          // 模拟延迟
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 根据邮箱判断角色
          let roles = ['student']
          if (email.includes('admin')) {
            roles = ['admin']
          } else if (email.includes('teacher')) {
            roles = ['teacher']
          }
          
          const mockUser: User = {
            id: 'mock-user-id',
            username: email.split('@')[0],
            realName: email.includes('admin') ? '管理员' : email.includes('teacher') ? '教师' : '学生',
            email,
            roles,
            role: roles[0],
          }
          
          set({
            user: mockUser,
            token: 'mock-token',
            isAuthenticated: true,
          })
          return
        }
        
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
        // Mock 模式：直接完成加载，不检查认证
        if (isMockMode) {
          set({ isLoading: false, isAuthenticated: false, user: null, token: null })
          return
        }
        
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

      // 角色判断getter实现
      isAdmin: () => {
        const user = get().user
        return user?.roles?.includes('admin') || user?.role === 'admin' || false
      },
      isTeacher: () => {
        const user = get().user
        return user?.roles?.includes('teacher') || user?.role === 'teacher' || false
      },
      isStudent: () => {
        const user = get().user
        return user?.roles?.includes('student') || user?.role === 'student' || false
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
