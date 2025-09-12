import { describe, it, expect, vi, beforeEach } from 'vitest'
import { availableSlotsService } from '../availableSlotsService'

// Mock do Supabase
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockGte = vi.fn()
const mockLte = vi.fn()
const mockSingle = vi.fn()
const mockOrder = vi.fn()
const mockGetUser = vi.fn()

const mockSupabase = {
  from: mockFrom,
  auth: {
    getUser: mockGetUser
  }
}

// Mock do módulo supabase
vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}))

describe('AvailableSlotsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete
    })
  })

  describe('getAvailableSlots', () => {
    it('should return available slots for a service with specific date', async () => {
      const mockSlots = [
        {
          id: '1',
          service_id: 'service1',
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '10:00',
          is_available: true,
          max_appointments: 1,
          current_appointments: 0
        }
      ]

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          eq: mockEq.mockReturnValue({
            eq: mockEq.mockReturnValue({
              order: mockOrder.mockReturnValue({
                order: mockOrder.mockResolvedValue({ data: mockSlots, error: null })
              })
            })
          })
        })
      })

      const result = await availableSlotsService.getAvailableSlots('service1', '2024-01-15')

      expect(mockFrom).toHaveBeenCalledWith('available_slots_pet')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('service_id', 'service1')
      expect(mockEq).toHaveBeenCalledWith('is_available', true)
      expect(mockEq).toHaveBeenCalledWith('date', '2024-01-15')
      expect(result).toEqual(mockSlots)
    })

    it('should return available slots for next 30 days when no date provided', async () => {
      const mockSlots = [
        {
          id: '1',
          service_id: 'service1',
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '10:00',
          is_available: true
        }
      ]

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          eq: mockEq.mockReturnValue({
            gte: mockGte.mockReturnValue({
              lte: mockLte.mockReturnValue({
                order: mockOrder.mockReturnValue({
                  order: mockOrder.mockResolvedValue({ data: mockSlots, error: null })
                })
              })
            })
          })
        })
      })

      const result = await availableSlotsService.getAvailableSlots('service1')

      expect(mockGte).toHaveBeenCalled()
      expect(mockLte).toHaveBeenCalled()
      expect(result).toEqual(mockSlots)
    })

    it('should throw error when Supabase returns error', async () => {
      const mockError = { message: 'Database error' }

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          eq: mockEq.mockReturnValue({
            eq: mockEq.mockReturnValue({
              order: mockOrder.mockReturnValue({
                order: mockOrder.mockResolvedValue({ data: null, error: mockError })
              })
            })
          })
        })
      })

      await expect(availableSlotsService.getAvailableSlots('service1', '2024-01-15'))
        .rejects.toThrow('Erro ao buscar horários disponíveis: Database error')
    })
  })

  describe('getAvailableSlotsByDateRange', () => {
    it('should return slots within date range', async () => {
      const mockSlots = [
        {
          id: '1',
          service_id: 'service1',
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '10:00',
          is_available: true
        }
      ]

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          eq: mockEq.mockReturnValue({
            gte: mockGte.mockReturnValue({
              lte: mockLte.mockReturnValue({
                order: mockOrder.mockReturnValue({
                  order: mockOrder.mockResolvedValue({ data: mockSlots, error: null })
                })
              })
            })
          })
        })
      })

      const result = await availableSlotsService.getAvailableSlotsByDateRange(
        'service1', '2024-01-15', '2024-01-20'
      )

      expect(mockGte).toHaveBeenCalledWith('date', '2024-01-15')
      expect(mockLte).toHaveBeenCalledWith('date', '2024-01-20')
      expect(result).toEqual(mockSlots)
    })
  })

  describe('getAvailableSlotsByTime', () => {
    it('should return slots within time range', async () => {
      const mockSlots = [
        {
          id: '1',
          service_id: 'service1',
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '10:00',
          is_available: true
        }
      ]

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          eq: mockEq.mockReturnValue({
            eq: mockEq.mockReturnValue({
              gte: mockGte.mockReturnValue({
                lte: mockLte.mockReturnValue({
                  order: mockOrder.mockResolvedValue({ data: mockSlots, error: null })
                })
              })
            })
          })
        })
      })

      const result = await availableSlotsService.getAvailableSlotsByTime(
        'service1', '2024-01-15', '09:00', '17:00'
      )

      expect(mockGte).toHaveBeenCalledWith('start_time', '09:00')
      expect(mockLte).toHaveBeenCalledWith('end_time', '17:00')
      expect(result).toEqual(mockSlots)
    })
  })

  describe('createAvailableSlot', () => {
    it('should create a new available slot', async () => {
      const mockSlot = {
        id: '1',
        service_id: 'service1',
        date: '2024-01-15',
        start_time: '09:00',
        end_time: '10:00',
        is_available: true,
        max_appointments: 1,
        current_appointments: 0
      }

      const slotData = {
        service_id: 'service1',
        date: '2024-01-15',
        start_time: '09:00',
        end_time: '10:00',
        is_available: true,
        max_appointments: 1,
        current_appointments: 0
      }

      mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: mockSlot, error: null })
        })
      })

      const result = await availableSlotsService.createAvailableSlot(slotData)

      expect(mockInsert).toHaveBeenCalledWith(slotData)
      expect(result).toEqual(mockSlot)
    })

    it('should throw error when creation fails', async () => {
      const mockError = { message: 'Creation failed' }

      mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: null, error: mockError })
        })
      })

      const slotData = {
        service_id: 'service1',
        date: '2024-01-15',
        start_time: '09:00',
        end_time: '10:00'
      }

      await expect(availableSlotsService.createAvailableSlot(slotData))
        .rejects.toThrow('Erro ao criar horário disponível: Creation failed')
    })
  })

  describe('createMultipleSlots', () => {
    it('should create multiple slots', async () => {
      const mockSlots = [
        {
          id: '1',
          service_id: 'service1',
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '10:00'
        },
        {
          id: '2',
          service_id: 'service1',
          date: '2024-01-15',
          start_time: '10:00',
          end_time: '11:00'
        }
      ]

      const slotsData = [
        {
          service_id: 'service1',
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '10:00'
        },
        {
          service_id: 'service1',
          date: '2024-01-15',
          start_time: '10:00',
          end_time: '11:00'
        }
      ]

      mockInsert.mockReturnValue({
        select: mockSelect.mockResolvedValue({ data: mockSlots, error: null })
      })

      const result = await availableSlotsService.createMultipleSlots(slotsData)

      expect(mockInsert).toHaveBeenCalledWith(slotsData)
      expect(result).toEqual(mockSlots)
    })
  })

  describe('updateAvailableSlot', () => {
    it('should update an available slot', async () => {
      const mockUpdatedSlot = {
        id: '1',
        service_id: 'service1',
        date: '2024-01-15',
        start_time: '09:00',
        end_time: '10:00',
        is_available: false
      }

      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: mockUpdatedSlot, error: null })
          })
        })
      })

      const updates = { is_available: false }
      const result = await availableSlotsService.updateAvailableSlot('1', updates)

      expect(mockUpdate).toHaveBeenCalledWith(updates)
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockUpdatedSlot)
    })
  })

  describe('bookSlot', () => {
    it('should book an available slot', async () => {
      const currentSlot = {
        current_appointments: 0,
        max_appointments: 1
      }

      const bookedSlot = {
        id: '1',
        current_appointments: 1,
        is_available: false
      }

      // Mock para buscar slot atual
      mockSelect.mockReturnValueOnce({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: currentSlot, error: null })
        })
      })

      // Mock para atualizar slot
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: bookedSlot, error: null })
          })
        })
      })

      const result = await availableSlotsService.bookSlot('1')

      expect(mockUpdate).toHaveBeenCalledWith({
        current_appointments: 1,
        is_available: false
      })
      expect(result).toEqual(bookedSlot)
    })

    it('should throw error when slot is not available', async () => {
      const currentSlot = {
        current_appointments: 1,
        max_appointments: 1
      }

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: currentSlot, error: null })
        })
      })

      await expect(availableSlotsService.bookSlot('1'))
        .rejects.toThrow('Slot não está mais disponível')
    })
  })

  describe('releaseSlot', () => {
    it('should release a booked slot', async () => {
      const currentSlot = {
        current_appointments: 1,
        max_appointments: 1
      }

      const releasedSlot = {
        id: '1',
        current_appointments: 0,
        is_available: true
      }

      // Mock para buscar slot atual
      mockSelect.mockReturnValueOnce({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: currentSlot, error: null })
        })
      })

      // Mock para atualizar slot
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: releasedSlot, error: null })
          })
        })
      })

      const result = await availableSlotsService.releaseSlot('1')

      expect(mockUpdate).toHaveBeenCalledWith({
        current_appointments: 0,
        is_available: true
      })
      expect(result).toEqual(releasedSlot)
    })

    it('should throw error when slot is already released', async () => {
      const currentSlot = {
        current_appointments: 0,
        max_appointments: 1
      }

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: currentSlot, error: null })
        })
      })

      await expect(availableSlotsService.releaseSlot('1'))
        .rejects.toThrow('Slot já está liberado')
    })
  })

  describe('deleteAvailableSlot', () => {
    it('should delete an available slot', async () => {
      mockDelete.mockReturnValue({
        eq: mockEq.mockResolvedValue({ error: null })
      })

      await availableSlotsService.deleteAvailableSlot('1')

      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', '1')
    })

    it('should throw error when deletion fails', async () => {
      const mockError = { message: 'Deletion failed' }

      mockDelete.mockReturnValue({
        eq: mockEq.mockResolvedValue({ error: mockError })
      })

      await expect(availableSlotsService.deleteAvailableSlot('1'))
        .rejects.toThrow('Erro ao deletar horário disponível: Deletion failed')
    })
  })

  describe('generateSlotsForService', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-id' } }
      })
    })

    it('should generate slots for a service', async () => {
      const mockGeneratedSlots = [
        {
          id: '1',
          service_id: 'service1',
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '10:00',
          is_available: true,
          max_appointments: 1,
          current_appointments: 0,
          created_by: 'user-id'
        }
      ]

      mockInsert.mockReturnValue({
        select: mockSelect.mockResolvedValue({ data: mockGeneratedSlots, error: null })
      })

      const result = await availableSlotsService.generateSlotsForService(
        'service1',
        '2024-01-15',
        '2024-01-15',
        '09:00',
        '11:00',
        60,
        1
      )

      expect(mockInsert).toHaveBeenCalled()
      expect(result).toEqual(mockGeneratedSlots)
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null }
      })

      await expect(availableSlotsService.generateSlotsForService(
        'service1',
        '2024-01-15',
        '2024-01-15',
        '09:00',
        '11:00'
      )).rejects.toThrow('Usuário não autenticado')
    })
  })
})