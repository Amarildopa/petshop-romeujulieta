import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

// Tipos para o serviço administrativo
export interface AdminUser {
  id: string
  user_id: string
  role: 'admin' | 'super_admin' | 'manager'
  permissions: Record<string, boolean>
  is_active: boolean
  created_at: string
  updated_at: string
  profiles_pet?: {
    full_name: string
    email: string
    phone: string
  }
}

export interface AdminLog {
  id: string
  admin_id: string | null
  action: string
  resource_type: string
  resource_id: string | null
  details: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
  admin_users_pet?: {
    profiles_pet: {
      full_name: string
      email: string
    }
  }
}

export interface SystemSetting {
  id: string
  key: string
  value: unknown
  description: string | null
  category: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface AdminReport {
  id: string
  name: string
  type: 'revenue' | 'users' | 'appointments' | 'products' | 'orders'
  parameters: Record<string, unknown>
  data: Record<string, unknown>
  generated_by: string | null
  generated_at: string
  expires_at: string | null
}

export interface AdminNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  is_read: boolean
  admin_id: string
  action_url: string | null
  metadata: Record<string, unknown>
  created_at: string
  read_at: string | null
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'billing' | 'general' | 'complaint'
  assigned_to: string | null
  resolution: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  profiles_pet?: {
    full_name: string
    email: string
    phone: string
  }
  admin_users_pet?: {
    profiles_pet: {
      full_name: string
      email: string
    }
  }
}

export interface SupportMessage {
  id: string
  ticket_id: string
  sender_id: string
  sender_type: 'user' | 'admin'
  message: string
  attachments: unknown[]
  is_internal: boolean
  created_at: string
  profiles_pet?: {
    full_name: string
    email: string
  }
}

