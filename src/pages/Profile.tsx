import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Shield, 
  CreditCard,
  Eye,
  EyeOff,
  Edit,
  Save,
  X
} from 'lucide-react';

export const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', name: 'Dados Pessoais', icon: User },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'payment', name: 'Pagamento', icon: CreditCard }
  ];

  const notifications = [
    { id: 'service_updates', name: 'Atualizações de Serviços', description: 'Receber fotos e vídeos durante os serviços', enabled: true },
    { id: 'appointments', name: 'Lembretes de Agendamento', description: 'Notificações sobre próximos agendamentos', enabled: true },
    { id: 'promotions', name: 'Promoções e Ofertas', description: 'Receber ofertas especiais e promoções', enabled: false },
    { id: 'health_reminders', name: 'Lembretes de Saúde', description: 'Alertas sobre vacinação e check-ups', enabled: true },
    { id: 'whatsapp', name: 'WhatsApp', description: 'Receber notificações via WhatsApp', enabled: true },
    { id: 'email', name: 'E-mail', description: 'Receber notificações por e-mail', enabled: true },
    { id: 'push', name: 'Push Notifications', description: 'Notificações no aplicativo', enabled: true }
  ];

  const paymentMethods = [
    { id: '1', type: 'credit', number: '**** **** **** 1234', brand: 'Visa', isDefault: true },
    { id: '2', type: 'credit', number: '**** **** **** 5678', brand: 'Mastercard', isDefault: false }
  ];

  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block">
            <img
              src="https://images.unsplash.com/photo-1494790108755-2616b169a1b5?w=120&h=120&fit=crop&crop=face"
              alt="Perfil"
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
            />
            <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-dark transition-colors">
              <Edit className="h-4 w-4" />
            </button>
          </div>
          <h1 className="text-3xl font-bold text-text-color-dark">Maria Silva</h1>
          <p className="text-text-color">Tutora de Luna e Thor</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-light/50 text-primary-dark border border-primary/20'
                    : 'bg-white text-text-color-dark hover:bg-surface-dark border border-accent/20'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </motion.div>

          <div className="lg:col-span-3">
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-accent/20 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-text-color-dark">
                    Dados Pessoais
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isEditing
                        ? 'bg-gray-100 text-text-color-dark hover:bg-gray-200'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <X className="h-4 w-4" />
                        <span>Cancelar</span>
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-2">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="h-5 w-5 text-text-color absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        defaultValue="Maria Silva"
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                          isEditing
                            ? 'border-accent focus:ring-2 focus:ring-primary focus:border-transparent'
                            : 'border-accent/20 bg-surface-dark'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color mb-2">
                      E-mail
                    </label>
                    <div className="relative">
                      <Mail className="h-5 w-5 text-text-color absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="email"
                        defaultValue="maria.silva@email.com"
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                          isEditing
                            ? 'border-accent focus:ring-2 focus:ring-primary focus:border-transparent'
                            : 'border-accent/20 bg-surface-dark'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color mb-2">
                      WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="h-5 w-5 text-text-color absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="tel"
                        defaultValue="(11) 99999-9999"
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                          isEditing
                            ? 'border-accent focus:ring-2 focus:ring-primary focus:border-transparent'
                            : 'border-accent/20 bg-surface-dark'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color mb-2">
                      CEP
                    </label>
                    <div className="relative">
                      <MapPin className="h-5 w-5 text-text-color absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        defaultValue="01234-567"
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                          isEditing
                            ? 'border-accent focus:ring-2 focus:ring-primary focus:border-transparent'
                            : 'border-accent/20 bg-surface-dark'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-color mb-2">
                      Endereço Completo
                    </label>
                    <input
                      type="text"
                      defaultValue="Rua das Flores, 123 - Centro, São Paulo - SP"
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                        isEditing
                          ? 'border-accent focus:ring-2 focus:ring-primary focus:border-transparent'
                          : 'border-accent/20 bg-surface-dark'
                      }`}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-accent text-text-color-dark rounded-lg hover:bg-surface-dark transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Salvar</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-accent/20 p-8"
              >
                <h2 className="text-2xl font-semibold text-text-color-dark mb-6">
                  Preferências de Notificação
                </h2>
                
                <div className="space-y-6">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-4 bg-surface-dark rounded-lg">
                      <div>
                        <h3 className="font-medium text-text-color-dark">
                          {notification.name}
                        </h3>
                        <p className="text-sm text-text-color">
                          {notification.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked={notification.enabled}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-accent/20 p-8"
              >
                <h2 className="text-2xl font-semibold text-text-color-dark mb-6">
                  Segurança da Conta
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-2">
                      Senha Atual
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite sua senha atual"
                        className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-color hover:text-text-color-dark"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color mb-2">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      placeholder="Digite sua nova senha"
                      className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color mb-2">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      placeholder="Confirme sua nova senha"
                      className="w-full px-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      Dicas de Segurança
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Use pelo menos 8 caracteres</li>
                      <li>• Inclua letras maiúsculas e minúsculas</li>
                      <li>• Adicione números e símbolos</li>
                      <li>• Evite informações pessoais</li>
                    </ul>
                  </div>

                  <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
                    Atualizar Senha
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-accent/20 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-text-color-dark">
                    Formas de Pagamento
                  </h2>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    Adicionar Cartão
                  </button>
                </div>

                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        method.isDefault
                          ? 'border-primary/50 bg-primary-light/30'
                          : 'border-accent/20 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-surface-dark p-3 rounded-lg">
                            <CreditCard className="h-6 w-6 text-text-color" />
                          </div>
                          <div>
                            <h3 className="font-medium text-text-color-dark">
                              {method.brand} {method.number}
                            </h3>
                            <p className="text-sm text-text-color">
                              {method.isDefault ? 'Cartão principal' : 'Cartão adicional'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!method.isDefault && (
                            <button className="text-primary hover:text-primary-dark text-sm font-medium">
                              Tornar Principal
                            </button>
                          )}
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-surface-dark rounded-lg p-6">
                  <h3 className="font-semibold text-text-color-dark mb-4">
                    Outras Formas de Pagamento
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-accent/20">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">PIX</span>
                      </div>
                      <span className="font-medium text-text-color-dark">PIX</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-accent/20">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">$</span>
                      </div>
                      <span className="font-medium text-text-color-dark">Dinheiro</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
