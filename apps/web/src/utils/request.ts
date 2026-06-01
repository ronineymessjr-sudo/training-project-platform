import { message } from 'antd'
import { PostgrestError } from '@supabase/supabase-js'

// API response types
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
}

export interface PageResult<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 将 Supabase 查询结果 { data, error } 转换为前端统一的 ApiResponse 格式
 */
export function fromSupabase<T>(result: { data: T | null; error: PostgrestError | null }): ApiResponse<T> {
  if (result.error) {
    return {
      code: result.error.code === 'PGRST116' ? 404 : 500,
      message: result.error.message,
      data: null as any,
    }
  }
  return {
    code: 200,
    message: 'success',
    data: result.data as T,
  }
}

/**
 * 处理 Supabase 错误，显示提示并返回统一格式
 */
export function handleSupabaseError(error: any): ApiResponse<null> {
  if (error?.message) {
    message.error(error.message)
  } else {
    message.error('操作失败')
  }
  return {
    code: 500,
    message: error?.message || '操作失败',
    data: null as any,
  }
}

/**
 * 处理 Supabase Auth 错误
 */
export function handleAuthError(error: any): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': '邮箱或密码错误',
    'User not found': '用户不存在',
    'Email not confirmed': '邮箱未验证',
    'Invalid email': '邮箱格式不正确',
    'Password should be at least 6 characters': '密码至少需要6个字符',
    'User already registered': '该邮箱已注册',
    'Too many requests': '请求过于频繁，请稍后再试',
  }
  return errorMap[error?.message] || error?.message || '操作失败'
}

export default {
  fromSupabase,
  handleSupabaseError,
  handleAuthError,
}
