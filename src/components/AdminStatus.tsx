import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Crown, User, AlertCircle } from 'lucide-react'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useNavigate } from 'react-router-dom'

const AdminStatus: React.FC = () => {
  const { isAdmin, isSuperAdmin, isManager, adminUser, loading } = useAdminAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-text-color">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Verificando...</span>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const getRoleIcon = () => {
    if (isSuperAdmin) return <Crown className="h-4 w-4 text-yellow-500" />
    if (isManager) return <User className="h-4 w-4 text-blue-500" />
    return <Shield className="h-4 w-4 text-green-500" />
  }

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin'
    if (isManager) return 'Gerente'
    return 'Admin'
  }

  const getRoleColor = () => {
    if (isSuperAdmin) return 'text-yellow-600 bg-yellow-100'
    if (isManager) return 'text-blue-600 bg-blue-100'
    return 'text-green-600 bg-green-100'
  }

  const handleAdminClick = () => {
    navigate('/admin')
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-2"
    >
      {getRoleIcon()}
      <span 
        className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor()} cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={handleAdminClick}
      >
        {getRoleLabel()}
      </span>
      {!adminUser?.is_active && (
        <AlertCircle className="h-4 w-4 text-red-500" title="Conta inativa" />
      )}
    </motion.div>
  )
}

export default AdminStatus
