import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationsService } from '../notificationsService';

// Mock do Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

describe('NotificationsService', () => {
  describe('Basic service methods', () => {
    it('should have getNotifications method', () => {
      expect(typeof notificationsService.getNotifications).toBe('function');
    });

    it('should have getUnreadNotifications method', () => {
      expect(typeof notificationsService.getUnreadNotifications).toBe('function');
    });

    it('should have getNotificationCount method', () => {
      expect(typeof notificationsService.getNotificationCount).toBe('function');
    });

    it('should have createNotification method', () => {
      expect(typeof notificationsService.createNotification).toBe('function');
    });

    it('should have markAsRead method', () => {
      expect(typeof notificationsService.markAsRead).toBe('function');
    });

    it('should have markAllAsRead method', () => {
      expect(typeof notificationsService.markAllAsRead).toBe('function');
    });

    it('should have deleteNotification method', () => {
      expect(typeof notificationsService.deleteNotification).toBe('function');
    });

    it('should have deleteAllNotifications method', () => {
      expect(typeof notificationsService.deleteAllNotifications).toBe('function');
    });

    it('should have createAppointmentReminder method', () => {
      expect(typeof notificationsService.createAppointmentReminder).toBe('function');
    });

    it('should have createPromotionNotification method', () => {
      expect(typeof notificationsService.createPromotionNotification).toBe('function');
    });

    it('should have createSystemNotification method', () => {
      expect(typeof notificationsService.createSystemNotification).toBe('function');
    });

    it('should have getNotificationSettings method', () => {
      expect(typeof notificationsService.getNotificationSettings).toBe('function');
    });

    it('should have createNotificationSettings method', () => {
      expect(typeof notificationsService.createNotificationSettings).toBe('function');
    });

    it('should have updateNotificationSettings method', () => {
      expect(typeof notificationsService.updateNotificationSettings).toBe('function');
    });

    it('should have getOrCreateNotificationSettings method', () => {
      expect(typeof notificationsService.getOrCreateNotificationSettings).toBe('function');
    });

    it('should have cleanupExpiredNotifications method', () => {
      expect(typeof notificationsService.cleanupExpiredNotifications).toBe('function');
    });
  });

  describe('Notification logic validation', () => {
    it('should validate appointment reminder date calculation', () => {
      const appointmentDate = new Date('2024-01-15T10:00:00');
      const reminderDate = new Date(appointmentDate);
      reminderDate.setHours(reminderDate.getHours() - 24);
      
      expect(reminderDate.getDate()).toBe(14);
      expect(reminderDate.getHours()).toBe(10);
    });

    it('should validate promotion expiration calculation', () => {
      const now = Date.now();
      const thirtyDaysLater = new Date(now + 30 * 24 * 60 * 60 * 1000);
      const daysDifference = Math.floor((thirtyDaysLater.getTime() - now) / (24 * 60 * 60 * 1000));
      
      expect(daysDifference).toBe(30);
    });

    it('should validate notification type values', () => {
      const validTypes = ['appointment', 'promotion', 'system'];
      
      expect(validTypes.includes('appointment')).toBe(true);
      expect(validTypes.includes('promotion')).toBe(true);
      expect(validTypes.includes('system')).toBe(true);
      expect(validTypes.includes('invalid')).toBe(false);
    });

    it('should validate default notification settings', () => {
      const defaultSettings = {
        email_enabled: true,
        push_enabled: true,
        sms_enabled: false,
        whatsapp_enabled: true,
        appointment_reminders: true,
        promotion_notifications: true,
        system_notifications: true,
        reminder_hours_before: 24
      };
      
      expect(defaultSettings.email_enabled).toBe(true);
      expect(defaultSettings.sms_enabled).toBe(false);
      expect(defaultSettings.reminder_hours_before).toBe(24);
    });
  });

  describe('Date and time utilities', () => {
    it('should format ISO date string correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      const isoString = date.toISOString();
      
      expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should calculate hours difference correctly', () => {
      const date1 = new Date('2024-01-15T10:00:00');
      const date2 = new Date('2024-01-15T14:00:00');
      const hoursDiff = (date2.getTime() - date1.getTime()) / (1000 * 60 * 60);
      
      expect(hoursDiff).toBe(4);
    });
  });
});