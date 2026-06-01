import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import AuthGuard from '../AuthGuard'

const mockStore = vi.hoisted(() => vi.fn())

vi.mock('../../../stores/auth.store', () => ({
  useAuthStore: mockStore,
}))

describe('AuthGuard', () => {
  beforeEach(() => {
    mockStore.mockReset()
  })

  it('renders children when authenticated and role matches', () => {
    mockStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', roles: ['student'] },
    })

    render(
      <MemoryRouter>
        <AuthGuard roles={['student']}>
          <div>Protected Content</div>
        </AuthGuard>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('returns null while loading', () => {
    mockStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    })

    const { container } = render(
      <MemoryRouter>
        <AuthGuard roles={['student']}>
          <div>Protected Content</div>
        </AuthGuard>
      </MemoryRouter>
    )

    expect(container.innerHTML).toBe('')
  })

  it('does not render children when role does not match', () => {
    mockStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', roles: ['student'] },
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthGuard roles={['admin']}>
          <div>Admin Only</div>
        </AuthGuard>
      </MemoryRouter>
    )

    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument()
  })
})