// Serviço principal de administração
export const adminService = {
  // =============================================
  // GESTÃO DE USUÁRIOS ADMINISTRATIVOS
  // =============================================

  async getAdminUsers(): Promise<AdminUser[]> {
    try {
      // CORREÇÃO TEMPORÁRIA: Contornar problema de recursão RLS
      // Buscar apenas usuários da tabela profiles_pet por enquanto
      const { data: profiles, error } = await supabase
        .from('profiles_pet')
        .select('id, full_name, email, phone')
        .limit(10)

      if (error) throw error

      // TEMPORÁRIO: Converter perfis em usuários admin fictícios
      const adminUsers: AdminUser[] = (profiles || []).map(profile => ({
        id: `temp-admin-${profile.id}`,
        user_id: profile.id,
        role: 'admin' as const,
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
      }))

      logger.info('Admin users fetched successfully (temporary fix)', { count: adminUsers.length }, 'ADMIN')
      return adminUsers
    } catch (error) {
      logger.error('Error fetching admin users', error as Error, {}, 'ADMIN')
      throw error
    }
  },

  async createAdminUser(userId: string, role: string, permissions: Record<string, boolean> = {}): Promise<AdminUser> {
    try {
      const { data, error } = await supabase
        .from('admin_users_pet')
        .insert({
          user_id: userId,
          role,
          permissions
        })
        .select(`
          *,
          profiles_pet (
            full_name,
            email,
            phone
          )
        `)
        .single()

      if (error) throw error

      // Log da ação
      await this.logAdminAction('create_admin_user', 'admin_user', data.id, {
        user_id: userId,
        role,
        permissions
      })

      logger.info('Admin user created successfully', { adminId: data.id, userId, role }, 'ADMIN')
      return data
    } catch (error) {
      logger.error('Error creating admin user', error as Error, { userId, role }, 'ADMIN')
      throw error
    }
  },

  async updateAdminUser(adminId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    try {
      const { data, error } = await supabase
        .from('admin_users_pet')
        .update(updates)
        .eq('id', adminId)
        .select(`
          *,
          profiles_pet (
            full_name,
            email,
            phone
          )
        `)
        .single()

      if (error) throw error

      // Log da ação
      await this.logAdminAction('update_admin_user', 'admin_user', adminId, updates)

      logger.info('Admin user updated successfully', { adminId, updates }, 'ADMIN')
      return data
    } catch (error) {
      logger.error('Error updating admin user', error as Error, { adminId, updates }, 'ADMIN')
      throw error
    }
  },

  async deleteAdminUser(adminId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_users_pet')
        .delete()
        .eq('id', adminId)

      if (error) throw error

      // Log da ação
      await this.logAdminAction('delete_admin_user', 'admin_user', adminId, {})

      logger.info('Admin user deleted successfully', { adminId }, 'ADMIN')
    } catch (error) {
      logger.error('Error deleting admin user', error as Error, { adminId }, 'ADMIN')
      throw error
    }
  },

  // =============================================
  // LOGS DE ADMINISTRAÇÃO
  // =============================================

  async getAdminLogs(limit: number = 100, offset: number = 0): Promise<AdminLog[]> {
    try {
      const { data, error } = await supabase
        .from('admin_logs_pet')
        .select(`
          *,
          admin_users_pet (
            profiles_pet (
              full_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data || []
    } catch (error) {
      logger.error('Error fetching admin logs', error as Error, {}, 'ADMIN')
      throw error
    }
  },

  async logAdminAction(
    action: string,
    resourceType: string,
    resourceId: string | null,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      // Obter ID do admin atual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: adminUser } = await supabase
        .from('admin_users_pet')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!adminUser) return

      const { error } = await supabase
        .from('admin_logs_pet')
        .insert({
          admin_id: adminUser.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          ip_address: null, // Será preenchido pelo backend
          user_agent: navigator.userAgent
        })

      if (error) throw error

      logger.debug('Admin action logged', { action, resourceType, resourceId }, 'ADMIN')
    } catch (error) {
      logger.error('Error logging admin action', error as Error, { action, resourceType, resourceId }, 'ADMIN')
    }
  },

  // =============================================
  // CONFIGURAÇÕES DO SISTEMA
  // =============================================

  async getSystemSettings(): Promise<SystemSetting[]> {
    try {
      const { data, error } = await supabase
        .from('system_settings_pet')
        .select('*')
        .order('category', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      logger.error('Error fetching system settings', error as Error, {}, 'ADMIN')
      throw error
    }
  },

  async updateSystemSetting(key: string, value: unknown): Promise<SystemSetting> {
    try {
      const { data, error } = await supabase
        .from('system_settings_pet')
        .update({ value })
        .eq('key', key)
        .select('*')
        .single()

      if (error) throw error

      // Log da ação
      await this.logAdminAction('update_system_setting', 'system_setting', key, { value })

      logger.info('System setting updated', { key, value }, 'ADMIN')
      return data
    } catch (error) {
      logger.error('Error updating system setting', error as Error, { key, value }, 'ADMIN')
      throw error
    }
  },

  // =============================================
  // RELATÓRIOS
  // =============================================

  async generateReport(
    name: string,
    type: string,
    parameters: Record<string, unknown> = {}
  ): Promise<AdminReport> {
    try {
      // Obter ID do admin atual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: adminUser } = await supabase
        .from('admin_users_pet')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!adminUser) throw new Error('User is not an admin')

      // Gerar dados do relatório baseado no tipo
      let reportData: Record<string, unknown> = {}

      switch (type) {
        case 'revenue':
          reportData = await this.generateRevenueReport(parameters)
          break
        case 'users':
          reportData = await this.generateUsersReport(parameters)
          break
        case 'appointments':
          reportData = await this.generateAppointmentsReport(parameters)
          break
        case 'products':
          reportData = await this.generateProductsReport(parameters)
          break
        case 'orders':
          reportData = await this.generateOrdersReport(parameters)
          break
        default:
          throw new Error('Invalid report type')
      }

      const { data, error } = await supabase
        .from('admin_reports_pet')
        .insert({
          name,
          type,
          parameters,
          data: reportData,
          generated_by: adminUser.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
        })
        .select('*')
        .single()

      if (error) throw error

      // Log da ação
      await this.logAdminAction('generate_report', 'report', data.id, { name, type, parameters })

      logger.info('Report generated successfully', { reportId: data.id, name, type }, 'ADMIN')
      return data
    } catch (error) {
      logger.error('Error generating report', error as Error, { name, type, parameters }, 'ADMIN')
      throw error
    }
  },

  async getReports(): Promise<AdminReport[]> {
    try {
      const { data, error } = await supabase
        .from('admin_reports_pet')
        .select('*')
        .order('generated_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      logger.error('Error fetching reports', error as Error, {}, 'ADMIN')
      throw error
    }
  },

  // =============================================
  // NOTIFICAÇÕES ADMINISTRATIVAS
  // =============================================

  async getAdminNotifications(): Promise<AdminNotification[]> {
    try {
      // Obter ID do admin atual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data: adminUser } = await supabase
        .from('admin_users_pet')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!adminUser) return []

      const { data, error } = await supabase
        .from('admin_notifications_pet')
        .select('*')
        .eq('admin_id', adminUser.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      logger.error('Error fetching admin notifications', error as Error, {}, 'ADMIN')
      throw error
    }
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_notifications_pet')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (error) throw error

      logger.info('Notification marked as read', { notificationId }, 'ADMIN')
    } catch (error) {
      logger.error('Error marking notification as read', error as Error, { notificationId }, 'ADMIN')
      throw error
    }
  },

  // =============================================
  // TICKETS DE SUPORTE
  // =============================================

  async getSupportTickets(limit: number = 50, offset: number = 0): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets_pet')
        .select(`
          *,
          profiles_pet (
            full_name,
            email,
            phone
          ),
          admin_users_pet (
            profiles_pet (
              full_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data || []
    } catch (error) {
      logger.error('Error fetching support tickets', error as Error, {}, 'ADMIN')
      throw error
    }
  },

  async updateSupportTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket> {
    try {
      const { data, error } = await supabase
        .from('support_tickets_pet')
        .update(updates)
        .eq('id', ticketId)
        .select(`
          *,
          profiles_pet (
            full_name,
            email,
            phone
          ),
          admin_users_pet (
            profiles_pet (
              full_name,
              email
            )
          )
        `)
        .single()

      if (error) throw error

      // Log da ação
      await this.logAdminAction('update_support_ticket', 'support_ticket', ticketId, updates)

      logger.info('Support ticket updated', { ticketId, updates }, 'ADMIN')
      return data
    } catch (error) {
      logger.error('Error updating support ticket', error as Error, { ticketId, updates }, 'ADMIN')
      throw error
    }
  },

  // =============================================
  // MÉTODOS PRIVADOS PARA GERAÇÃO DE RELATÓRIOS
  // =============================================

  async generateRevenueReport(parameters: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { startDate, endDate } = parameters
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const end = endDate || new Date().toISOString()

    // Relatório de receita
    const { data: orders } = await supabase
      .from('orders_pet')
      .select('total_amount, created_at, status')
      .gte('created_at', start)
      .lte('created_at', end)

    const { data: subscriptions } = await supabase
      .from('subscriptions_pet')
      .select('monthly_price, created_at, status')
      .gte('created_at', start)
      .lte('created_at', end)

    const totalRevenue = (orders || []).reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const subscriptionRevenue = (subscriptions || []).reduce((sum, sub) => sum + (sub.monthly_price || 0), 0)

    return {
      period: { start, end },
      totalRevenue,
      subscriptionRevenue,
      orderCount: orders?.length || 0,
      subscriptionCount: subscriptions?.length || 0,
      averageOrderValue: orders?.length ? totalRevenue / orders.length : 0
    }
  },

  async generateUsersReport(parameters: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { startDate, endDate } = parameters
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const end = endDate || new Date().toISOString()

    const { data: users } = await supabase
      .from('profiles_pet')
      .select('created_at')
      .gte('created_at', start)
      .lte('created_at', end)

    const { data: totalUsers } = await supabase
      .from('profiles_pet')
      .select('id', { count: 'exact' })

    return {
      period: { start, end },
      newUsers: users?.length || 0,
      totalUsers: totalUsers?.length || 0,
      growthRate: totalUsers?.length ? ((users?.length || 0) / totalUsers.length) * 100 : 0
    }
  },

  async generateAppointmentsReport(parameters: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { startDate, endDate } = parameters
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const end = endDate || new Date().toISOString()

    const { data: appointments } = await supabase
      .from('appointments_pet')
      .select('status, total_price, created_at')
      .gte('created_at', start)
      .lte('created_at', end)

    const statusCounts = (appointments || []).reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalRevenue = (appointments || []).reduce((sum, apt) => sum + (apt.total_price || 0), 0)

    return {
      period: { start, end },
      totalAppointments: appointments?.length || 0,
      statusCounts,
      totalRevenue,
      averageAppointmentValue: appointments?.length ? totalRevenue / appointments.length : 0
    }
  },

  async generateProductsReport(): Promise<Record<string, unknown>> {
    const { data: products } = await supabase
      .from('products_pet')
      .select('name, price, stock, is_active')

    const activeProducts = (products || []).filter(p => p.is_active)
    const lowStockProducts = (products || []).filter(p => (p.stock || 0) < 10)
    const totalValue = (products || []).reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0)

    return {
      totalProducts: products?.length || 0,
      activeProducts: activeProducts.length,
      lowStockProducts: lowStockProducts.length,
      totalInventoryValue: totalValue,
      averagePrice: products?.length ? (products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length) : 0
    }
  },

  async generateOrdersReport(parameters: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { startDate, endDate } = parameters
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const end = endDate || new Date().toISOString()

    const { data: orders } = await supabase
      .from('orders_pet')
      .select('status, total_amount, created_at')
      .gte('created_at', start)
      .lte('created_at', end)

    const statusCounts = (orders || []).reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalRevenue = (orders || []).reduce((sum, order) => sum + (order.total_amount || 0), 0)

    return {
      period: { start, end },
      totalOrders: orders?.length || 0,
      statusCounts,
      totalRevenue,
      averageOrderValue: orders?.length ? totalRevenue / orders.length : 0
    }
  }
}

export default adminService
