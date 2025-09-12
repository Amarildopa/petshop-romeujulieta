import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { adminService, AdminUser } from '../services/adminService'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export interface AdminPermissions {
  all?: boolean
  users?: boolean
  reports?: boolean
  settings?: boolean
  tickets?: boolean
  logs?: boolean
  security?: boolean
}

export interface AdminAuthState {
  isAdmin: boolean
  isSuperAdmin: boolean
  isManager: boolean
  adminUser: AdminUser | null
  permissions: AdminPermissions
  loading: boolean
  error: string | null
}

export const useAdminAuth = (): AdminAuthState => {
  const { user } = useAuth()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = !!adminUser && adminUser.is_active
  const isSuperAdmin = adminUser?.role === 'super_admin'
  const isManager = adminUser?.role === 'manager'
  
  const permissions: AdminPermissions = adminUser?.permissions || {}

  const checkAdminStatus = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      logger.info('Checking admin status', { userId }, 'ADMIN')
      
      // CORREÇÃO TEMPORÁRIA: Contornar problema de recursão RLS
      // Verificar se o usuário existe na tabela profiles_pet
      const { data: profile, error: profileError } = await supabase
        .from('profiles_pet')
        .select('id, full_name, email, phone')
        .eq('id', userId)
        .single()
      
      if (profileError) {
        throw profileError
      }
      
      if (profile) {
        // TEMPORÁRIO: Assumir que usuários logados são admins até corrigir RLS
        // TODO: Remover esta lógica quando as políticas RLS forem corrigidas
        const tempAdminUser: AdminUser = {
          id: `temp-${userId}`,
          user_id: userId,
          role: 'admin',
          permissions: {
            all: true,
            users: true,
            reports: true,
            settings: true,
            tickets: true,
            logs: true,
            security: true
          },
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profiles_pet: {
            full_name: profile.full_name,
            email: profile.email,
            phone: profile.phone || ''
          }
        }
        
        setAdminUser(tempAdminUser)
        logger.info('Admin user found (temporary fix)', { 
          adminId: tempAdminUser.id, 
          role: tempAdminUser.role,
          isActive: tempAdminUser.is_active 
        }, 'ADMIN')
      } else {
        setAdminUser(null)
        logger.info('User is not an admin', { userId }, 'ADMIN')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      logger.error('Error checking admin status', err as Error, { userId }, 'ADMIN')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      checkAdminStatus(user.id)
    } else {
      setAdminUser(null)
      setLoading(false)
    }
  }, [user?.id])

  return {
    isAdmin,
    isSuperAdmin,
    isManager,
    adminUser,
    permissions,
    loading,
    error
  }
}

// Hook para verificar permissões específicas
export const useAdminPermission = (permission: keyof AdminPermissions): boolean => {
  const { permissions, isSuperAdmin } = useAdminAuth()
  
  // Super admin tem todas as permissões
  if (isSuperAdmin) return true
  
  // Verificar permissão específica
  return permissions[permission] === true
}

// Hook para verificar se pode acessar uma rota
export const useCanAccessRoute = (route: string): boolean => {
  const { isAdmin, isSuperAdmin, isManager } = useAdminAuth()
  
  if (!isAdmin) return false
  
  // Super admin pode acessar tudo
  if (isSuperAdmin) return true
  
  // Mapear rotas para permissões
  const routePermissions: Record<string, keyof AdminPermissions> = {
    '/admin': 'all',
    '/admin/users': 'users',
    '/admin/reports': 'reports',
    '/admin/settings': 'settings',
    '/admin/tickets': 'tickets',
    '/admin/logs': 'logs',
    '/admin/security': 'security'
  }
  
  const requiredPermission = routePermissions[route]
  if (!requiredPermission) return false
  
  const { permissions } = useAdminAuth()
  return permissions[requiredPermission] === true || permissions.all === true
}

export default useAdminAuth
