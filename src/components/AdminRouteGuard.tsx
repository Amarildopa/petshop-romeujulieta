import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Loader2 } from 'lucide-react'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { logger } from '../lib/logger'

interface AdminRouteGuardProps {
  children: React.ReactNode
  requiredPermission?: string
  fallbackPath?: string
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/dashboard'
}) => {
  const { isAdmin, loading, error, adminUser } = useAdminAuth()
  const location = useLocation()

  // Log da tentativa de acesso
  React.useEffect(() => {
    if (!loading) {
      logger.info('Admin route access attempt', {
        path: location.pathname,
        isAdmin,
        requiredPermission,
        adminRole: adminUser?.role
      }, 'ADMIN')
    }
  }, [loading, isAdmin, location.pathname, requiredPermission, adminUser?.role])

  // Mostrar loading enquanto verifica permissões
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-color">Verificando permissões administrativas...</p>
        </motion.div>
      </div>
    )
  }

  // Se não é admin, redirecionar
  if (!isAdmin) {
    logger.warn('Unauthorized admin access attempt', {
      path: location.pathname,
      userId: adminUser?.user_id
    }, 'ADMIN')
    
    return <Navigate to={fallbackPath} replace />
  }

  // Se há erro na verificação
  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-6"
        >
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-color-dark mb-2">
            Erro de Verificação
          </h2>
          <p className="text-text-color mb-4">
            Ocorreu um erro ao verificar suas permissões administrativas.
          </p>
          <p className="text-sm text-text-color/60 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Tentar Novamente
          </button>
        </motion.div>
      </div>
    )
  }

  // Verificar permissão específica se fornecida
  if (requiredPermission && adminUser) {
    const hasPermission = adminUser.permissions[requiredPermission as keyof typeof adminUser.permissions] === true ||
                         adminUser.permissions.all === true ||
                         adminUser.role === 'super_admin'

    if (!hasPermission) {
      logger.warn('Insufficient admin permissions', {
        path: location.pathname,
        requiredPermission,
        userRole: adminUser.role,
        userPermissions: adminUser.permissions
      }, 'ADMIN')

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto p-6"
          >
            <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-color-dark mb-2">
              Acesso Negado
            </h2>
            <p className="text-text-color mb-4">
              Você não tem permissão para acessar esta área administrativa.
            </p>
            <p className="text-sm text-text-color/60 mb-6">
              Permissão necessária: <strong>{requiredPermission}</strong>
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => window.location.href = '/admin'}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Ir para Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      )
    }
  }

  // Se chegou até aqui, tem permissão
  return <>{children}</>
}

export default AdminRouteGuard
