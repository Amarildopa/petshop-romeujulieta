import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Eye,
  EyeOff,
  Globe,
  Shield,
  Bell,
  Mail,
  Database,
  Palette,
  Clock,
  Users,
  FileText,
  Plus,
  Trash2,
  Search
} from 'lucide-react'
import { adminService, SystemSetting } from '../services/adminService'
import { logger } from '../lib/logger'

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    category: 'general',
    description: '',
    is_public: false
  })
  const [changedSettings, setChangedSettings] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await adminService.getSystemSettings()
      setSettings(data)
    } catch (error) {
      logger.error('Error loading system settings', error as Error, {}, 'ADMIN')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await loadSettings()
      setChangedSettings(new Set())
    } finally {
      setRefreshing(false)
    }
  }

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ))
    setChangedSettings(prev => new Set([...prev, key]))
  }

  const handleTogglePublic = (key: string) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, is_public: !setting.is_public } : setting
    ))
    setChangedSettings(prev => new Set([...prev, key]))
  }

  const handleSaveChanges = async () => {
    try {
      setSaving(true)
      
      const settingsToUpdate = settings.filter(setting => 
        changedSettings.has(setting.key)
      )

      for (const setting of settingsToUpdate) {
        await adminService.updateSystemSetting(setting.key, {
          value: setting.value,
          is_public: setting.is_public
        })
      }

      setChangedSettings(new Set())
      logger.info('System settings updated successfully', {}, {}, 'ADMIN')
    } catch (error) {
      logger.error('Error updating system settings', error as Error, {}, 'ADMIN')
    } finally {
      setSaving(false)
    }
  }

  const handleAddSetting = async () => {
    try {
      if (!newSetting.key || !newSetting.value) return

      await adminService.createSystemSetting(newSetting)
      await loadSettings()
      setShowAddModal(false)
      setNewSetting({
        key: '',
        value: '',
        category: 'general',
        description: '',
        is_public: false
      })
    } catch (error) {
      logger.error('Error creating system setting', error as Error, {}, 'ADMIN')
    }
  }

  const handleDeleteSetting = async (key: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) return

    try {
      await adminService.deleteSystemSetting(key)
      await loadSettings()
    } catch (error) {
      logger.error('Error deleting system setting', error as Error, {}, 'ADMIN')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'general':
        return <Settings className="h-5 w-5" />
      case 'security':
        return <Shield className="h-5 w-5" />
      case 'notifications':
        return <Bell className="h-5 w-5" />
      case 'email':
        return <Mail className="h-5 w-5" />
      case 'database':
        return <Database className="h-5 w-5" />
      case 'appearance':
        return <Palette className="h-5 w-5" />
      case 'system':
        return <Globe className="h-5 w-5" />
      case 'users':
        return <Users className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'general':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'security':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'notifications':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'email':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'database':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'appearance':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'system':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'users':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredSettings = settings.filter(setting => {
    const matchesSearch = searchTerm === '' || 
      setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (setting.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || setting.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const groupedSettings = filteredSettings.reduce((groups, setting) => {
    const category = setting.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(setting)
    return groups
  }, {} as Record<string, SystemSetting[]>)

  const categories = [...new Set(settings.map(s => s.category))]

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-color">Carregando configurações do sistema...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-color-dark">Configurações do Sistema</h1>
                <p className="text-text-color">
                  {filteredSettings.length} de {settings.length} configurações encontradas
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-accent/20 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Configuração</span>
              </button>
              
              {changedSettings.size > 0 && (
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Salvando...' : `Salvar (${changedSettings.size})`}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-accent/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar configurações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Filtro de Categoria */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Configurações por Categoria */}
        <div className="space-y-6">
          {Object.entries(groupedSettings).map(([category, categorySettings]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-accent/20"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                    {getCategoryIcon(category)}
                  </div>
                  <h2 className="text-xl font-bold text-text-color-dark">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h2>
                  <span className="text-sm text-text-color/60">
                    ({categorySettings.length} configurações)
                  </span>
                </div>

                <div className="space-y-4">
                  {categorySettings.map((setting) => (
                    <div
                      key={setting.key}
                      className={`p-4 rounded-xl border transition-all ${
                        changedSettings.has(setting.key)
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-gray-200 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-text-color-dark">
                              {setting.key}
                            </h3>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleTogglePublic(setting.key)}
                                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${
                                  setting.is_public
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                }`}
                              >
                                {setting.is_public ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                <span>{setting.is_public ? 'Público' : 'Privado'}</span>
                              </button>
                              
                              {changedSettings.has(setting.key) && (
                                <div className="flex items-center space-x-1 text-orange-600">
                                  <Clock className="h-3 w-3" />
                                  <span className="text-xs">Alterado</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {setting.description && (
                            <p className="text-sm text-text-color/60">
                              {setting.description}
                            </p>
                          )}

                          <div className="flex items-center space-x-3">
                            <input
                              type="text"
                              value={setting.value}
                              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                              placeholder="Valor da configuração"
                            />
                            

                            
                            <button
                              onClick={() => handleDeleteSetting(setting.key)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs text-text-color/60">
                            <span>Criado: {new Date(setting.created_at).toLocaleString('pt-BR')}</span>
                            <span>Atualizado: {new Date(setting.updated_at).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredSettings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center border border-accent/20"
          >
            <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-text-color text-lg">Nenhuma configuração encontrada</p>
            <p className="text-text-color/60">Tente ajustar os filtros ou adicione uma nova configuração</p>
          </motion.div>
        )}

        {/* Modal de Nova Configuração */}
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-text-color-dark">
                    Nova Configuração
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Plus className="h-5 w-5 rotate-45" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chave da Configuração
                    </label>
                    <input
                      type="text"
                      value={newSetting.key}
                      onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="ex: app_name, max_upload_size"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor
                    </label>
                    <input
                      type="text"
                      value={newSetting.value}
                      onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Valor da configuração"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <select
                      value={newSetting.category}
                      onChange={(e) => setNewSetting(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="general">Geral</option>
                      <option value="security">Segurança</option>
                      <option value="notifications">Notificações</option>
                      <option value="email">Email</option>
                      <option value="database">Banco de Dados</option>
                      <option value="appearance">Aparência</option>
                      <option value="system">Sistema</option>
                      <option value="users">Usuários</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição (opcional)
                    </label>
                    <textarea
                      value={newSetting.description}
                      onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      rows={3}
                      placeholder="Descrição da configuração"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={newSetting.is_public}
                      onChange={(e) => setNewSetting(prev => ({ ...prev, is_public: e.target.checked }))}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="is_public" className="text-sm text-gray-700">
                      Configuração pública (visível para usuários não-admin)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddSetting}
                    disabled={!newSetting.key || !newSetting.value}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Criar Configuração
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AdminSettings