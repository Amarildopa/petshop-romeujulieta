import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Check, X, Info } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  stockAlerts: boolean;
  newsletter: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const NotificationSettings: React.FC = () => {
  const {
    permission,
    isSupported,
    isServiceWorkerReady,
    requestPermission,
    sendNotification
  } = useNotifications();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orderUpdates: true,
    promotions: true,
    stockAlerts: true,
    newsletter: false,
    soundEnabled: true,
    vibrationEnabled: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showTestResult, setShowTestResult] = useState<'success' | 'error' | null>(null);

  // Carregar preferências salvas
  useEffect(() => {
    const savedPreferences = localStorage.getItem('notificationPreferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Erro ao carregar preferências:', error);
      }
    }
  }, []);

  // Salvar preferências
  const savePreferences = (newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
  };

  // Alternar preferência
  const togglePreference = (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    savePreferences(newPreferences);
  };

  // Solicitar permissão
  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        setShowTestResult('success');
        setTimeout(() => setShowTestResult(null), 3000);
      } else {
        setShowTestResult('error');
        setTimeout(() => setShowTestResult(null), 3000);
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      setShowTestResult('error');
      setTimeout(() => setShowTestResult(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Testar notificação
  const testNotification = async () => {
    if (!permission.granted) {
      await handleRequestPermission();
      return;
    }

    try {
      await sendNotification('Teste de Notificação', {
        body: 'Esta é uma notificação de teste do PetShop Romeo & Julieta!',
        icon: '/icon-192x192.png',
        tag: 'test',
        requireInteraction: false
      });
      setShowTestResult('success');
      setTimeout(() => setShowTestResult(null), 3000);
    } catch (error) {
      console.error('Erro ao testar notificação:', error);
      setShowTestResult('error');
      setTimeout(() => setShowTestResult(null), 3000);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Info className="h-5 w-5 text-yellow-600" />
          <p className="text-yellow-800">
            Seu navegador não suporta notificações push.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          Configurações de Notificações
        </h2>
      </div>

      {/* Status da Permissão */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {permission.granted ? (
              <Bell className="h-5 w-5 text-green-600" />
            ) : (
              <BellOff className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p className="font-medium text-gray-900">
                Status das Notificações
              </p>
              <p className="text-sm text-gray-600">
                {permission.granted
                  ? 'Notificações ativadas'
                  : permission.denied
                  ? 'Notificações bloqueadas'
                  : 'Permissão não solicitada'
                }
              </p>
            </div>
          </div>
          
          {!permission.granted && (
            <button
              onClick={handleRequestPermission}
              disabled={isLoading || permission.denied}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Solicitando...' : 'Ativar'}
            </button>
          )}
        </div>

        {/* Service Worker Status */}
        <div className="mt-2 flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            isServiceWorkerReady ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <span className="text-gray-600">
            Service Worker: {isServiceWorkerReady ? 'Ativo' : 'Carregando...'}
          </span>
        </div>
      </div>

      {/* Preferências */}
      <div className="space-y-4 mb-6">
        <h3 className="font-medium text-gray-900">Tipos de Notificação</h3>
        
        {[
          {
            key: 'orderUpdates' as keyof NotificationPreferences,
            label: 'Atualizações de Pedidos',
            description: 'Confirmação, envio e entrega de pedidos'
          },
          {
            key: 'promotions' as keyof NotificationPreferences,
            label: 'Promoções e Ofertas',
            description: 'Descontos especiais e ofertas limitadas'
          },
          {
            key: 'stockAlerts' as keyof NotificationPreferences,
            label: 'Alertas de Estoque',
            description: 'Quando produtos em falta voltarem ao estoque'
          },
          {
            key: 'newsletter' as keyof NotificationPreferences,
            label: 'Newsletter',
            description: 'Novidades e dicas sobre pets'
          }
        ].map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{label}</p>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <button
              onClick={() => togglePreference(key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences[key] ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences[key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Configurações Avançadas */}
      <div className="space-y-4 mb-6">
        <h3 className="font-medium text-gray-900">Configurações Avançadas</h3>
        
        {[
          {
            key: 'soundEnabled' as keyof NotificationPreferences,
            label: 'Som das Notificações',
            description: 'Reproduzir som ao receber notificações'
          },
          {
            key: 'vibrationEnabled' as keyof NotificationPreferences,
            label: 'Vibração',
            description: 'Vibrar dispositivo ao receber notificações (mobile)'
          }
        ].map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{label}</p>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <button
              onClick={() => togglePreference(key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences[key] ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences[key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Teste de Notificação */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Testar Notificações</p>
            <p className="text-sm text-gray-600">
              Envie uma notificação de teste para verificar se está funcionando
            </p>
          </div>
          <button
            onClick={testNotification}
            disabled={!isServiceWorkerReady}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Testar
          </button>
        </div>

        {/* Resultado do Teste */}
        {showTestResult && (
          <div className={`mt-3 p-3 rounded-lg flex items-center space-x-2 ${
            showTestResult === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {showTestResult === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span className="text-sm">
              {showTestResult === 'success'
                ? 'Notificação enviada com sucesso!'
                : 'Erro ao enviar notificação. Verifique as permissões.'
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;