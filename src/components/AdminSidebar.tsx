import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Shield, 
  MessageSquare,
  Bell,
  Activity,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface AdminSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation()

  const menuItems = [
    {
      path: '/admin',
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      description: 'Visão geral do sistema'
    },
    {
      path: '/admin/users',
      label: 'Usuários',
      icon: <Users className="h-5 w-5" />,
      description: 'Gerenciar usuários'
    },
    {
      path: '/admin/reports',
      label: 'Relatórios',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Analytics e relatórios'
    },
    {
      path: '/admin/tickets',
      label: 'Suporte',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'Tickets de suporte'
    },
    {
      path: '/admin/notifications',
      label: 'Notificações',
      icon: <Bell className="h-5 w-5" />,
      description: 'Notificações do sistema'
    },
    {
      path: '/admin/logs',
      label: 'Logs',
      icon: <Activity className="h-5 w-5" />,
      description: 'Logs do sistema'
    },
    {
      path: '/admin/settings',
      label: 'Configurações',
      icon: <Settings className="h-5 w-5" />,
      description: 'Configurações gerais'
    },
    {
      path: '/admin/security',
      label: 'Segurança',
      icon: <Shield className="h-5 w-5" />,
      description: 'Configurações de segurança'
    }
  ]

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="bg-white border-r border-accent/20 h-full flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-accent/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-text-color-dark">Admin</span>
            </motion.div>
          )}
          
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-text-color" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-text-color" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors group ${
              isActive(item.path)
                ? 'bg-primary text-white'
                : 'text-text-color hover:bg-gray-100'
            }`}
          >
            <div className="flex-shrink-0">
              {item.icon}
            </div>
            
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <div className="text-sm font-medium truncate">
                  {item.label}
                </div>
                <div className={`text-xs truncate ${
                  isActive(item.path) ? 'text-primary/80' : 'text-text-color/60'
                }`}>
                  {item.description}
                </div>
              </motion.div>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-t border-accent/20"
        >
          <div className="text-xs text-text-color/60 text-center">
            Romeu e Julieta Pet&Spa
            <br />
            Sistema Administrativo v1.0
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default AdminSidebar
