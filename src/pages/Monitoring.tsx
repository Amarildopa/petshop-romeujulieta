import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  BarChart3, 
  Eye, 
  RefreshCw,
  TrendingUp,
  Zap
} from 'lucide-react'
import { metrics } from '../lib/metrics'
import { logger } from '../lib/logger'

interface MonitoringStats {
  total: number
  lastHour: number
  lastDay: number
  byType: {
    performance: number
    business: number
    error: number
  }
  recentErrors: Array<{
    type: string
    message: string
    timestamp: number
  }>
}

const Monitoring: React.FC = () => {
  const [stats, setStats] = useState<MonitoringStats | null>(null)
  const [logs, setLogs] = useState<unknown[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d'>('1h')

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const newStats = metrics.getStats()
      const newLogs = logger.getLogs()
      setStats(newStats)
      setLogs(newLogs.slice(-50)) // Últimos 50 logs
    } catch (error) {
      console.error('Error refreshing monitoring data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 30000) // Atualizar a cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }



  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case 'api_error': return 'text-red-600 bg-red-100'
      case 'validation_error': return 'text-yellow-600 bg-yellow-100'
      case 'signup_failed': return 'text-blue-600 bg-blue-100'
      case 'signin_failed': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-600'
      case 'WARN': return 'text-yellow-600'
      case 'INFO': return 'text-blue-600'
      case 'DEBUG': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-color">Carregando dados de monitoramento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-color-dark mb-2">
              Monitoramento do Sistema
            </h1>
            <p className="text-text-color">
              Acompanhe métricas de performance, erros e logs em tempo real
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as '1h' | '24h' | '7d')}
              className="px-4 py-2 border border-accent rounded-lg bg-white text-text-color-dark"
              aria-label="Selecionar período de tempo"
              title="Selecionar período de tempo"
            >
              <option value="1h">Última hora</option>
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 dias</option>
            </select>
            
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-color mb-1">Total de Métricas</p>
                <p className="text-3xl font-bold text-text-color-dark">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-text-color mt-2">
              {stats.lastHour} na última hora
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-color mb-1">Performance</p>
                <p className="text-3xl font-bold text-green-600">{stats.byType.performance}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-text-color mt-2">
              Métricas de performance
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-color mb-1">Eventos de Negócio</p>
                <p className="text-3xl font-bold text-purple-600">{stats.byType.business}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-text-color mt-2">
              Ações dos usuários
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-color mb-1">Erros</p>
                <p className="text-3xl font-bold text-red-600">{stats.byType.error}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-text-color mt-2">
              {stats.recentErrors.length} recentes
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Errors */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-color-dark">Erros Recentes</h2>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            
            <div className="space-y-4">
              {stats.recentErrors.length === 0 ? (
                <p className="text-text-color text-center py-8">
                  Nenhum erro recente encontrado
                </p>
              ) : (
                stats.recentErrors.map((error, index) => (
                  <div key={index} className="border border-accent/20 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getErrorTypeColor(error.type)}`}>
                        {error.type}
                      </span>
                      <span className="text-xs text-text-color">
                        {formatTimestamp(error.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-text-color-dark">{error.message}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Recent Logs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-color-dark">Logs Recentes</h2>
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-text-color text-center py-8">
                  Nenhum log encontrado
                </p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="border-l-4 border-accent/20 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${getLogLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                      <span className="text-xs text-text-color">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-text-color-dark mb-1">{log.message}</p>
                    {log.source && (
                      <span className="text-xs text-text-color">[{log.source}]</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
        >
          <h2 className="text-xl font-bold text-text-color-dark mb-4">Ações</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                const logsData = logger.exportLogs()
                const blob = new Blob([logsData], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `petshop-logs-${new Date().toISOString().split('T')[0]}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Exportar Logs
            </button>
            
            <button
              onClick={() => {
                metrics.clear()
                logger.clearLogs()
                refreshData()
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Limpar Dados
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Monitoring
