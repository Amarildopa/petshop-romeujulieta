import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  ShoppingCart,
  Package,
  Star,
  MessageSquare,
  Settings,
  Trash2,
  MarkAsUnread
  // Filter - não utilizado
} from 'lucide-react'
import { toast } from 'sonner'
import { logger } from '../lib/logger'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'order' | 'product' | 'user' | 'review' | 'system' | 'support'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionUrl?: string
  metadata?: Record<string, unknown>
}

interface AdminNotificationsProps {
  isOpen: boolean
  onClose: () => void
}

const AdminNotifications: React.FC<AdminNotificationsProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // Simular notificações em tempo real
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        category: 'order',
        title: 'Novo Pedido Recebido',
        message: 'Pedido #12345 foi realizado por Maria Silva no valor de R$ 89,90',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high',
        actionUrl: '/admin/orders/12345',
        metadata: { orderId: '12345', customerName: 'Maria Silva', amount: 89.90 }
      },
      {
        id: '2',
        type: 'warning',
        category: 'product',
        title: 'Estoque Baixo',
        message: 'Ração Premium Cães está com apenas 5 unidades em estoque',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
        priority: 'medium',
        actionUrl: '/admin/products',
        metadata: { productId: 'prod-123', productName: 'Ração Premium Cães', stock: 5 }
      },
      {
        id: '3',
        type: 'success',
        category: 'user',
        title: 'Novo Cliente Cadastrado',
        message: 'João Santos se cadastrou na plataforma',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: true,
        priority: 'low',
        metadata: { userId: 'user-456', userName: 'João Santos' }
      },
      {
        id: '4',
        type: 'info',
        category: 'review',
        title: 'Nova Avaliação',
        message: 'Ana Costa avaliou "Brinquedo Interativo" com 5 estrelas',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        read: true,
        priority: 'low',
        actionUrl: '/admin/reviews',
        metadata: { reviewId: 'rev-789', productName: 'Brinquedo Interativo', rating: 5 }
      },
      {
        id: '5',
        type: 'error',
        category: 'system',
        title: 'Erro no Sistema de Pagamento',
        message: 'Falha na comunicação com o gateway de pagamento',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'urgent',
        metadata: { errorCode: 'PAY_001', gateway: 'stripe' }
      },
      {
        id: '6',
        type: 'warning',
        category: 'support',
        title: 'Ticket de Suporte Urgente',
        message: 'Cliente reportou problema com entrega - Ticket #789',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        read: false,
        priority: 'urgent',
        actionUrl: '/admin/support/789',
        metadata: { ticketId: '789', customerName: 'Carlos Lima' }
      }
    ]

    setNotifications(mockNotifications)
    setLoading(false)

    // Simular notificações em tempo real
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% de chance a cada 30 segundos
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['info', 'success', 'warning', 'error'][Math.floor(Math.random() * 4)] as 'info' | 'success' | 'warning' | 'error',
          category: ['order', 'product', 'user', 'review', 'system', 'support'][Math.floor(Math.random() * 6)] as 'order' | 'product' | 'user' | 'review' | 'system' | 'support',
          title: 'Nova Notificação',
          message: 'Esta é uma notificação em tempo real simulada',
          timestamp: new Date().toISOString(),
          read: false,
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high' | 'urgent'
        }
        
        setNotifications(prev => [newNotification, ...prev])
        toast.info('Nova notificação recebida')
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = filter === 'all' || 
                             (filter === 'read' && notification.read) ||
                             (filter === 'unread' && !notification.read)
    
    const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter
    
    return matchesReadFilter && matchesCategory && matchesPriority
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    logger.info('Notification marked as read', { notificationId }, 'ADMIN')
  }

  const markAsUnread = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: false } : n
      )
    )
    logger.info('Notification marked as unread', { notificationId }, 'ADMIN')
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    toast.success('Notificação removida')
    logger.info('Notification deleted', { notificationId }, 'ADMIN')
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('Todas as notificações foram marcadas como lidas')
    logger.info('All notifications marked as read', {}, 'ADMIN')
  }

  const clearAllNotifications = () => {
    if (window.confirm('Tem certeza que deseja limpar todas as notificações?')) {
      setNotifications([])
      toast.success('Todas as notificações foram removidas')
      logger.info('All notifications cleared', {}, 'ADMIN')
    }
  }

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'order') return <ShoppingCart className="h-4 w-4" />
    if (category === 'product') return <Package className="h-4 w-4" />
    if (category === 'user') return <User className="h-4 w-4" />
    if (category === 'review') return <Star className="h-4 w-4" />
    if (category === 'support') return <MessageSquare className="h-4 w-4" />
    if (category === 'system') return <Settings className="h-4 w-4" />
    
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <XCircle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'text-red-600 bg-red-50 border-red-200'
    
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority as keyof typeof colors]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    )
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d atrás`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bell className="h-6 w-6 text-text-color-dark" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-color-dark">Notificações</h2>
                  <p className="text-sm text-text-color">{filteredNotifications.length} notificações</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="text-text-color hover:text-text-color-dark transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Actions */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <div className="flex space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  disabled={unreadCount === 0}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Marcar Todas
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpar Todas
                </button>
              </div>
              
              {/* Filtros */}
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">Todas</option>
                  <option value="unread">Não lidas</option>
                  <option value="read">Lidas</option>
                </select>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">Categoria</option>
                  <option value="order">Pedidos</option>
                  <option value="product">Produtos</option>
                  <option value="user">Usuários</option>
                  <option value="review">Avaliações</option>
                  <option value="support">Suporte</option>
                  <option value="system">Sistema</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">Prioridade</option>
                  <option value="urgent">Urgente</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-text-color">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma notificação encontrada</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border-l-4 ${getNotificationColor(notification.type, notification.priority)} ${
                        notification.read ? 'bg-gray-50' : 'bg-white'
                      } hover:bg-gray-50 transition-colors cursor-pointer`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`p-2 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}>
                            {getNotificationIcon(notification.type, notification.category)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`text-sm font-medium ${notification.read ? 'text-text-color' : 'text-text-color-dark'}`}>
                                {notification.title}
                              </h4>
                              {getPriorityBadge(notification.priority)}
                            </div>
                            
                            <p className={`text-sm ${notification.read ? 'text-text-color' : 'text-text-color-dark'} mb-2`}>
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs text-text-color">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(notification.timestamp)}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (notification.read) {
                                      markAsUnread(notification.id);
                                    } else {
                                      markAsRead(notification.id);
                                    }
                                  }}
                                  className="p-1 text-text-color hover:text-text-color-dark transition-colors"
                                  title={notification.read ? 'Marcar como não lida' : 'Marcar como lida'}
                                >
                                  {notification.read ? <MarkAsUnread className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                  className="p-1 text-text-color hover:text-red-600 transition-colors"
                                  title="Remover notificação"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AdminNotifications