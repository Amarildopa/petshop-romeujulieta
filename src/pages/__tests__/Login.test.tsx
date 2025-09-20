import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../Login'
import { useAuth } from '../../hooks/useAuth'

// Mock do contexto de autenticação
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

// Mock do Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    form: ({ children, ...props }: React.ComponentProps<'form'>) => <form {...props}>{children}</form>,
    button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
    input: ({ children, ...props }: React.ComponentProps<'input'>) => <input {...props}>{children}</input>,
    label: ({ children, ...props }: React.ComponentProps<'label'>) => <label {...props}>{children}</label>,
    span: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>
  }
}))

const MockedLogin = () => (
  <BrowserRouter>
    <Login />
  </BrowserRouter>
)

describe('Login Page', () => {
  const mockUseAuth = vi.mocked(useAuth)
  const mockSignIn = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: mockSignIn,
      signOut: vi.fn(),
      signUp: vi.fn(),
      session: null
    })
  })

  it('should render login form correctly', () => {
    render(<MockedLogin />)

    expect(screen.getByText('Entrar na sua conta')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /e-mail/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.getByText('Não tem uma conta?')).toBeInTheDocument()
    expect(screen.getByText('Cadastre-se aqui')).toBeInTheDocument()
  })

  it('should handle form input changes', async () => {
    render(<MockedLogin />)

    const emailInput = screen.getByRole('textbox', { name: /e-mail/i })
    const passwordInput = screen.getByLabelText('Senha')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('should handle form submission with valid data', async () => {
    mockSignIn.mockResolvedValue({ data: { user: { id: '1' } }, error: null })

    render(<MockedLogin />)

    const emailInput = screen.getByRole('textbox', { name: /e-mail/i })
    const passwordInput = screen.getByLabelText('Senha')
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should show validation errors for empty fields', async () => {
    render(<MockedLogin />)

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument()
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument()
    })
  })

  it('should show validation error for invalid email', async () => {
    render(<MockedLogin />)

    const emailInput = screen.getByRole('textbox', { name: /e-mail/i })
    const passwordInput = screen.getByLabelText('Senha')
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should show validation error for short password', async () => {
    render(<MockedLogin />)

    const emailInput = screen.getByRole('textbox', { name: /e-mail/i })
    const passwordInput = screen.getByLabelText('Senha')
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should handle sign in error', async () => {
    mockSignIn.mockResolvedValue({ 
      data: { user: null }, 
      error: { message: 'Invalid credentials' } 
    })

    render(<MockedLogin />)

    const emailInput = screen.getByRole('textbox', { name: /e-mail/i })
    const passwordInput = screen.getByLabelText('Senha')
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('should show loading state during sign in', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ data: { user: { id: '1' } }, error: null }), 100)
    ))

    render(<MockedLogin />)

    const emailInput = screen.getByRole('textbox', { name: /e-mail/i })
    const passwordInput = screen.getByLabelText('Senha')
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    expect(screen.getByText('Entrando...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.queryByText('Entrando...')).not.toBeInTheDocument()
    })
  })

  it('should toggle password visibility', () => {
    render(<MockedLogin />)

    const passwordInput = screen.getByLabelText('Senha')
    const toggleButton = screen.getByRole('button', { name: '' })

    expect(passwordInput).toHaveAttribute('type', 'password')

    fireEvent.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument()
  })

  it('should have correct accessibility attributes', () => {
    render(<MockedLogin />)

    const emailInput = screen.getByRole('textbox', { name: /e-mail/i })
    const passwordInput = screen.getByLabelText('Senha')
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
    expect(submitButton).toHaveAttribute('type', 'submit')
  })
})
