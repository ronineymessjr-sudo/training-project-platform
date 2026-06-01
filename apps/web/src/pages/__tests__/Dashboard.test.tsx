import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Dashboard from '../Dashboard'

const mockStore = vi.hoisted(() => vi.fn(() => ({
  user: { id: '1', roles: ['student'], role: 'student', username: 'test', realName: '测试学生' },
  logout: vi.fn(),
})))

vi.mock('../../stores/auth.store', () => ({
  useAuthStore: mockStore,
}))

vi.mock('../../api/project', () => ({
  getProjectList: vi.fn().mockResolvedValue({ data: { list: [], total: 0 } }),
}))

vi.mock('../../api/group', () => ({
  getGroupList: vi.fn().mockResolvedValue({ data: { list: [], total: 0 } }),
}))

describe('Dashboard', () => {
  it('renders statistic cards after loading', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('我的项目')).toBeInTheDocument()
    })
    expect(screen.getByText('待完成任务')).toBeInTheDocument()
    expect(screen.getByText('已完成')).toBeInTheDocument()
    // 我的小组 同时出现在 Statistic 和 Card 标题中，用 getAllByText 验证
    expect(screen.getAllByText('我的小组').length).toBeGreaterThanOrEqual(1)
  })

  it('renders quick actions section for students', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('快捷入口')).toBeInTheDocument()
    })
    expect(screen.getByText('项目列表')).toBeInTheDocument()
    expect(screen.getByText('小组管理')).toBeInTheDocument()
    expect(screen.getByText('进度提交')).toBeInTheDocument()
  })
})
