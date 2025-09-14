import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  UserCheck,
  UserX
} from 'lucide-react'
import { adminService, AdminUser } from '../services/adminService'
import { logger } from '../lib/logger'

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('view')

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAdminUsers()
      setUsers(data)
      logger.info('Admin users loaded', { count: data.length }, 'ADMIN')
    } catch (error) {
      logger.error('Error loading admin users', error as Error, {}, 'ADMIN')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.profiles_pet?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profiles_pet?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleCreateUser = () => {
    setSelectedUser(null)
    setModalType('create')
    setShowModal(true)
  }

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user)
    setModalType('edit')
    setShowModal(true)
  }

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user)
    setModalType('view')
    setShowModal(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja remover este administrador?')) {
      try {
        await adminService.deleteAdminUser(userId)
        await loadUsers()
        logger.info('Admin user deleted', { userId }, 'ADMIN')
      } catch (error) {
        logger.error('Error deleting admin user', error as Error, { userId }, 'ADMIN')
      }
    }
  }

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      await adminService.updateAdminUser(user.id, {
        is_active: !user.is_active
      })
      await loadUsers()
      logger.info('Admin user status toggled', { userId: user.id, isActive: !user.is_active }, 'ADMIN')
    } catch (error) {
      logger.error('Error toggling admin user status', error as Error, { userId: user.id }, 'ADMIN')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'manager': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin'
      case 'admin': return 'Administrador'
      case 'manager': return 'Gerente'
      default: return role
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-color">Carregando usuários administrativos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-color-dark mb-2">
              Gerenciar Administradores
            </h1>
            <p className="text-text-color">
              Gerencie usuários com acesso administrativo ao sistema
            </p>
          </div>
          
          <button
            onClick={handleCreateUser}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Admin
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-color" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Filtrar por cargo"
            >
              <option value="all">Todos os cargos</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Administrador</option>
              <option value="manager">Gerente</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Filtrar por status"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-text-color" />
              <span className="text-sm text-text-color">
                {filteredUsers.length} de {users.length} usuários
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white rounded-2xl shadow-lg border border-accent/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/20">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-text-color-dark">
                            {user.profiles_pet?.full_name || 'Nome não disponível'}
                          </div>
                          <div className="text-sm text-text-color">
                            {user.profiles_pet?.email || 'Email não disponível'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.is_active ? (
                          <div className="flex items-center text-green-600">
                            <UserCheck className="h-4 w-4 mr-1" />
                            <span className="text-sm">Ativo</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <UserX className="h-4 w-4 mr-1" />
                            <span className="text-sm">Inativo</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={user.is_active ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                          title={user.is_active ? "Desativar" : "Ativar"}
                        >
                          {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-color-dark">
                  {modalType === 'create' ? 'Adicionar Administrador' :
                   modalType === 'edit' ? 'Editar Administrador' : 'Detalhes do Administrador'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-text-color hover:text-text-color-dark"
                >
                  ×
                </button>
              </div>

              {modalType === 'view' && selectedUser ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1">Nome</label>
                    <p className="text-text-color-dark">{selectedUser.profiles_pet?.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1">Email</label>
                    <p className="text-text-color-dark">{selectedUser.profiles_pet?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1">Telefone</label>
                    <p className="text-text-color-dark">{selectedUser.profiles_pet?.phone || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1">Cargo</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                      {getRoleLabel(selectedUser.role)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1">Status</label>
                    <span className={selectedUser.is_active ? "text-green-600" : "text-red-600"}>
                      {selectedUser.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1">Criado em</label>
                    <p className="text-text-color-dark">
                      {new Date(selectedUser.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1">Usuário</label>
                    <select 
                      className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Selecionar usuário"
                    >
                      <option value="">Selecione um usuário</option>
                      {/* Aqui você carregaria a lista de usuários disponíveis */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1">Cargo</label>
                    <select 
                      className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Selecionar cargo"
                    >
                      <option value="manager">Gerente</option>
                      <option value="admin">Administrador</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-text-color">Usuário ativo</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-text-color border border-accent rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {modalType === 'view' ? 'Fechar' : 'Cancelar'}
                </button>
                {modalType !== 'view' && (
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    {modalType === 'create' ? 'Criar' : 'Salvar'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
