import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

interface ComponentProps {
  children?: React.ReactNode
  to?: string
  [key: string]: unknown
}

// Mock do Supabase - Versão simplificada e funcional
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        range: vi.fn().mockResolvedValue({ data: [], error: null }),
        gte: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis()
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {}, error: null })
        })
      }),
      update: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {}, error: null })
        }),
        eq: vi.fn().mockReturnThis()
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user', email: 'test@test.com' } }, 
        error: null 
      }),
      getSession: vi.fn().mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      }),
      signInWithPassword: vi.fn().mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: null 
      }),
      signUp: vi.fn().mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: null 
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      })
    }
  }
}))

// Mock do React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ children }: { children: React.ReactNode }) => children,
  Link: ({ children, to, ...props }: ComponentProps) => {
    return React.createElement('a', { href: to, ...props }, children)
  }
}))

// Mock do Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: ComponentProps) => {
      return React.createElement('div', props, children)
    },
    button: ({ children, ...props }: ComponentProps) => {
      return React.createElement('button', props, children)
    },
    span: ({ children, ...props }: ComponentProps) => {
      return React.createElement('span', props, children)
    },
    img: ({ children, ...props }: ComponentProps) => {
      return React.createElement('img', props, children)
    },
    h1: ({ children, ...props }: ComponentProps) => {
      return React.createElement('h1', props, children)
    },
    h2: ({ children, ...props }: ComponentProps) => {
      return React.createElement('h2', props, children)
    },
    h3: ({ children, ...props }: ComponentProps) => {
      return React.createElement('h3', props, children)
    },
    p: ({ children, ...props }: ComponentProps) => {
      return React.createElement('p', props, children)
    },
    section: ({ children, ...props }: ComponentProps) => {
      return React.createElement('section', props, children)
    },
    article: ({ children, ...props }: ComponentProps) => {
      return React.createElement('article', props, children)
    },
    header: ({ children, ...props }: ComponentProps) => {
      return React.createElement('header', props, children)
    },
    main: ({ children, ...props }: ComponentProps) => {
      return React.createElement('main', props, children)
    },
    footer: ({ children, ...props }: ComponentProps) => {
      return React.createElement('footer', props, children)
    },
    nav: ({ children, ...props }: ComponentProps) => {
      return React.createElement('nav', props, children)
    },
    ul: ({ children, ...props }: ComponentProps) => {
      return React.createElement('ul', props, children)
    },
    li: ({ children, ...props }: ComponentProps) => {
      return React.createElement('li', props, children)
    },
    input: ({ children, ...props }: ComponentProps) => {
      return React.createElement('input', props, children)
    },
    label: ({ children, ...props }: ComponentProps) => {
      return React.createElement('label', props, children)
    },
    select: ({ children, ...props }: ComponentProps) => {
      return React.createElement('select', props, children)
    },
    option: ({ children, ...props }: ComponentProps) => {
      return React.createElement('option', props, children)
    },
    textarea: ({ children, ...props }: ComponentProps) => {
      return React.createElement('textarea', props, children)
    },

  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => {
    return React.createElement('div', {}, children)
  },
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    reverse: vi.fn(),
    finish: vi.fn(),
    cancel: vi.fn()
  }),
  useMotionValue: (value: unknown) => ({ get: () => value, set: vi.fn() }),
  useTransform: (value: unknown, transform: (val: unknown) => unknown) => ({ get: () => transform(value.get()) })
}))

// Mock do window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock do ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock do IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
