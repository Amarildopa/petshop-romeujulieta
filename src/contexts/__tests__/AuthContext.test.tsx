import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { supabase } from '../../lib/supabase'

// Mock do Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    from: vi.fn()
  }
}))

// Componente de teste para usar o contexto
const TestComponent = () => {
  const { user, loading, signIn, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={signOut}>
        Sign Out
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  const mockSupabase = vi.mocked(supabase)
  const mockGetUser = vi.fn()
  const mockSignInWithPassword = vi.fn()
  const mockSignUp = vi.fn()
  const mockSignOut = vi.fn()
  const mockOnAuthStateChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth = {
      getUser: mockGetUser,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange
    } as any
  })

  it('should provide initial loading state', () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should handle sign in successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    }

    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    mockSignInWithPassword.mockResolvedValue({ data: { user: mockUser }, error: null })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Sign In'))

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
    })
  })

  it('should handle sign in error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    mockSignInWithPassword.mockResolvedValue({ 
      data: { user: null }, 
      error: { message: 'Invalid credentials' } 
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Sign In'))

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
    })
  })

  it('should handle sign out', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    mockSignOut.mockResolvedValue({ error: null })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Sign Out'))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  it('should handle sign up successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    }

    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    mockSignUp.mockResolvedValue({ data: { user: mockUser }, error: null })

    // Teste direto da função signUp
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    })

    await act(async () => {
      await result.current.signUp('test@example.com', 'password', {
        full_name: 'Test User',
        phone: '123456789'
      })
    })

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      options: {
        data: {
          full_name: 'Test User',
          phone: '123456789'
        }
      }
    })
  })
})
