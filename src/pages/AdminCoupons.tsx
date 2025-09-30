import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Ticket, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Percent,
  DollarSign,
  Truck,
  Copy,
  Users
} from 'lucide-react'
import { couponsService, Coupon, CouponInsert } from '../services/couponsService'
import { toast } from 'sonner'
import { logger } from '../lib/logger'

const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'bulk'>('view')
  const [formData, setFormData] = useState<Partial<CouponInsert>>({
    code: '',
    description: '',
    type: 'percentage',
    value: 0,
    min_order_amount: 0,
    max_discount_amount: null,
    usage_limit: null,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: null,
    is_active: true
  })
  const [bulkData, setBulkData] = useState({
    count: 10,
    prefix: 'PET',
    baseData: {
      description: '',
      type: 'percentage' as const,
      value: 10,
      min_order_amount: 50,
      usage_limit: 1,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: null,
      is_active: true
    }
  })

  const loadCoupons = async () => {
    try {
      setLoading(true)
      const data = await couponsService.getActiveCoupons()
      setCoupons(data)
      logger.info('Coupons loaded', { count: data.length }, 'ADMIN')
    } catch (error) {
      logger.error('Error loading coupons', error as Error, {}, 'ADMIN')
      toast.error('Erro ao carregar cupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || coupon.type === typeFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && coupon.is_active) ||
                         (statusFilter === 'inactive' && !coupon.is_active) ||
                         (statusFilter === 'expired' && coupon.valid_until && new Date(coupon.valid_until) < new Date())
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateCoupon = () => {
    setSelectedCoupon(null)
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: 0,
      min_order_amount: 0,
      max_discount_amount: null,
      usage_limit: null,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: null,
      is_active: true
    })
    setModalType('create')
    setShowModal(true)
  }

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      min_order_amount: coupon.min_order_amount,
      max_discount_amount: coupon.max_discount_amount,
      usage_limit: coupon.usage_limit,
      valid_from: coupon.valid_from.split('T')[0],
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : null,
      is_active: coupon.is_active
    })
    setModalType('edit')
    setShowModal(true)
  }

  const handleViewCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setModalType('view')
    setShowModal(true)
  }

  const handleBulkCreate = () => {
    setModalType('bulk')
    setShowModal(true)
  }

  const handleDeleteCoupon = async (couponId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cupom?')) {
      try {
        await couponsService.deleteCoupon(couponId)
        await loadCoupons()
        toast.success('Cupom excluído com sucesso')
        logger.info('Coupon deleted', { couponId }, 'ADMIN')
      } catch (error) {
        logger.error('Error deleting coupon', error as Error, { couponId }, 'ADMIN')
        toast.error('Erro ao excluir cupom')
      }
    }
  }

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      await couponsService.toggleCouponStatus(coupon.id)
      await loadCoupons()
      toast.success(`Cupom ${coupon.is_active ? 'desativado' : 'ativado'} com sucesso`)
      logger.info('Coupon status toggled', { couponId: coupon.id, isActive: !coupon.is_active }, 'ADMIN')
    } catch (error) {
      logger.error('Error toggling coupon status', error as Error, { couponId: coupon.id }, 'ADMIN')
      toast.error('Erro ao alterar status do cupom')
    }
  }

  const handleSaveCoupon = async () => {
    try {
      if (modalType === 'create') {
        await couponsService.createCoupon(formData as CouponInsert)
        toast.success('Cupom criado com sucesso')
      } else if (modalType === 'edit' && selectedCoupon) {
        await couponsService.updateCoupon(selectedCoupon.id, formData)
        toast.success('Cupom atualizado com sucesso')
      }
      await loadCoupons()
      setShowModal(false)
    } catch (error) {
      logger.error('Error saving coupon', error as Error, {}, 'ADMIN')
      toast.error('Erro ao salvar cupom')
    }
  }

  const handleBulkSave = async () => {
    try {
      await couponsService.createBulkCoupons(
        bulkData.count,
        bulkData.prefix,
        bulkData.baseData
      )
      toast.success(`${bulkData.count} cupons criados com sucesso`)
      await loadCoupons()
      setShowModal(false)
    } catch (error) {
      logger.error('Error creating bulk coupons', error as Error, {}, 'ADMIN')
      toast.error('Erro ao criar cupons em lote')
    }
  }

  const generateCode = async () => {
    try {
      const code = await couponsService.generateCouponCode()
      setFormData({ ...formData, code })
    } catch {
      toast.error('Erro ao gerar código')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Código copiado!')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="h-4 w-4 text-blue-600" />
      case 'fixed_amount': return <DollarSign className="h-4 w-4 text-green-600" />
      case 'free_shipping': return <Truck className="h-4 w-4 text-purple-600" />
      default: return <Ticket className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return 'Porcentagem'
      case 'fixed_amount': return 'Valor Fixo'
      case 'free_shipping': return 'Frete Grátis'
      default: return type
    }
  }

  const formatValue = (coupon: Coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}%`
    } else if (coupon.type === 'fixed_amount') {
      return `R$ ${coupon.value.toFixed(2)}`
    } else {
      return 'Frete Grátis'
    }
  }

  const isExpired = (coupon: Coupon) => {
    return coupon.valid_until && new Date(coupon.valid_until) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-color">Carregando cupons...</p>
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
              Gestão de Cupons
            </h1>
            <p className="text-text-color">
              Gerencie cupons de desconto e promoções
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleBulkCreate}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Users className="h-4 w-4 mr-2" />
              Criar em Lote
            </button>
            <button
              onClick={handleCreateCoupon}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Cupom
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-accent/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-color" />
              <input
                type="text"
                placeholder="Buscar por código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Filtrar por tipo"
            >
              <option value="all">Todos os tipos</option>
              <option value="percentage">Porcentagem</option>
              <option value="fixed_amount">Valor Fixo</option>
              <option value="free_shipping">Frete Grátis</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Filtrar por status"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="expired">Expirados</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-text-color" />
              <span className="text-sm text-text-color">
                {filteredCoupons.length} de {coupons.length} cupons
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Cupons */}
        <div className="bg-white rounded-2xl shadow-lg border border-accent/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Cupom
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Uso
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Validade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-color uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/20">
                {filteredCoupons.map((coupon) => (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-text-color-dark font-mono bg-gray-100 px-2 py-1 rounded">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copiar código"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-sm text-text-color mt-1">
                          {coupon.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(coupon.type)}
                        <span className="text-sm text-text-color-dark">
                          {getTypeLabel(coupon.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-color-dark">
                        {formatValue(coupon)}
                      </div>
                      {coupon.min_order_amount > 0 && (
                        <div className="text-xs text-text-color">
                          Mín: R$ {coupon.min_order_amount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-color-dark">
                        {coupon.used_count || 0}
                        {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                      </div>
                      {coupon.usage_limit && (
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full" 
                            style={{ width: `${Math.min(((coupon.used_count || 0) / coupon.usage_limit) * 100, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-color-dark">
                        {new Date(coupon.valid_from).toLocaleDateString('pt-BR')}
                      </div>
                      {coupon.valid_until && (
                        <div className={`text-xs ${
                          isExpired(coupon) ? 'text-red-600' : 'text-text-color'
                        }`}>
                          até {new Date(coupon.valid_until).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {coupon.is_active && !isExpired(coupon) ? (
                          <div className="flex items-center text-green-600">
                            <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                            <span className="text-sm">Ativo</span>
                          </div>
                        ) : isExpired(coupon) ? (
                          <div className="flex items-center text-red-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="text-sm">Expirado</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-600">
                            <div className="w-2 h-2 bg-gray-600 rounded-full mr-2"></div>
                            <span className="text-sm">Inativo</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewCoupon(coupon)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditCoupon(coupon)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(coupon)}
                          className={coupon.is_active ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                          title={coupon.is_active ? "Desativar" : "Ativar"}
                        >
                          {coupon.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCoupons.length === 0 && (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-text-color mx-auto mb-4" />
              <p className="text-text-color">Nenhum cupom encontrado</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-color-dark">
                  {modalType === 'create' ? 'Criar Cupom' :
                   modalType === 'edit' ? 'Editar Cupom' :
                   modalType === 'bulk' ? 'Criar Cupons em Lote' : 'Detalhes do Cupom'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-text-color hover:text-text-color-dark"
                >
                  ×
                </button>
              </div>

              {modalType === 'view' && selectedCoupon ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Código</label>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono bg-gray-100 px-3 py-2 rounded text-text-color-dark">
                          {selectedCoupon.code}
                        </span>
                        <button
                          onClick={() => copyCode(selectedCoupon.code)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Tipo</label>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(selectedCoupon.type)}
                        <span>{getTypeLabel(selectedCoupon.type)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1">Descrição</label>
                    <p className="text-text-color-dark">{selectedCoupon.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Valor</label>
                      <p className="text-text-color-dark font-medium">{formatValue(selectedCoupon)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Pedido Mínimo</label>
                      <p className="text-text-color-dark">R$ {selectedCoupon.min_order_amount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Limite de Uso</label>
                      <p className="text-text-color-dark">
                        {selectedCoupon.usage_limit ? selectedCoupon.usage_limit : 'Ilimitado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Usado</label>
                      <p className="text-text-color-dark">{selectedCoupon.used_count || 0} vezes</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Válido de</label>
                      <p className="text-text-color-dark">
                        {new Date(selectedCoupon.valid_from).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Válido até</label>
                      <p className="text-text-color-dark">
                        {selectedCoupon.valid_until ? 
                          new Date(selectedCoupon.valid_until).toLocaleDateString('pt-BR') : 
                          'Sem expiração'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ) : modalType === 'bulk' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={bulkData.count}
                        onChange={(e) => setBulkData({...bulkData, count: parseInt(e.target.value) || 1})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Prefixo</label>
                      <input
                        type="text"
                        value={bulkData.prefix}
                        onChange={(e) => setBulkData({...bulkData, prefix: e.target.value.toUpperCase()})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1">Descrição</label>
                    <input
                      type="text"
                      value={bulkData.baseData.description}
                      onChange={(e) => setBulkData({...bulkData, baseData: {...bulkData.baseData, description: e.target.value}})}
                      className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Descrição dos cupons"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Tipo</label>
                      <select
                        value={bulkData.baseData.type}
                        onChange={(e) => setBulkData({...bulkData, baseData: {...bulkData.baseData, type: e.target.value as "percentage" | "fixed_amount" | "free_shipping"}})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="percentage">Porcentagem</option>
                        <option value="fixed_amount">Valor Fixo</option>
                        <option value="free_shipping">Frete Grátis</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">
                        {bulkData.baseData.type === 'percentage' ? 'Porcentagem (%)' : 'Valor (R$)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step={bulkData.baseData.type === 'percentage' ? '1' : '0.01'}
                        value={bulkData.baseData.value}
                        onChange={(e) => setBulkData({...bulkData, baseData: {...bulkData.baseData, value: parseFloat(e.target.value) || 0}})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={bulkData.baseData.type === 'free_shipping'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Pedido Mínimo (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={bulkData.baseData.min_order_amount}
                        onChange={(e) => setBulkData({...bulkData, baseData: {...bulkData.baseData, min_order_amount: parseFloat(e.target.value) || 0}})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Limite de Uso</label>
                      <input
                        type="number"
                        min="1"
                        value={bulkData.baseData.usage_limit || ''}
                        onChange={(e) => setBulkData({...bulkData, baseData: {...bulkData.baseData, usage_limit: parseInt(e.target.value) || null}})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Ilimitado"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Válido de</label>
                      <input
                        type="date"
                        value={bulkData.baseData.valid_from}
                        onChange={(e) => setBulkData({...bulkData, baseData: {...bulkData.baseData, valid_from: e.target.value}})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Válido até</label>
                      <input
                        type="date"
                        value={bulkData.baseData.valid_until || ''}
                        onChange={(e) => setBulkData({...bulkData, baseData: {...bulkData.baseData, valid_until: e.target.value || null}})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Código</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                          className="flex-1 px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                          placeholder="CODIGO"
                        />
                        <button
                          type="button"
                          onClick={generateCode}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Gerar código"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Tipo</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value as "percentage" | "fixed_amount" | "free_shipping"})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="percentage">Porcentagem</option>
                        <option value="fixed_amount">Valor Fixo</option>
                        <option value="free_shipping">Frete Grátis</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1">Descrição</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Descrição do cupom"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">
                        {formData.type === 'percentage' ? 'Porcentagem (%)' : 'Valor (R$)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step={formData.type === 'percentage' ? '1' : '0.01'}
                        value={formData.value}
                        onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={formData.type === 'free_shipping'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Pedido Mínimo (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.min_order_amount}
                        onChange={(e) => setFormData({...formData, min_order_amount: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Desconto Máximo (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.max_discount_amount || ''}
                        onChange={(e) => setFormData({...formData, max_discount_amount: parseFloat(e.target.value) || null})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Sem limite"
                        disabled={formData.type !== 'percentage'}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Limite de Uso</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.usage_limit || ''}
                        onChange={(e) => setFormData({...formData, usage_limit: parseInt(e.target.value) || null})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Ilimitado"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Válido de</label>
                      <input
                        type="date"
                        value={formData.valid_from}
                        onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1">Válido até</label>
                      <input
                        type="date"
                        value={formData.valid_until || ''}
                        onChange={(e) => setFormData({...formData, valid_until: e.target.value || null})}
                        className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="mr-2" 
                      />
                      <span className="text-sm text-text-color">Cupom ativo</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-text-color border border-accent rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {modalType === 'view' ? 'Fechar' : 'Cancelar'}
                </button>
                {modalType !== 'view' && (
                  <button 
                    onClick={modalType === 'bulk' ? handleBulkSave : handleSaveCoupon}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    {modalType === 'create' ? 'Criar' : modalType === 'bulk' ? 'Criar Cupons' : 'Salvar'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCoupons