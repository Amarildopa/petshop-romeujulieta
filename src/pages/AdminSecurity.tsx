import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Key, 
  Lock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Eye, 
  EyeOff,
  RefreshCw,
  Search
} from 'lucide-react'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { logger } from '../lib/logger'

interface SecuritySetting {
  id: string
  category: 'authentication' | 'authorization' | 'encryption' | 'audit' | 'access_control'
  name: string
  description: string
  value: string | boolean | number
  is_sensitive: boolean
  last_updated: string
  updated_by: string
}

interface SecurityLog {
  id: string
  event_type: 'login_attempt' | 'permission_change' | 'security_setting_change' | 'failed_access'
  user_id: string
  description: string
  ip_address: string
  user_agent: string
  created_at: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

const AdminSecurity: React.FC = () => {
  const { adminUser } = useAdminAuth()
  const [settings, setSettings] = useState<SecuritySetting[]>([])
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'settings' | 'logs' | 'audit'>('settings')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showSensitive, setShowSensitive] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')



  const loadSecurityData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data para demonstração
      const mockSettings: SecuritySetting[] = [
        {
          id: '1',
          category: 'authentication',
          name: 'Tempo de Sessão (minutos)',
          description: 'Tempo limite para sessões de usuário inativas',
          value: 30,
          is_sensitive: false,
          last_updated: new Date().toISOString(),
          updated_by: 'admin@petshop.com'
        },
        {
          id: '2',
          category: 'authentication',
          name: 'Tentativas de Login Máximas',
          description: 'Número máximo de tentativas de login antes do bloqueio',
          value: 5,
          is_sensitive: false,
          last_updated: new Date().toISOString(),
          updated_by: 'admin@petshop.com'
        },
        {
          id: '3',
          category: 'encryption',
          name: 'Chave de Criptografia JWT',
          description: 'Chave secreta para assinatura de tokens JWT',
          value: 'jwt_secret_key_***',
          is_sensitive: true,
          last_updated: new Date().toISOString(),
          updated_by: 'admin@petshop.com'
        },
        {
          id: '4',
          category: 'access_control',
          name: 'Bloqueio por IP Habilitado',
          description: 'Ativar bloqueio automático de IPs suspeitos',
          value: true,
          is_sensitive: false,
          last_updated: new Date().toISOString(),
          updated_by: 'admin@petshop.com'
        }
      ]

      const mockLogs: SecurityLog[] = [
        {
          id: '1',
          event_type: 'login_attempt',
          user_id: 'user123',
          description: 'Login bem-sucedido',
          ip_address: '192.168.0.53',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          created_at: new Date().toISOString(),
          severity: 'low'
        },
        {
          id: '2',
          event_type: 'failed_access',
          user_id: 'unknown',
          description: 'Tentativa de acesso negado à área administrativa',
          ip_address: '192.168.1.200',
          user_agent: 'Mozilla/5.0 (Linux; Android 10)',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          severity: 'medium'
        },
        {
          id: '3',
          event_type: 'security_setting_change',
          user_id: adminUser?.user_id || 'admin',
          description: 'Alteração no tempo limite de sessão',
          ip_address: '192.168.1.50',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          severity: 'high'
        }
      ]
      
      setSettings(mockSettings)
      setLogs(mockLogs)

      logger.info('Security data loaded', { 
        settingsCount: mockSettings.length,
        logsCount: mockLogs.length 
      }, 'ADMIN')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      logger.error('Failed to load security data', { error: errorMessage }, 'ADMIN')
    } finally {
      setLoading(false)
    }
  }, [adminUser?.user_id])

  useEffect(() => {
    loadSecurityData()
  }, [loadSecurityData])

  const handleEditSetting = (setting: SecuritySetting) => {
    setEditingId(setting.id)
    setEditValue(setting.value.toString())
  }

  const handleSaveSetting = async (id: string) => {
    try {
      // Simular salvamento
      const updatedSettings = settings.map(setting => 
        setting.id === id 
          ? { ...setting, value: editValue, last_updated: new Date().toISOString() }
          : setting
      )
      setSettings(updatedSettings)
      setEditingId(null)
      setEditValue('')

      logger.info('Security setting updated', { settingId: id, newValue: editValue }, 'ADMIN')
    } catch (err) {
      logger.error('Failed to update security setting', { error: err }, 'ADMIN')
    }
  }

  const filteredSettings = settings.filter(setting => {
    const matchesSearch = setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || setting.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <Key className="h-4 w-4" />
      case 'authorization': return <Users className="h-4 w-4" />
      case 'encryption': return <Lock className="h-4 w-4" />
      case 'audit': return <Eye className="h-4 w-4" />
      case 'access_control': return <Shield className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-color-dark flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Segurança do Sistema
          </h1>
          <p className="text-text-color mt-1">
            Gerencie configurações de segurança e monitore atividades
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadSecurityData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2"
        >
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'settings', label: 'Configurações', icon: Settings },
            { id: 'logs', label: 'Logs de Segurança', icon: Eye },
            { id: 'audit', label: 'Auditoria', icon: CheckCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'settings' | 'logs' | 'audit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-color hover:text-text-color-dark hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar configurações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todas as categorias</option>
              <option value="authentication">Autenticação</option>
              <option value="authorization">Autorização</option>
              <option value="encryption">Criptografia</option>
              <option value="audit">Auditoria</option>
              <option value="access_control">Controle de Acesso</option>
            </select>
            <button
              onClick={() => setShowSensitive(!showSensitive)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showSensitive 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSensitive ? 'Ocultar Sensíveis' : 'Mostrar Sensíveis'}
            </button>
          </div>

          {/* Settings List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Configuração
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Atualização
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSettings.map((setting) => (
                    <motion.tr
                      key={setting.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {setting.is_sensitive && (
                            <Lock className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {setting.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {setting.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getCategoryIcon(setting.category)}
                          {setting.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === setting.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <button
                              onClick={() => handleSaveSetting(setting.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-900">
                            {setting.is_sensitive && !showSensitive 
                              ? '***' 
                              : setting.value.toString()
                            }
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(setting.last_updated).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditSetting(setting)}
                          className="text-primary hover:text-primary-dark mr-2"
                        >
                          Editar
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {log.description}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.event_type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Logins Bem-sucedidos (24h)
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      127
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tentativas Falhadas (24h)
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      8
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      IPs Bloqueados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      3
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Sessões Ativas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      45
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Status de Segurança
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-green-800">SSL/TLS Ativo</span>
                </div>
                <span className="text-green-600 font-medium">OK</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-green-800">Firewall Ativo</span>
                </div>
                <span className="text-green-600 font-medium">OK</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                  <span className="text-yellow-800">Backup Automático</span>
                </div>
                <span className="text-yellow-600 font-medium">Atenção</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSecurity