/* eslint-disable */
// Service Worker para notificações push
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// Escutar notificações push
self.addEventListener('push', (event) => {
  console.log('Push recebido:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Nova notificação', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'Você tem uma nova notificação',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: data.vibrate || [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'PetShop Romeo & Julieta', options)
  );
});

// Escutar cliques nas notificações
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event);
  
  event.notification.close();

  // Ação baseada no tipo de notificação
  const data = event.notification.data;
  let url = '/';

  if (data.type) {
    switch (data.type) {
      case 'order_confirmed':
      case 'order_shipped':
      case 'order_delivered':
        url = `/orders?id=${data.orderId || ''}`;
        break;
      case 'promotion':
        url = '/store';
        break;
      case 'stock_available':
        url = `/product/${data.productId || ''}`;
        break;
      default:
        url = '/';
    }
  }

  // Abrir ou focar na janela do app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Verificar se já existe uma janela aberta
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        
        // Se não há janela aberta, abrir uma nova
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Escutar fechamento de notificações
self.addEventListener('notificationclose', (event) => {
  console.log('Notificação fechada:', event);
  
  // Opcional: registrar analytics ou outras ações
});

// Sincronização em background (para notificações offline)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event);
  
  if (event.tag === 'background-notifications') {
    event.waitUntil(checkForNewNotifications());
  }
});

// Função para verificar novas notificações
async function checkForNewNotifications() {
  try {
    // Aqui você pode fazer uma requisição para verificar novas notificações
    // Por exemplo, verificar pedidos atualizados, promoções, etc.
    console.log('Verificando novas notificações...');
  } catch (error) {
    console.error('Erro ao verificar notificações:', error);
  }
}

// Escutar mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('Mensagem recebida:', event.data);
});