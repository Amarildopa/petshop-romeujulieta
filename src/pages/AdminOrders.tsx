import React, { useState, useEffect, useCallback } from 'react';
import { ordersService, type Order } from '../services/ordersService';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  User,
  MapPin,
  Mail,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderWithCustomer extends Order {
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface OrderDetails extends Order {
  items: Array<{
    id: string;
    product_name: string;
    product_description: string;
    product_image_url: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  customer: {
    full_name: string;
    email: string;
  } | null;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    searchTerm: '',
    dateFrom: '',
    dateTo: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'pending', label: 'Pendente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'processing', label: 'Processando' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregue' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const paymentStatusOptions = [
    { value: '', label: 'Todos os Pagamentos' },
    { value: 'pending', label: 'Pendente' },
    { value: 'paid', label: 'Pago' },
    { value: 'failed', label: 'Falhou' },
    { value: 'refunded', label: 'Reembolsado' }
  ];

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ordersService.getOrdersWithFilters({
        status: filters.status || undefined,
        paymentStatus: filters.paymentStatus || undefined,
        searchTerm: filters.searchTerm || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        limit: 100
      });
      setOrders(data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = async () => {
    try {
      const counts = await ordersService.getOrdersCountByStatus();
      const total = await ordersService.getOrdersCount();
      
      setStats({
        total,
        pending: counts.pending || 0,
        confirmed: counts.confirmed || 0,
        processing: counts.processing || 0,
        shipped: counts.shipped || 0,
        delivered: counts.delivered || 0,
        cancelled: counts.cancelled || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadOrderDetails = async (orderId: string) => {
    try {
      const orderDetails = await ordersService.getOrderWithDetails(orderId);
      if (orderDetails) {
        setSelectedOrder(orderDetails);
        setShowOrderModal(true);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do pedido:', error);
      toast.error('Erro ao carregar detalhes do pedido');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await ordersService.updateOrderStatus(orderId, newStatus);
      toast.success('Status do pedido atualizado com sucesso!');
      loadOrders();
      loadStats();
      
      // Atualizar o pedido selecionado se estiver aberto
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await ordersService.getOrderWithDetails(orderId);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do pedido');
    }
  };

  const addTrackingCode = async (orderId: string, trackingCode: string) => {
    try {
      await ordersService.addTrackingCode(orderId, trackingCode);
      toast.success('Código de rastreamento adicionado com sucesso!');
      loadOrders();
      loadStats();
      
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await ordersService.getOrderWithDetails(orderId);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar código de rastreamento:', error);
      toast.error('Erro ao adicionar código de rastreamento');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-purple-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-orange-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [filters, loadOrders]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      paymentStatus: '',
      searchTerm: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Pedidos</h1>
        <p className="text-gray-600">Gerencie todos os pedidos da loja</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmados</p>
              <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processando</p>
              <p className="text-2xl font-bold text-purple-600">{stats.processing}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enviados</p>
              <p className="text-2xl font-bold text-orange-600">{stats.shipped}</p>
            </div>
            <Truck className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entregues</p>
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelados</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por número, cliente..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <select
            value={filters.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {paymentStatusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                      Carregando pedidos...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.order_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.profiles?.full_name || 'Cliente não encontrado'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.profiles?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {statusOptions.find(s => s.value === order.status)?.label || order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                        {paymentStatusOptions.find(p => p.value === order.payment_status)?.label || order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(order.final_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => loadOrderDetails(order.id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          title="Alterar status"
                        >
                          {statusOptions.slice(1).map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Pedido #{selectedOrder.order_number}
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Pedido</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Data:</span>
                        <span className="text-sm font-medium text-gray-900 ml-2">
                          {formatDate(selectedOrder.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        {getStatusIcon(selectedOrder.status)}
                        <span className="text-sm text-gray-600 ml-2">Status:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {statusOptions.find(s => s.value === selectedOrder.status)?.label || selectedOrder.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Pagamento:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                          {paymentStatusOptions.find(p => p.value === selectedOrder.payment_status)?.label || selectedOrder.payment_status}
                        </span>
                      </div>
                      
                      {selectedOrder.tracking_code && (
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600">Rastreamento:</span>
                          <span className="text-sm font-medium text-gray-900 ml-2">
                            {selectedOrder.tracking_code}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  {selectedOrder.customer && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Cliente</h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {selectedOrder.customer.full_name}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600">
                            {selectedOrder.customer.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  {selectedOrder.shipping_address && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Endereço de Entrega</h3>
                      
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-gray-500 mr-2 mt-1" />
                        <div className="text-sm text-gray-600">
                          {typeof selectedOrder.shipping_address === 'string' 
                            ? selectedOrder.shipping_address 
                            : JSON.stringify(selectedOrder.shipping_address, null, 2)
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Itens do Pedido</h3>
                    
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                          {item.product_image_url && (
                            <img
                              src={item.product_image_url}
                              alt={item.product_name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.product_name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Qtd: {item.quantity} × {formatCurrency(item.unit_price)}
                            </p>
                          </div>
                          
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.total_price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumo do Pedido</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">{formatCurrency(selectedOrder.total_amount)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Frete:</span>
                        <span className="text-gray-900">{formatCurrency(selectedOrder.shipping_cost)}</span>
                      </div>
                      
                      {selectedOrder.discount_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Desconto:</span>
                          <span className="text-green-600">-{formatCurrency(selectedOrder.discount_amount)}</span>
                        </div>
                      )}
                      
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-lg font-semibold">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-gray-900">{formatCurrency(selectedOrder.final_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Ações</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Status:</label>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {statusOptions.slice(1).map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      {!selectedOrder.tracking_code && selectedOrder.status !== 'cancelled' && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Código de rastreamento"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                if (input.value.trim()) {
                                  addTrackingCode(selectedOrder.id, input.value.trim());
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                              if (input.value.trim()) {
                                addTrackingCode(selectedOrder.id, input.value.trim());
                                input.value = '';
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Adicionar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;