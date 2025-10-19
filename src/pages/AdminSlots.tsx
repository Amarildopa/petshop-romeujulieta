import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  RefreshCw,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Users
} from 'lucide-react'
import { availableSlotsService, AvailableSlot } from '../services/availableSlotsService'
import { supabase } from '../lib/supabase'

interface Service {
  id: string
  name: string
  description: string
  duration: string
  category: string
}

interface GenerateSlotForm {
  serviceId: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  durationMinutes: number
  maxAppointments: number
}

const AdminSlots: React.FC = () => {
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [editingSlot, setEditingSlot] = useState<AvailableSlot | null>(null)
  const [filters, setFilters] = useState({
    serviceId: '',
    date: '',
    status: 'all' // all, available, occupied
  })
  
  const [generateForm, setGenerateForm] = useState<GenerateSlotForm>({
    serviceId: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    durationMinutes: 60,
    maxAppointments: 1
  })

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    loadSlots()
  }, [filters])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadServices(),
        loadSlots()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services_pet')
        .select('id, name, description, duration, category')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    }
  }

  const loadSlots = async () => {
    try {
      let query = supabase
        .from('available_slots_pet')
        .select(`
          *,
          services_pet (
            name,
            category
          )
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      // Aplicar filtros
      if (filters.serviceId) {
        query = query.eq('service_id', filters.serviceId)
      }

      if (filters.date) {
        query = query.eq('date', filters.date)
      }

      if (filters.status === 'available') {
        query = query.eq('is_available', true)
      } else if (filters.status === 'occupied') {
        query = query.eq('is_available', false)
      }

      const { data, error } = await query

      if (error) throw error
      setSlots(data || [])
    } catch (error) {
      console.error('Erro ao carregar slots:', error)
    }
  }

  const handleGenerateSlots = async () => {
    try {
      if (!generateForm.serviceId || !generateForm.startDate || !generateForm.endDate) {
        alert('Preencha todos os campos obrigatórios')
        return
      }

      setLoading(true)
      
      await availableSlotsService.generateSlotsForService(
        generateForm.serviceId,
        generateForm.startDate,
        generateForm.endDate,
        generateForm.startTime,
        generateForm.endTime,
        generateForm.durationMinutes,
        generateForm.maxAppointments
      )

      setShowGenerateForm(false)
      setGenerateForm({
        serviceId: '',
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '17:00',
        durationMinutes: 60,
        maxAppointments: 1
      })
      
      await loadSlots()
      alert('Slots gerados com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar slots:', error)
      alert('Erro ao gerar slots: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Tem certeza que deseja deletar este slot?')) return

    try {
      await availableSlotsService.deleteAvailableSlot(slotId)
      await loadSlots()
      alert('Slot deletado com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar slot:', error)
      alert('Erro ao deletar slot: ' + (error as Error).message)
    }
  }

  const handleUpdateSlot = async (slot: AvailableSlot) => {
    try {
      await availableSlotsService.updateAvailableSlot(slot.id, {
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        max_appointments: slot.max_appointments,
        is_available: slot.is_available
      })
      
      setEditingSlot(null)
      await loadSlots()
      alert('Slot atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar slot:', error)
      alert('Erro ao atualizar slot: ' + (error as Error).message)
    }
  }

  const getStatusColor = (slot: AvailableSlot) => {
    if (!slot.is_available) return 'text-red-600 bg-red-50'
    if (slot.current_appointments >= slot.max_appointments) return 'text-orange-600 bg-orange-50'
    return 'text-green-600 bg-green-50'
  }

  const getStatusText = (slot: AvailableSlot) => {
    if (!slot.is_available) return 'Indisponível'
    if (slot.current_appointments >= slot.max_appointments) return 'Lotado'
    return 'Disponível'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-color">Carregando slots de agendamento...</p>
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
            <h1 className="text-3xl font-bold text-text-color-dark flex items-center">
              <Calendar className="h-8 w-8 text-primary mr-3" />
              Gerenciar Slots de Agendamento
            </h1>
            <p className="text-text-color mt-2">
              Gerencie horários disponíveis para agendamentos de serviços
            </p>
          </div>
          
          <button
            onClick={() => setShowGenerateForm(true)}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Gerar Slots</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-accent/20 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Serviço
              </label>
              <select
                value={filters.serviceId}
                onChange={(e) => setFilters(prev => ({ ...prev, serviceId: e.target.value }))}
                className="w-full px-3 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Todos os serviços</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Data
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">Todos</option>
                <option value="available">Disponíveis</option>
                <option value="occupied">Ocupados</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadSlots}
                className="w-full bg-accent text-text-color-dark px-4 py-2 rounded-lg hover:bg-accent/80 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Slots */}
        <div className="bg-white rounded-lg shadow-sm border border-accent/20">
          <div className="p-6 border-b border-accent/20">
            <h2 className="text-xl font-semibold text-text-color-dark">
              Slots Disponíveis ({slots.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {slots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-text-color-dark">
                          {(slot as any).services_pet?.name || 'Serviço não encontrado'}
                        </div>
                        <div className="text-sm text-text-color">
                          {(slot as any).services_pet?.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color-dark">
                      {new Date(slot.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color-dark">
                      {slot.start_time} - {slot.end_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-text-color" />
                        <span className="text-sm text-text-color-dark">
                          {slot.current_appointments}/{slot.max_appointments}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(slot)}`}>
                        {getStatusText(slot)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingSlot(slot)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {slots.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-text-color">Nenhum slot encontrado</p>
                <p className="text-text-color/60 text-sm">
                  Ajuste os filtros ou gere novos slots
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Gerar Slots */}
        {showGenerateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-text-color-dark">
                    Gerar Novos Slots
                  </h3>
                  <button
                    onClick={() => setShowGenerateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Serviço *
                    </label>
                    <select
                      value={generateForm.serviceId}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, serviceId: e.target.value }))}
                      className="w-full px-3 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    >
                      <option value="">Selecione um serviço</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Data Início *
                      </label>
                      <input
                        type="date"
                        value={generateForm.startDate}
                        onChange={(e) => setGenerateForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Data Fim *
                      </label>
                      <input
                        type="date"
                        value={generateForm.endDate}
                        onChange={(e) => setGenerateForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Horário Início
                      </label>
                      <input
                        type="time"
                        value={generateForm.startTime}
                        onChange={(e) => setGenerateForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Horário Fim
                      </label>
                      <input
                        type="time"
                        value={generateForm.endTime}
                        onChange={(e) => setGenerateForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Duração (minutos)
                      </label>
                      <input
                        type="number"
                        value={generateForm.durationMinutes}
                        onChange={(e) => setGenerateForm(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        min="15"
                        step="15"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Capacidade Máxima
                      </label>
                      <input
                        type="number"
                        value={generateForm.maxAppointments}
                        onChange={(e) => setGenerateForm(prev => ({ ...prev, maxAppointments: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowGenerateForm(false)}
                    className="flex-1 px-4 py-2 border border-accent/30 text-text-color-dark rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGenerateSlots}
                    disabled={loading}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>Gerar Slots</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Editar Slot */}
        {editingSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-text-color-dark">
                    Editar Slot
                  </h3>
                  <button
                    onClick={() => setEditingSlot(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Data
                    </label>
                    <input
                      type="date"
                      value={editingSlot.date}
                      onChange={(e) => setEditingSlot(prev => prev ? { ...prev, date: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Horário Início
                      </label>
                      <input
                        type="time"
                        value={editingSlot.start_time}
                        onChange={(e) => setEditingSlot(prev => prev ? { ...prev, start_time: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Horário Fim
                      </label>
                      <input
                        type="time"
                        value={editingSlot.end_time}
                        onChange={(e) => setEditingSlot(prev => prev ? { ...prev, end_time: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Capacidade Máxima
                    </label>
                    <input
                      type="number"
                      value={editingSlot.max_appointments}
                      onChange={(e) => setEditingSlot(prev => prev ? { ...prev, max_appointments: parseInt(e.target.value) } : null)}
                      className="w-full px-3 py-2 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      min="1"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_available"
                      checked={editingSlot.is_available}
                      onChange={(e) => setEditingSlot(prev => prev ? { ...prev, is_available: e.target.checked } : null)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="is_available" className="ml-2 block text-sm text-text-color-dark">
                      Slot disponível para agendamento
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setEditingSlot(null)}
                    className="flex-1 px-4 py-2 border border-accent/30 text-text-color-dark rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleUpdateSlot(editingSlot)}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Salvar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSlots