import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'
import type { ReactNode } from 'react'

interface AuthGuardProps {
  children?: ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return null
  }

  // 演示模式：未认证时也允许通过
  return <>{children || <Outlet />}</>
}
