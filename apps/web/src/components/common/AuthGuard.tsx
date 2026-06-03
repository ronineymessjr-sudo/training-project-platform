import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'
import { messageHolder } from '../../utils/messageHolder'
import type { ReactNode } from 'react'

interface AuthGuardProps {
  children?: ReactNode
  roles?: string[]  // 允许访问的角色列表，为空则不限制角色
}

export default function AuthGuard({ children, roles }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0 && user && !roles.some(r => user.roles.includes(r))) {
    messageHolder.warning('您没有权限访问该页面')
    return <Navigate to="/dashboard" replace />
  }

  return <>{children || <Outlet />}</>
}