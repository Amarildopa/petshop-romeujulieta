import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminSidebar from './AdminSidebar'
import AdminRouteGuard from './AdminRouteGuard'
import { Bell, User, LogOut, Menu } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAdminAuth } from '../hooks/useAdminAuth'

const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { adminUser } = useAdminAuth()

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-surface flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar 
            isCollapsed={sidebarCollapsed} 
            onToggle={toggleSidebar} 
          />
        </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: mobileMenuOpen ? 0 : -280 }}
        className="fixed left-0 top-0 h-full w-80 bg-white z-50 lg:hidden"
      >
        <AdminSidebar 
          isCollapsed={false} 
          onToggle={() => setMobileMenuOpen(false)} 
        />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-accent/20 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Abrir menu mobile"
            >
              <Menu className="h-5 w-5 text-text-color" />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Alternar sidebar"
            >
              <Menu className="h-5 w-5 text-text-color" />
            </button>

            {/* Page Title */}
            <div className="flex-1 lg:ml-4">
              <h1 className="text-xl font-semibold text-text-color-dark">
                Painel Administrativo
              </h1>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5 text-text-color" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-text-color-dark">
                    {adminUser?.profiles_pet?.full_name || user?.email}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-accent/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-text-color border-b border-accent/20">
                      <div className="font-medium text-text-color-dark">
                        {adminUser?.profiles_pet?.full_name || user?.email}
                      </div>
                      <div className="text-xs text-text-color/60">
                        {adminUser?.role === 'super_admin' ? 'Super Administrador' :
                         adminUser?.role === 'admin' ? 'Administrador' :
                         adminUser?.role === 'manager' ? 'Gerente' : 'Usuário'}
                      </div>
                    </div>
                    <button
                      onClick={signOut}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
    </AdminRouteGuard>
  )
}

export default AdminLayout
