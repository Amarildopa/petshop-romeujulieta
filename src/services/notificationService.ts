export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  icon?: string;
  image?: string;
  url?: string;
  data?: Record<string, unknown>;
  timestamp: string;
  read: boolean;
  userId?: string;
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

class NotificationService {
  private storageKey = 'petshop_notifications';
  private maxNotifications = 50;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initializeServiceWorker();
  }

  // Inicializar Service Worker
  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.serviceWorkerRegistration = registration;
        console.log('Service Worker registrado com sucesso');
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
      }
    }
  }

  // Verificar suporte a notificações
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Obter status da permissão
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return { granted: false, denied: true, default: false };
    }

    const permission = Notification.permission;
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    };
  }

  // Solicitar permissão
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Notificações não são suportadas neste navegador');
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      throw new Error('Permissão para notificações foi negada');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Enviar notificação local
  async sendNotification(data: Omit<NotificationData, 'id' | 'timestamp' | 'read'>): Promise<string> {
    const notification: NotificationData = {
      ...data,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Salvar no localStorage
    this.saveNotification(notification);

    // Enviar notificação do navegador se permitido
    if (this.getPermissionStatus().granted) {
      await this.showBrowserNotification(notification);
    }

    // Disparar evento customizado
    window.dispatchEvent(new CustomEvent('newNotification', {
      detail: notification
    }));

    return notification.id;
  }

  // Mostrar notificação do navegador
  private async showBrowserNotification(data: NotificationData) {
    try {
      const options: NotificationOptions = {
        body: data.message,
        icon: data.icon || '/favicon.ico',
        image: data.image,
        badge: '/favicon.ico',
        tag: data.id,
        data: {
          ...data.data,
          url: data.url,
          notificationId: data.id
        },
        actions: [
          {
            action: 'view',
            title: 'Ver'
          },
          {
            action: 'dismiss',
            title: 'Dispensar'
          }
        ],
        requireInteraction: data.type === 'error' || data.type === 'warning'
      };

      if (this.serviceWorkerRegistration) {
        await this.serviceWorkerRegistration.showNotification(data.title, options);
      } else {
        new Notification(data.title, options);
      }
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
    }
  }

  // Salvar notificação no localStorage
  private saveNotification(notification: NotificationData) {
    try {
      const notifications = this.getStoredNotifications();
      notifications.unshift(notification);
      
      // Manter apenas as últimas notificações
      const trimmed = notifications.slice(0, this.maxNotifications);
      
      localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Erro ao salvar notificação:', error);
    }
  }

  // Obter notificações armazenadas
  private getStoredNotifications(): NotificationData[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  }

  // Buscar todas as notificações
  getNotifications(userId?: string): NotificationData[] {
    const notifications = this.getStoredNotifications();
    
    if (userId) {
      return notifications.filter(n => !n.userId || n.userId === userId);
    }
    
    return notifications;
  }

  // Buscar notificações não lidas
  getUnreadNotifications(userId?: string): NotificationData[] {
    return this.getNotifications(userId).filter(n => !n.read);
  }

  // Contar notificações não lidas
  getUnreadCount(userId?: string): number {
    return this.getUnreadNotifications(userId).length;
  }

  // Marcar notificação como lida
  markAsRead(notificationId: string): boolean {
    try {
      const notifications = this.getStoredNotifications();
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification) {
        notification.read = true;
        localStorage.setItem(this.storageKey, JSON.stringify(notifications));
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('notificationRead', {
          detail: notification
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  }

  // Marcar todas como lidas
  markAllAsRead(userId?: string): boolean {
    try {
      const notifications = this.getStoredNotifications();
      
      notifications.forEach(notification => {
        if (!userId || !notification.userId || notification.userId === userId) {
          notification.read = true;
        }
      });
      
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
      
      // Disparar evento
      window.dispatchEvent(new CustomEvent('allNotificationsRead'));
      
      return true;
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      return false;
    }
  }

  // Deletar notificação
  deleteNotification(notificationId: string): boolean {
    try {
      const notifications = this.getStoredNotifications();
      const filtered = notifications.filter(n => n.id !== notificationId);
      
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      
      // Disparar evento
      window.dispatchEvent(new CustomEvent('notificationDeleted', {
        detail: { notificationId }
      }));
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      return false;
    }
  }

  // Limpar todas as notificações
  clearAllNotifications(userId?: string): boolean {
    try {
      if (userId) {
        const notifications = this.getStoredNotifications();
        const filtered = notifications.filter(n => n.userId && n.userId !== userId);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      } else {
        localStorage.removeItem(this.storageKey);
      }
      
      // Disparar evento
      window.dispatchEvent(new CustomEvent('allNotificationsCleared'));
      
      return true;
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
      return false;
    }
  }

  // Notificações predefinidas para e-commerce
  async notifyOrderConfirmed(orderId: string, total: number) {
    return this.sendNotification({
      title: 'Pedido Confirmado! 🎉',
      message: `Seu pedido #${orderId} no valor de R$ ${total.toFixed(2)} foi confirmado!`,
      type: 'success',
      icon: '/icons/order-success.png',
      url: `/orders/${orderId}`
    });
  }

  async notifyOrderShipped(orderId: string, trackingCode?: string) {
    return this.sendNotification({
      title: 'Pedido Enviado! 📦',
      message: `Seu pedido #${orderId} foi enviado${trackingCode ? ` (Código: ${trackingCode})` : ''}`,
      type: 'info',
      icon: '/icons/shipping.png',
      url: `/orders/${orderId}`
    });
  }

  async notifyOrderDelivered(orderId: string) {
    return this.sendNotification({
      title: 'Pedido Entregue! ✅',
      message: `Seu pedido #${orderId} foi entregue com sucesso!`,
      type: 'success',
      icon: '/icons/delivery.png',
      url: `/orders/${orderId}`
    });
  }

  async notifyPromotion(title: string, message: string, promoUrl?: string) {
    return this.sendNotification({
      title,
      message,
      type: 'promotion',
      icon: '/icons/promotion.png',
      url: promoUrl || '/store'
    });
  }

  async notifyLowStock(productName: string, productId: string) {
    return this.sendNotification({
      title: 'Produto em Falta! ⚠️',
      message: `O produto "${productName}" está com estoque baixo. Garante o seu!`,
      type: 'warning',
      icon: '/icons/low-stock.png',
      url: `/products/${productId}`
    });
  }

  async notifyBackInStock(productName: string, productId: string) {
    return this.sendNotification({
      title: 'Produto Disponível! 🎉',
      message: `O produto "${productName}" está disponível novamente!`,
      type: 'info',
      icon: '/icons/back-in-stock.png',
      url: `/products/${productId}`
    });
  }
}

export default new NotificationService();