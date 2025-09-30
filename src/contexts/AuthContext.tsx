import React, { createContext, useState, useEffect } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: { full_name: string; phone: string }) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: { full_name?: string; phone?: string; address?: string; cep?: string }) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext }

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há uma sessão ativa
    const getSession = async () => {
      try {
        console.log('🔍 AuthContext: Verificando sessão...');
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('❌ AuthContext: Erro ao obter sessão:', error)
        } else {
          console.log('✅ AuthContext: Sessão obtida:', session ? 'Logado' : 'Não logado');
          console.log('👤 AuthContext: User:', session?.user?.email || 'Nenhum');
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('❌ AuthContext: Erro ao verificar sessão:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: { full_name: string; phone: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      return { data, error }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (!error && data.session) {
        setSession(data.session)
        setUser(data.session.user)
        setLoading(false)
      }
      
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      // Limpar dados do "Lembrar de mim" no logout
      localStorage.removeItem('rememberedEmail')
      localStorage.removeItem('rememberMe')
      
      // Redirecionar para a landing page usando window.location
      window.location.href = '/'
      
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const updateProfile = async (updates: { full_name?: string; phone?: string; address?: string; cep?: string }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.displayName = 'AuthProvider'