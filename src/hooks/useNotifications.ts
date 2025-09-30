import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export interface UseNotificationsReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  isServiceWorkerReady: boolean;
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  sendOrderConfirmation: (orderId: string, orderTotal: number) => Promise<void>;
  sendOrderShipped: (orderId: string, trackingCode?: string) => Promise<void>;
  sendOrderDelivered: (orderId: string) => Promise<void>;
  sendPromotion: (title: string, description: string, discount?: number) => Promise<void>;
  sendStockAlert: (productId: string, productName: string) => Promise<void>;
  clearNotifications: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);

  // Verificar se notificações são suportadas
  const isSupported = 'Notification' in window && 'serviceWorker' in navigator;

  // Atualizar estado da permissão
  const updatePermissionState = useCallback(() => {
    if (!isSupported) return;

    const currentPermission = Notification.permission;
    setPermission({
      granted: currentPermission === 'granted',
      denied: currentPermission === 'denied',
      default: currentPermission === 'default'
    });
  }, [isSupported]);

  // Registrar Service Worker
  const registerServiceWorker = useCallback(async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', registration);
      
      // Aguardar o SW estar pronto
      await navigator.serviceWorker.ready;
      setIsServiceWorkerReady(true);
      
      // Escutar atualizações do SW
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Novo SW disponível
              console.log('Nova versão do Service Worker disponível');
            }
          });
        }
      });
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }, [isSupported]);

  // Solicitar permissão para notificações
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Notificações não são suportadas neste navegador');
      return false;
    }

    try {
      const result = await notificationService.requestPermission();
      updatePermissionState();
      return result;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  }, [isSupported, updatePermissionState]);

  // Enviar notificação genérica
  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!permission.granted) {
      console.warn('Permissão para notificações não concedida');
      return;
    }

    try {
      await notificationService.sendBrowserNotification(title, options);
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }, [permission.granted]);

  // Notificações específicas do e-commerce
  const sendOrderConfirmation = useCallback(async (orderId: string, orderTotal: number) => {
    await notificationService.sendOrderConfirmation(orderId, orderTotal);
  }, []);

  const sendOrderShipped = useCallback(async (orderId: string, trackingCode?: string) => {
    await notificationService.sendOrderShipped(orderId, trackingCode);
  }, []);

  const sendOrderDelivered = useCallback(async (orderId: string) => {
    await notificationService.sendOrderDelivered(orderId);
  }, []);

  const sendPromotion = useCallback(async (title: string, description: string, discount?: number) => {
    await notificationService.sendPromotion(title, description, discount);
  }, []);

  const sendStockAlert = useCallback(async (productId: string, productName: string) => {
    await notificationService.sendStockAvailable(productId, productName);
  }, []);

  // Limpar todas as notificações
  const clearNotifications = useCallback(() => {
    notificationService.clearAllNotifications();
  }, []);

  // Inicialização
  useEffect(() => {
    if (isSupported) {
      updatePermissionState();
      registerServiceWorker();
      
      // Inicializar o serviço de notificações
      notificationService.init();
    }
  }, [isSupported, updatePermissionState, registerServiceWorker]);

  // Escutar mudanças na permissão
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePermissionState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSupported, updatePermissionState]);

  return {
    permission,
    isSupported,
    isServiceWorkerReady,
    requestPermission,
    sendNotification,
    sendOrderConfirmation,
    sendOrderShipped,
    sendOrderDelivered,
    sendPromotion,
    sendStockAlert,
    clearNotifications
  };
};

export default useNot