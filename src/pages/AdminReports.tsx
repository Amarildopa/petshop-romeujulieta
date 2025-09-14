import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Download, 
  DollarSign, 
  Users, 
  ShoppingBag,
  Calendar as CalendarIcon,
  RefreshCw,
  Eye,
  FileText
} from 'lucide-react'
import { adminService, AdminReport } from '../services/adminService'
import { logger } from '../lib/logger'

interface ReportTemplate {
  id: string
  name: string
  type: string
  description: string
  icon: React.ReactNode
  color: string
}

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<AdminReport[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'revenue',
      name: 'Relatório de Receita',
      type: 'revenue',
      description: 'Análise de receita por período, incluindo vendas e assinaturas',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 'users',
      name: 'Relatório de Usuários',
      type: 'users',
      description: 'Crescimento de usuários, ativação e retenção',
      icon: <Users className="h-6 w-6" />,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 'appointments',
      name: 'Relatório de Agendamentos',
      type: 'appointments',
      description: 'Agendamentos por período, serviços mais populares',
      icon: <CalendarIcon className="h-6 w-6" />,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 'products',
      name: 'Relatório de Produtos',
      type: 'products',
      description: 'Estoque, produtos mais vendidos, análise de inventário',
      icon: <ShoppingBag className="h-6 w-6" />,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      id: 'orders',
      name: 'Relatório de Pedidos',
      type: 'orders',
      description: 'Pedidos por período, status, análise de conversão',
      icon: <FileText className="h-6 w-6" />,
      color: 'text-indigo-600 bg-indigo-100'
    }
  ]

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await adminService.getReports()
      setReports(data)
      logger.info('Reports loaded', { count: data.length }, 'ADMIN')
    } catch (error) {
      logger.error('Error loading reports', error as Error, {}, 'ADMIN')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const handleGenerateReport = async (template: ReportTemplate) => {
    try {
      setGenerating(true)
      setSelectedTemplate(template.id)
      
      const reportName = `${template.name} - ${new Date().toLocaleDateString('pt-BR')}`
      
      await adminService.generateReport(
        reportName,
        template.type,
        {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      )
      
      await loadReports()
      logger.info('Report generated', { type: template.type, name: reportName }, 'ADMIN')
    } catch (error) {
      logger.error('Error generating report', error as Error, { type: template.type }, 'ADMIN')
    } finally {
      setGenerating(false)
      setSelectedTemplate(null)
    }
  }

  const handleDownloadReport = (report: AdminReport) => {
    // Implementar download do relatório
    const dataStr = JSON.stringify(report.data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.name}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    logger.info('Report downloaded', { reportId: report.id }, 'ADMIN')
  }



  const getReportIcon = (type: string) => {
    const template = reportTemplates.find(t => t.type === type)
    return template?.icon || <FileText className="h-5 w-5" />
  }

  const getReportColor = (type: string) => {
    const template = reportTemplates.find(t => t.type === type)
    return template?.color || 'text-gray-600 bg-gray-100'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-color">Carregando relatórios...</p>
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
              Relatórios e Analytics
            </h1>
            <p className="text-text-color">
              Gere e visualize relatórios detalhados do sistema
            </p>
          </div>
          
          <button
            onClick={loadReports}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button>
        </div>

        {/* Filtros de Data */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20 mb-8">
          <h3 className="text-lg font-semibold text-text-color-dark mb-4">Período do Relatório</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Data Inicial</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Data inicial do relatório"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Data Final</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Data final do relatório"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setDateRange({
                  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0]
                })}
                className="w-full px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
              >
                Últimos 7 dias
              </button>
            </div>
          </div>
        </div>

        {/* Templates de Relatórios */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-text-color-dark mb-4">Gerar Novo Relatório</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-full ${template.color}`}>
                    {template.icon}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-text-color-dark">
                      {template.name}
                    </h4>
                  </div>
                </div>
                
                <p className="text-sm text-text-color mb-4">
                  {template.description}
                </p>
                
                <button
                  onClick={() => handleGenerateReport(template)}
                  disabled={generating && selectedTemplate === template.id}
                  className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {generating && selectedTemplate === template.id ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <BarChart3 className="h-4 w-4 mr-2" />
                  )}
                  {generating && selectedTemplate === template.id ? 'Gerando...' : 'Gerar Relatório'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Relatórios Gerados */}
        <div className="bg-white rounded-2xl shadow-lg border border-accent/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-accent/20">
            <h3 className="text-lg font-semibold text-text-color-dark">Relatórios Gerados</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Relatório
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Gerado em
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Expira em
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/20">
                {reports.map((report) => (
                  <motion.tr
                    key={report.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full ${getReportColor(report.type)}`}>
                          {getReportIcon(report.type)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-text-color-dark">
                            {report.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">
                      {new Date(report.generated_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">
                      {report.expires_at ? new Date(report.expires_at).toLocaleDateString('pt-BR') : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownloadReport(report)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Implementar visualização do relatório
                            console.log('View report:', report)
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {reports.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-text-color">Nenhum relatório gerado ainda</p>
              <p className="text-sm text-text-color mt-1">
                Gere seu primeiro relatório usando os templates acima
              </p>
            </div>
          )}
        </div>

        {/* Estatísticas Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
        >
          <h3 className="text-lg font-semibold text-text-color-dark mb-6">Estatísticas Rápidas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {reports.length}
              </div>
              <p className="text-sm text-text-color">Relatórios Gerados</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {reports.filter(r => r.type === 'revenue').length}
              </div>
              <p className="text-sm text-text-color">Relatórios de Receita</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {reports.filter(r => r.type === 'users').length}
              </div>
              <p className="text-sm text-text-color">Relatórios de Usuários</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {reports.filter(r => r.type === 'appointments').length}
              </div>
              <p className="text-sm text-text-color">Relatórios de Agendamentos</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminReports
