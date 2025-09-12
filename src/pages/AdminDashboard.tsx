import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  Calendar, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Settings,
  Bell,
  MessageSquare,
  Shield,
  Activity,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import { adminService, AdminUser, AdminNotification, SupportTicket } from '../services/adminService'
import { logger } from '../lib/logger'
import { metrics } from '../lib/metrics'

interface DashboardStats {
  totalUsers: number
  totalPets: number
  totalAppointments: number
  totalOrders: number
  totalRevenue: number
  activeAdmins: number
  openTickets: number
  unreadNotifications: number
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [recentTickets, setRecentTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Carregar estatísticas básicas
      const [notificationsData, ticketsData] = await Promise.all([
        adminService.getAdminNotifications(),
        adminService.getSupportTickets(5, 0)
      ])

      setNotifications(notificationsData)
      setRecentTickets(ticketsData)

      // Simular dados de estatísticas (em produção, viria de uma API)
      const mockStats: DashboardStats = {
        totalUsers: 1247,
        totalPets: 2156,
        totalAppointments: 342,
        totalOrders: 189,
        totalRevenue: 45678.90,
        activeAdmins: 3,
        openTickets: 12,
        unreadNotifications: notificationsData.filter(n => !n.is_read).length
      }

      setStats(mockStats)

      // Log da ação
      logger.info('Admin dashboard loaded', { stats: mockStats }, 'ADMIN')
      metrics.recordBusinessEvent('admin_dashboard_viewed', 1, 'admin')

    } catch (error) {
      logger.error('Error loading dashboard data', error as Error, {}, 'ADMIN')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'success': return <TrendingUp className="h-5 w-5 text-green-500" />
      default: return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-color">Carregando dashboard administrativo...</p>
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
              Dashboard Administrativo
            </h1>
            <p className="text-text-color">
              Visão geral do sistema Romeu e Julieta Pet&Spa
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-color mb-1">Total de Usuários</p>
                <p className="text-3xl font-bold text-text-color-dark">{stats?.totalUsers.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-text-color mt-2">
              +12% este mês
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-color mb-1">Receita Total</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(stats?.totalRevenue || 0)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-text-color mt-2">
              +8% este mês
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-color mb-1">Agendamentos</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.totalAppointments}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-text-color mt-2">
              {stats?.totalPets} pets cadastrados
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-color mb-1">Pedidos</p>
                <p className="text-3xl font-bold text-orange-600">{stats?.totalOrders}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <ShoppingBag className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-text-color mt-2">
              {stats?.openTickets} tickets abertos
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notificações Recentes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-color-dark">Notificações</h2>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                {stats?.unreadNotifications > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {stats.unreadNotifications}
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-color-dark truncate">
                      {notification.title}
                    </p>
                    <p className="text-sm text-text-color truncate">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      <span className="text-xs text-text-color">
                        {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {notifications.length === 0 && (
                <p className="text-text-color text-center py-4">
                  Nenhuma notificação encontrada
                </p>
              )}
            </div>
          </motion.div>

          {/* Tickets de Suporte Recentes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-color-dark">Tickets Recentes</h2>
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="border-l-4 border-accent/20 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-text-color-dark truncate">
                      {ticket.subject}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-color truncate">
                    {ticket.profiles_pet?.full_name || 'Usuário'}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-text-color">
                      {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
              
              {recentTickets.length === 0 && (
                <p className="text-text-color text-center py-4">
                  Nenhum ticket encontrado
                </p>
              )}
            </div>
          </motion.div>

          {/* Ações Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-color-dark">Ações Rápidas</h2>
              <Settings className="h-5 w-5 text-gray-600" />
            </div>
            
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-text-color-dark">Gerenciar Usuários</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-text-color-dark">Ver Relatórios</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-text-color-dark">Configurações</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <Shield className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-text-color-dark">Administradores</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <Activity className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-text-color-dark">Logs do Sistema</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Gráficos e Métricas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-color-dark">Métricas de Performance</h2>
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <Download className="h-5 w-5 text-green-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">98.5%</div>
              <p className="text-sm text-text-color">Uptime do Sistema</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">2.3s</div>
              <p className="text-sm text-text-color">Tempo de Resposta</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">1.2k</div>
              <p className="text-sm text-text-color">Páginas Visualizadas</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard
