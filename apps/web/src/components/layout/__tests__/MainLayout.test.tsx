import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import MainLayout from '../MainLayout'

const mockLogout = vi.hoisted(() => vi.fn())

const mockStore = vi.hoisted(() => vi.fn(() => ({
  user: {
    id: '1',
    roles: ['student'],
    role: 'student',
    username: 'student1',
    realName: '测试学生',
  },
  logout: mockLogout,
})))

vi.mock('../../../stores/auth.store', () => ({
  useAuthStore: mockStore,
}))

describe('MainLayout', () => {
  it('renders sidebar title and student menu items', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <MainLayout />
      </MemoryRouter>
    )

    expect(screen.getByText('实训管理平台')).toBeInTheDocument()
    expect(screen.getByText('仪表盘')).toBeInTheDocument()
    expect(screen.getByText('项目管理')).toBeInTheDocument()
    expect(screen.getByText('我的分组')).toBeInTheDocument()
    expect(screen.getByText('进度管理')).toBeInTheDocument()
  })

  it('shows user information in header', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <MainLayout />
      </MemoryRouter>
    )

    expect(screen.getByText('测试学生')).toBeInTheDocument()
    expect(screen.getByText('(学生)')).toBeInTheDocument()
  })
})
