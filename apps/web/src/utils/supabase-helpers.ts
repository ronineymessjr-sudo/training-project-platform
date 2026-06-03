import { messageHolder } from './messageHolder'
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

// Convert Supabase query result { data, error } into the unified ApiResponse shape used across the UI.
export function fromSupabase<T>(result: { data: T | null; error: PostgrestError | null }): ApiResponse<T | null> {
  if (result.error) {
    return {
      code: result.error.code === 'PGRST116' ? 404 : 500,
      message: result.error.message,
      data: null,
    }
  }
  return {
    code: 200,
    message: 'success',
    data: result.data as T,
  }
}

// Show a toast and return a normalised error response. Use for non-auth mutations where the caller wants to surface the error to the user.
export function handleSupabaseError(error: any): ApiResponse<null> {
  if (error?.message) {
    messageHolder.error(error.message)
  } else {
    messageHolder.error('\u64cd\u4f5c\u5931\u8d25')
  }
  return {
    code: 500,
    message: error?.message || '\u64cd\u4f5c\u5931\u8d25',
    data: null as any,
  }
}

// Translate Supabase Auth error messages to Chinese for the login form.
export function handleAuthError(error: any): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': '\u90ae\u7bb1\u6216\u5bc6\u7801\u9519\u8bef',
    'User not found': '\u7528\u6237\u4e0d\u5b58\u5728',
    'Email not confirmed': '\u90ae\u7bb1\u672a\u9a8c\u8bc1',
    'Invalid email': '\u90ae\u7bb1\u683c\u5f0f\u4e0d\u6b63\u786e',
    'Password should be at least 6 characters': '\u5bc6\u7801\u81f3\u5c11\u9700\u89816\u4e2a\u5b57\u7b26',
    'User already registered': '\u8be5\u90ae\u7bb1\u5df2\u6ce8\u518c',
    'Too many requests': '\u8bf7\u6c42\u8fc7\u4e8e\u9891\u7e41\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5',
  }
  return errorMap[error?.message] || error?.message || '\u64cd\u4f5c\u5931\u8d25'
}