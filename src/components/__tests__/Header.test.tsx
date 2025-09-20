import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Header } from '../Header'
import { useAuth } from '../../hooks/useAuth'

// Mock do contexto de autenticação
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

// Mock do Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

const MockedHeader = () => (
  <BrowserRouter>
    <Header />
  </BrowserRouter>
)

describe('Header', () => {
  const mockUseAuth = vi.mocked(useAuth)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render header with navigation links when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      session: null
    })

    render(<MockedHeader />)

    expect(screen.getByText('Romeu e Julieta Pet&Spa')).toBeInTheDocument()
    expect(screen.getByText('Serviços')).toBeInTheDocument()
    expect(screen.getByText('Loja')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Entrar')).toBeInTheDocument()
    expect(screen.getByText('Cadastrar')).toBeInTheDocument()
  })

  it('should render user menu when user is authenticated', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    }

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      session: null
    })

    render(<MockedHeader />)

    expect(screen.getByText('Romeu e Julieta Pet&Spa')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Serviços')).toBeInTheDocument()
    expect(screen.getByText('Loja')).toBeInTheDocument()
    expect(screen.getByText('Sair')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      session: null
    })

    render(<MockedHeader />)

    expect(screen.getByText('Romeu e Julieta Pet&Spa')).toBeInTheDocument()
    // O header deve renderizar mesmo no loading
  })

  it('should handle mobile menu toggle', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      session: null
    })

    render(<MockedHeader />)

    const mobileMenuButton = screen.getByRole('button')
    expect(mobileMenuButton).toBeInTheDocument()

    fireEvent.click(mobileMenuButton)
    // Verificar se o menu mobile foi aberto (dependendo da implementação)
  })

  it('should handle sign out when user clicks logout', () => {
    const mockSignOut = vi.fn()
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    }

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: vi.fn(),
      signOut: mockSignOut,
      signUp: vi.fn(),
      session: null
    })

    render(<MockedHeader />)

    const signOutButton = screen.getByText('Sair')
    fireEvent.click(signOutButton)

    expect(mockSignOut).toHaveBeenCalled()
  })

  it('should have correct navigation links', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      session: null
    })

    render(<MockedHeader />)

    // Verificar se os links têm os hrefs corretos
    const servicesLink = screen.getByText('Serviços').closest('a')
    expect(servicesLink).toHaveAttribute('href', '/services')

    const storeLink = screen.getByText('Loja').closest('a')
    expect(storeLink).toHaveAttribute('href', '/store')

    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
  })

  it('should have correct user navigation links when authenticated', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    }

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      session: null
    })

    render(<MockedHeader />)

    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')

    const servicesLink = screen.getByText('Serviços').closest('a')
    expect(servicesLink).toHaveAttribute('href', '/services')

    const storeLink = screen.getByText('Loja').closest('a')
    expect(storeLink).toHaveAttribute('href', '/store')

    const profileLink = screen.getByText('Test User').closest('a')
    expect(profileLink).toHaveAttribute('href', '/profile')
  })
})
