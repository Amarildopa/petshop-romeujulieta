import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Search, 
  Download, 
  Eye,
  User,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  Settings,
  Database,
  Shield,
  FileText,
  Monitor
} from 'lucide-react'
import { adminService, AdminLog } from '../services/adminService'
import { logger } from '../lib/logger'

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [resourceFilter, setResourceFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [limit, setLimit] = useState(100)
  const [offset, setOffset] = useState(0)

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await adminService.getAdminLogs(limit, offset)
      setLogs(data)
    } catch (error) {
      logger.error('Error loading admin logs', error as Error, {}, 'ADMIN')
    } finally {
      setLoading(false)
    }
  }, [limit, offset])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      setOffset(0)
      await loadLogs()
    } finally {
      setRefreshing(false)
    }
  }

  const handleViewLog = (log: AdminLog) => {
    setSelectedLog(log)
    setShowModal(true)
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'update':
      case 'edit':
        return <Settings className="h-4 w-4 text-blue-500" />
      case 'delete':
      case 'remove':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'login':
      case 'access':
        return <Shield className="h-4 w-4 text-purple-500" />
      case 'view':
      case 'read':
        return <Eye className="h-4 w-4 text-gray-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'update':
      case 'edit':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'delete':
      case 'remove':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'login':
      case 'access':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'view':
      case 'read':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType.toLowerCase()) {
      case 'user':
      case 'admin':
        return <User className="h-4 w-4" />
      case 'database':
      case 'table':
        return <Database className="h-4 w-4" />
      case 'system':
      case 'settings':
        return <Settings className="h-4 w-4" />
      case 'security':
        return <Shield className="h-4 w-4" />
      case 'report':
        return <FileText className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.admin_users_pet?.profiles_pet?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter.toLowerCase())
    const matchesResource = resourceFilter === 'all' || log.resource_type.toLowerCase() === resourceFilter.toLowerCase()
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const logDate = new Date(log.created_at)
      const now = new Date()
      
      switch (dateFilter) {
        case 'today':
          matchesDate = logDate.toDateString() === now.toDateString()
          break
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = logDate >= weekAgo
          break
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = logDate >= monthAgo
          break
        }
      }
    }

    return matchesSearch && matchesAction && matchesResource && matchesDate
  })

  const uniqueActions = [...new Set(logs.map(log => log.action))]
  const uniqueResources = [...new Set(logs.map(log => log.resource_type))]

  const handleExportLogs = () => {
    const csvContent = [
      ['Data/Hora', 'Ação', 'Recurso', 'ID do Recurso', 'Administrador', 'IP', 'User Agent'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_at).toLocaleString('pt-BR'),
        log.action,
        log.resource_type,
        log.resource_id || '',
        log.admin_users_pet?.profiles_pet?.full_name || 'Sistema',
        log.ip_address || '',
        log.user_agent || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `admin-logs-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-color">Carregando logs administrativos...</p>
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
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-2xl">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-color-dark">Logs Administrativos</h1>
                <p className="text-text-color">
                  {filteredLogs.length} de {logs.length} logs encontrados
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
                onClick={handleExportLogs}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-accent/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Filtro de Ação */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">Todas as ações</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>

            {/* Filtro de Recurso */}
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">Todos os recursos</option>
              {uniqueResources.map(resource => (
                <option key={resource} value={resource}>{resource}</option>
              ))}
            </select>

            {/* Filtro de Data */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">Todas as datas</option>
              <option value="today">Hoje</option>
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
            </select>

            {/* Limite de registros */}
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value={50}>50 registros</option>
              <option value={100}>100 registros</option>
              <option value={200}>200 registros</option>
              <option value={500}>500 registros</option>
            </select>
          </div>
        </motion.div>

        {/* Lista de Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-accent/20"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-text-color-dark mb-4">
              Logs do Sistema ({filteredLogs.length})
            </h2>
            
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-text-color text-lg">Nenhum log encontrado</p>
                <p className="text-text-color/60">Tente ajustar os filtros ou aguarde novas atividades</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-xl border border-gray-200 hover:border-primary/30 cursor-pointer transition-all hover:shadow-md"
                    onClick={() => handleViewLog(log)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action)}
                          {getResourceIcon(log.resource_type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                            <span className="text-sm font-medium text-text-color-dark">
                              {log.resource_type}
                            </span>
                            {log.resource_id && (
                              <span className="text-sm text-text-color/60">
                                ID: {log.resource_id}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-text-color/60">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{log.admin_users_pet?.profiles_pet?.full_name || 'Sistema'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                            </div>
                            {log.ip_address && (
                              <div className="flex items-center space-x-1">
                                <Monitor className="h-3 w-3" />
                                <span>{log.ip_address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewLog(log)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Modal de Detalhes */}
        {showModal && selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    {getActionIcon(selectedLog.action)}
                    <h2 className="text-2xl font-bold text-text-color-dark">
                      Detalhes do Log
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ação</label>
                      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${getActionColor(selectedLog.action)}`}>
                        {getActionIcon(selectedLog.action)}
                        <span className="font-medium">{selectedLog.action}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Recurso</label>
                      <div className="flex items-center space-x-2 text-text-color-dark">
                        {getResourceIcon(selectedLog.resource_type)}
                        <span>{selectedLog.resource_type}</span>
                      </div>
                    </div>

                    {selectedLog.resource_id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID do Recurso</label>
                        <p className="text-text-color font-mono text-sm bg-gray-100 p-2 rounded">
                          {selectedLog.resource_id}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Administrador</label>
                      <p className="text-text-color">
                        {selectedLog.admin_users_pet?.profiles_pet?.full_name || 'Sistema'}
                      </p>
                      {selectedLog.admin_users_pet?.profiles_pet?.email && (
                        <p className="text-text-color/60 text-sm">
                          {selectedLog.admin_users_pet.profiles_pet.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data/Hora</label>
                      <p className="text-text-color">
                        {new Date(selectedLog.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>

                    {selectedLog.ip_address && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço IP</label>
                        <p className="text-text-color font-mono text-sm">
                          {selectedLog.ip_address}
                        </p>
                      </div>
                    )}

                    {selectedLog.user_agent && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                        <p className="text-text-color text-sm bg-gray-100 p-2 rounded break-all">
                          {selectedLog.user_agent}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Detalhes Adicionais</label>
                    <pre className="bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex justify-end pt-6 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Fechar
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

export default AdminLogs