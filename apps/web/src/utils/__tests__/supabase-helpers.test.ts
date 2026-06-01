import { describe, it, expect } from 'vitest'
import { fromSupabase, handleAuthError } from '../supabase-helpers'

describe('fromSupabase', () => {
  it('returns success response when data exists and no error', () => {
    const result = fromSupabase({ data: { id: 1, name: 'test' }, error: null })
    expect(result.code).toBe(200)
    expect(result.message).toBe('success')
    expect(result.data).toEqual({ id: 1, name: 'test' })
  })

  it('returns 404 for PGRST116 (no rows found) error', () => {
    const error = { code: 'PGRST116', message: 'No rows found', details: '', hint: '' }
    const result = fromSupabase({ data: null, error } as any)
    expect(result.code).toBe(404)
    expect(result.data).toBeNull()
  })

  it('returns 500 for generic database error', () => {
    const error = { code: '23505', message: 'Duplicate key', details: '', hint: '' }
    const result = fromSupabase({ data: null, error } as any)
    expect(result.code).toBe(500)
    expect(result.message).toBe('Duplicate key')
  })

  it('returns null data when data is null without error', () => {
    const result = fromSupabase({ data: null, error: null })
    expect(result.code).toBe(200)
    expect(result.data).toBeNull()
  })

  it('handles empty array data correctly', () => {
    const result = fromSupabase({ data: [], error: null })
    expect(result.code).toBe(200)
    expect(result.data).toEqual([])
  })

  it('handles array data correctly', () => {
    const result = fromSupabase({ data: [{ id: 1 }, { id: 2 }], error: null })
    expect(result.code).toBe(200)
    expect(result.data).toHaveLength(2)
  })
})

describe('handleAuthError', () => {
  it('returns Chinese error message for "Invalid login credentials"', () => {
    expect(handleAuthError({ message: 'Invalid login credentials' })).toBe('邮箱或密码错误')
  })

  it('returns Chinese error message for "User not found"', () => {
    expect(handleAuthError({ message: 'User not found' })).toBe('用户不存在')
  })

  it('returns Chinese error message for "Password should be at least 6 characters"', () => {
    expect(handleAuthError({ message: 'Password should be at least 6 characters' })).toBe('密码至少需要6个字符')
  })

  it('returns Chinese error message for "Too many requests"', () => {
    expect(handleAuthError({ message: 'Too many requests' })).toBe('请求过于频繁，请稍后再试')
  })

  it('returns original message for unknown error', () => {
    expect(handleAuthError({ message: 'Unknown error occurred' })).toBe('Unknown error occurred')
  })

  it('returns fallback text when error has no message', () => {
    expect(handleAuthError({})).toBe('操作失败')
  })
})