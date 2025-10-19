import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Filter,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Star,
  RefreshCw,
  FileText,
  PieChart,
  Activity
} from 'lucide-react'

import { toast } from 'sonner'
import { logger } from '../lib/logger'

interface ReportData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  averageOrderValue: number
  conversionRate: number
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
  topCategories: Array<{
    name: string
    sales: number
    revenue: number
  }>
  salesByDay: Array<{
    date: string
    orders: number
    revenue: number
  }>
  ordersByStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
  customerSegments: Array<{
    segment: string
    count: number
    revenue: number
  }>
}

const AdminReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [reportType, setReportType] = useState('overview')
  const [exporting, setExporting] = useState(false)

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Simular dados de relatório (em produção, viria do backend)
      const mockData: ReportData = {
        totalRevenue: 45678.90,
        totalOrders: 234,
        totalCustomers: 156,
        totalProducts: 89,
        averageOrderValue: 195.25,
        conversionRate: 3.2,
        topProducts: [
          { id: '1', name: 'Ração Premium Cães', sales: 45, revenue: 2250.00 },
          { id: '2', name: 'Brinquedo Interativo', sales: 38, revenue: 1140.00 },
          { id: '3', name: 'Coleira Personalizada', sales: 32, revenue: 960.00 },
          { id: '4', name: 'Shampoo Pet', sales: 28, revenue: 840.00 },
          { id: '5', name: 'Cama Ortopédica', sales: 25, revenue: 1875.00 }
        ],
        topCategories: [
          { name: 'Alimentação', sales: 89, revenue: 8900.00 },
          { name: 'Brinquedos', sales: 67, revenue: 3350.00 },
          { name: 'Higiene', sales: 45, revenue: 2250.00 },
          { name: 'Acessórios', sales: 33, revenue: 1980.00 }
        ],
        salesByDay: Array.from({ length: 30 }, (_, i) => {
          const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
          return {
            date: date.toISOString().split('T')[0],
            orders: Math.floor(Math.random() * 15) + 5,
            revenue: Math.floor(Math.random() * 2000) + 500
          }
        }),
        ordersByStatus: [
          { status: 'Entregue', count: 156, percentage: 66.7 },
          { status: 'Processando', count: 34, percentage: 14.5 },
          { status: 'Enviado', count: 28, percentage: 12.0 },
          { status: 'Pendente', count: 16, percentage: 6.8 }
        ],
        customerSegments: [
          { segment: 'Novos Clientes', count: 45, revenue: 8750.00 },
          { segment: 'Clientes Recorrentes', count: 78, revenue: 23400.00 },
          { segment: 'VIP', count: 33, revenue: 13528.90 }
        ]
      }
      
      setReportData(mockData)
      logger.info('Report data loaded', { dateRange }, 'ADMIN')
    } catch (error) {
      logger.error('Error loading report data', error as Error, {}, 'ADMIN')
      toast.error('Erro ao carregar dados do relatório')
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    loadReportData()
  }, [dateRange, loadReportData])

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setExporting(true)
      
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Relatório exportado em ${format.toUpperCase()}`)
      logger.info('Report exported', { format, dateRange }, 'ADMIN')
    } catch (error) {
      logger.error('Error exporting report', error as Error, { format }, 'ADMIN')
      toast.error('Erro ao exportar relatório')
    } finally {
      setExporting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
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

  if (!reportData) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-text-color mx-auto mb-4" />
          <p className="text-text-color">Erro ao carregar dados do relatório</p>
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
              Relatórios Avançados
            </h1>
            <p className="text-text-color">
              Análise detalhada de vendas e performance
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={loadReportData}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <div className="relative">
              <select
                className="appearance-none bg-white border border-accent rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary focus:border-transparent"
                onChange={(e) => exportReport(e.target.value as "pdf" | "excel" | "csv" | "")}
                disabled={exporting}
              >
                <option value="">Exportar</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
              <Download className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-color pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Tipo de Relatório</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="overview">Visão Geral</option>
                <option value="sales">Vendas</option>
                <option value="products">Produtos</option>
                <option value="customers">Clientes</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Data Inicial</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Data Final</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={loadReportData}
                className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-color text-sm">Receita Total</p>
                <p className="text-2xl font-bold text-text-color-dark">
                  {formatCurrency(reportData.totalRevenue)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-text-color ml-1">vs mês anterior</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-color text-sm">Total de Pedidos</p>
                <p className="text-2xl font-bold text-text-color-dark">
                  {reportData.totalOrders.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+8.2%</span>
              <span className="text-text-color ml-1">vs mês anterior</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-color text-sm">Clientes Únicos</p>
                <p className="text-2xl font-bold text-text-color-dark">
                  {reportData.totalCustomers.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+15.3%</span>
              <span className="text-text-color ml-1">vs mês anterior</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-color text-sm">Ticket Médio</p>
                <p className="text-2xl font-bold text-text-color-dark">
                  {formatCurrency(reportData.averageOrderValue)}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+3.8%</span>
              <span className="text-text-color ml-1">vs mês anterior</span>
            </div>
          </motion.div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vendas por Dia */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-color-dark">Vendas por Dia</h3>
              <Activity className="h-5 w-5 text-text-color" />
            </div>
            
            <div className="h-64 flex items-end justify-between space-x-1">
              {reportData.salesByDay.slice(-14).map((day, index) => {
                const maxRevenue = Math.max(...reportData.salesByDay.map(d => d.revenue))
                const height = (day.revenue / maxRevenue) * 100
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-text-color mb-2">
                      {formatCurrency(day.revenue)}
                    </div>
                    <div 
                      className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-primary-dark"
                      style={{ height: `${height}%` }}
                      title={`${new Date(day.date).toLocaleDateString('pt-BR')}: ${formatCurrency(day.revenue)}`}
                    ></div>
                    <div className="text-xs text-text-color mt-2 transform rotate-45">
                      {new Date(day.date).getDate()}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Status dos Pedidos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-color-dark">Status dos Pedidos</h3>
              <PieChart className="h-5 w-5 text-text-color" />
            </div>
            
            <div className="space-y-4">
              {reportData.ordersByStatus.map((status, index) => {
                const colors = ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-red-500']
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                      <span className="text-text-color-dark">{status.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-text-color">{status.count}</span>
                      <span className="text-sm text-text-color">({formatPercentage(status.percentage)})</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Produtos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-accent/20 overflow-hidden"
          >
            <div className="p-6 border-b border-accent/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-color-dark">Top Produtos</h3>
                <Package className="h-5 w-5 text-text-color" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                      Vendas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                      Receita
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent/20">
                  {reportData.topProducts.map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary font-semibold text-sm">{index + 1}</span>
                          </div>
                          <div className="text-sm font-medium text-text-color-dark">
                            {product.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">
                        {product.sales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-color-dark">
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Top Categorias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-accent/20 overflow-hidden"
          >
            <div className="p-6 border-b border-accent/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-color-dark">Top Categorias</h3>
                <Star className="h-5 w-5 text-text-color" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                      Vendas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                      Receita
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent/20">
                  {reportData.topCategories.map((category, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-secondary/10 rounded-full flex items-center justify-center mr-3">
                            <span className="text-secondary font-semibold text-sm">{index + 1}</span>
                          </div>
                          <div className="text-sm font-medium text-text-color-dark">
                            {category.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">
                        {category.sales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-color-dark">
                        {formatCurrency(category.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminReports