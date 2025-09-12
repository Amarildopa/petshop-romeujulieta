import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Notification = Database['public']['Tables']['notifications_pet']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications_pet']['Insert'];
type NotificationUpdate = Database['public']['Tables']['notifications_pet']['Update'];

type NotificationSettings = Database['public']['Tables']['notification_settings_pet']['Row'];
type NotificationSettingsInsert = Database['public']['Tables']['notification_settings_pet']['Insert'];
type NotificationSettingsUpdate = Database['public']['Tables']['notification_settings_pet']['Update'];

export class NotificationsService {
  async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications_pet')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar notificações: ${error.message}`);
    }

    return data || [];
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications_pet')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar notificações não lidas: ${error.message}`);
    }

    return data || [];
  }

  async getNotificationCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications_pet')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Erro ao contar notificações: ${error.message}`);
    }

    return count || 0;
  }

  async createNotification(notification: NotificationInsert): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications_pet')
      .insert(notification)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar notificação: ${error.message}`);
    }

    return data;
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications_pet')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao marcar notificação como lida: ${error.message}`);
    }

    return data;
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications_pet')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Erro ao marcar todas as notificações como lidas: ${error.message}`);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications_pet')
      .delete()
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Erro ao deletar notificação: ${error.message}`);
    }
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications_pet')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao deletar todas as notificações: ${error.message}`);
    }
  }

  async createAppointmentReminder(
    userId: string, 
    appointmentId: string, 
    appointmentDate: string, 
    appointmentTime: string,
    petName: string,
    serviceName: string
  ): Promise<Notification> {
    const reminderDate = new Date(appointmentDate);
    reminderDate.setHours(reminderDate.getHours() - 24); // 24 horas antes

    return this.createNotification({
      user_id: userId,
      type: 'appointment',
      title: 'Lembrete de Agendamento',
      message: `Seu pet ${petName} tem um agendamento de ${serviceName} amanhã às ${appointmentTime}`,
      data: {
        appointment_id: appointmentId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        pet_name: petName,
        service_name: serviceName
      },
      expires_at: new Date(appointmentDate).toISOString()
    });
  }

  async createPromotionNotification(
    userId: string,
    title: string,
    message: string,
    promotionData: any
  ): Promise<Notification> {
    return this.createNotification({
      user_id: userId,
      type: 'promotion',
      title,
      message,
      data: promotionData,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
    });
  }

  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    systemData: any
  ): Promise<Notification> {
    return this.createNotification({
      user_id: userId,
      type: 'system',
      title,
      message,
      data: systemData
    });
  }

  // =============================================
  // NOTIFICATION SETTINGS
  // =============================================

  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    const { data, error } = await supabase
      .from('notification_settings_pet')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar configurações de notificação: ${error.message}`);
    }

    return data;
  }

  async createNotificationSettings(settings: NotificationSettingsInsert): Promise<NotificationSettings> {
    const { data, error } = await supabase
      .from('notification_settings_pet')
      .insert(settings)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar configurações de notificação: ${error.message}`);
    }

    return data;
  }

  async updateNotificationSettings(userId: string, settings: NotificationSettingsUpdate): Promise<NotificationSettings> {
    const { data, error } = await supabase
      .from('notification_settings_pet')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar configurações de notificação: ${error.message}`);
    }

    return data;
  }

  async getOrCreateNotificationSettings(userId: string): Promise<NotificationSettings> {
    let settings = await this.getNotificationSettings(userId);
    
    if (!settings) {
      settings = await this.createNotificationSettings({
        user_id: userId,
        email_enabled: true,
        push_enabled: true,
        sms_enabled: false,
        whatsapp_enabled: true,
        appointment_reminders: true,
        promotion_notifications: true,
        system_notifications: true,
        reminder_hours_before: 24
      });
    }

    return settings;
  }

  async cleanupExpiredNotifications(): Promise<void> {
    const { error } = await supabase
      .from('notifications_pet')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      throw new Error(`Erro ao limpar notificações expiradas: ${error.message}`);
    }
  }
}

export const notificationsService = new NotificationsService();
export type { Notification, NotificationInsert, NotificationUpdate, NotificationSettings, NotificationSettingsInsert, NotificationSettingsUpdate };
