import { describe, it, expect, vi, beforeEach } from 'vitest'
import { appointmentsService } from '../appointmentsService'
import { supabase } from '../../lib/supabase'

// Mock do Supabase
vi.mock('../../lib/supabase', () => {
  const mockSelect = vi.fn()
  const mockFrom = vi.fn()
  const mockEq = vi.fn()
  const mockGte = vi.fn()
  const mockIn = vi.fn()
  const mockOrder = vi.fn()
  const mockInsert = vi.fn()
  const mockUpdate = vi.fn()
  const mockSingle = vi.fn()
  const mockGetUser = vi.fn()

  return {
    supabase: {
      from: mockFrom,
      auth: {
        getUser: mockGetUser
      }
    },
    mockFrom,
    mockSelect,
    mockEq,
    mockGte,
    mockIn,
    mockOrder,
    mockInsert,
    mockUpdate,
    mockSingle,
    mockGetUser
  }
})

const {
  mockFrom,
  mockSelect,
  mockEq,
  mockGte,
  mockIn,
  mockOrder,
  mockInsert,
  mockUpdate,
  mockSingle,
  mockGetUser
} = vi.mocked(await import('../../lib/supabase'))

// Mock Date para testes consistentes
const mockDate = new Date('2024-01-15T10:00:00.000Z')
vi.setSystemTime(mockDate)

describe('appointmentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAppointments', () => {
    it('should return all appointments', async () => {
      const mockAppointments = [
        {
          id: '1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          user_id: 'user-123',
          pet_id: 'pet-1',
          service_id: 'service-1',
          appointment_date: '2024-01-20',
          appointment_time: '10:00',
          status: 'confirmed',
          notes: 'Test appointment',
          total_price: 50,
          extras: [],
          pet: {
            name: 'Rex',
            breed: 'Golden Retriever',
            image_url: null
          },
          service: {
            name: 'Banho e Tosa',
            description: 'Serviço completo',
            duration: '2h'
          }
        }
      ]

      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: mockAppointments, error: null })
        })
      })

      const result = await appointmentsService.getAppointments()

      expect(mockFrom).toHaveBeenCalledWith('appointments_pet')
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('pet:pets_pet'))
      expect(mockOrder).toHaveBeenCalledWith('appointment_date', { ascending: true })
      expect(result).toEqual(mockAppointments)
    })

    it('should return empty array when error occurs', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: null, error: { message: 'Database error' } })
        })
      })

      const result = await appointmentsService.getAppointments()

      expect(result).toEqual([])
    })

    it('should return empty array when exception occurs', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          order: mockOrder.mockRejectedValue(new Error('Network error'))
        })
      })

      const result = await appointmentsService.getAppointments()

      expect(result).toEqual([])
    })
  })

  describe('getUpcomingAppointments', () => {
    it('should return upcoming appointments', async () => {
      const mockAppointments = [
        {
          id: '1',
          appointment_date: '2024-01-20',
          status: 'confirmed'
        }
      ]

      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          gte: mockGte.mockReturnValue({
            in: mockIn.mockReturnValue({
              order: mockOrder.mockResolvedValue({ data: mockAppointments, error: null })
            })
          })
        })
      })

      const result = await appointmentsService.getUpcomingAppointments()

      expect(mockGte).toHaveBeenCalledWith('appointment_date', '2024-01-15')
      expect(mockIn).toHaveBeenCalledWith('status', ['pending', 'confirmed', 'in_progress'])
      expect(result).toEqual(mockAppointments)
    })

    it('should return empty array when error occurs', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          gte: mockGte.mockReturnValue({
            in: mockIn.mockReturnValue({
              order: mockOrder.mockResolvedValue({ data: null, error: { message: 'Error' } })
            })
          })
        })
      })

      const result = await appointmentsService.getUpcomingAppointments()

      expect(result).toEqual([])
    })
  })

  describe('getTodayAppointments', () => {
    it('should return today appointments', async () => {
      const mockAppointments = [
        {
          id: '1',
          appointment_date: '2024-01-15',
          status: 'confirmed'
        }
      ]

      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            in: mockIn.mockResolvedValue({ data: mockAppointments, error: null })
          })
        })
      })

      const result = await appointmentsService.getTodayAppointments()

      expect(mockEq).toHaveBeenCalledWith('appointment_date', '2024-01-15')
      expect(mockIn).toHaveBeenCalledWith('status', ['confirmed', 'in_progress'])
      expect(result).toEqual(mockAppointments)
    })

    it('should return empty array when error occurs', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            in: mockIn.mockResolvedValue({ data: null, error: { message: 'Error' } })
          })
        })
      })

      const result = await appointmentsService.getTodayAppointments()

      expect(result).toEqual([])
    })
  })

  describe('createAppointment', () => {
    it('should throw error when user not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const appointmentData = {
        pet_id: 'pet-1',
        service_id: 'service-1',
        appointment_date: '2024-01-20',
        appointment_time: '10:00',
        total_price: 50
      }

      await expect(appointmentsService.createAppointment(appointmentData)).rejects.toThrow(
        'User not authenticated'
      )
    })

    it('should create appointment successfully', async () => {
      const mockUser = { id: 'user-123' }
      const appointmentData = {
        pet_id: 'pet-1',
        service_id: 'service-1',
        appointment_date: '2024-01-20',
        appointment_time: '10:00',
        total_price: 50,
        notes: 'Test appointment'
      }

      const createdAppointment = {
        id: '1',
        ...appointmentData,
        user_id: 'user-123',
        status: 'pending'
      }

      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.mockReturnValue({
        insert: mockInsert.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: createdAppointment, error: null })
          })
        })
      })

      const result = await appointmentsService.createAppointment(appointmentData)

      expect(mockInsert).toHaveBeenCalledWith({
        ...appointmentData,
        user_id: 'user-123'
      })
      expect(result).toEqual(createdAppointment)
    })

    it('should throw error when creation fails', async () => {
      const mockUser = { id: 'user-123' }
      const appointmentData = {
        pet_id: 'pet-1',
        service_id: 'service-1',
        appointment_date: '2024-01-20',
        appointment_time: '10:00',
        total_price: 50
      }

      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.mockReturnValue({
        insert: mockInsert.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: null, error: { message: 'Creation failed' } })
          })
        })
      })

      await expect(appointmentsService.createAppointment(appointmentData)).rejects.toThrow(
        'Error creating appointment: Creation failed'
      )
    })
  })

  describe('updateAppointmentStatus', () => {
    it('should update appointment status successfully', async () => {
      const updatedAppointment = {
        id: '1',
        status: 'confirmed',
        updated_at: expect.any(String)
      }

      mockFrom.mockReturnValue({
        update: mockUpdate.mockReturnValue({
          eq: mockEq.mockReturnValue({
            select: mockSelect.mockReturnValue({
              single: mockSingle.mockResolvedValue({ data: updatedAppointment, error: null })
            })
          })
        })
      })

      const result = await appointmentsService.updateAppointmentStatus('1', 'confirmed')

      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'confirmed',
        updated_at: expect.any(String)
      })
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(updatedAppointment)
    })

    it('should throw error when update fails', async () => {
      mockFrom.mockReturnValue({
        update: mockUpdate.mockReturnValue({
          eq: mockEq.mockReturnValue({
            select: mockSelect.mockReturnValue({
              single: mockSingle.mockResolvedValue({ data: null, error: { message: 'Update failed' } })
            })
          })
        })
      })

      await expect(appointmentsService.updateAppointmentStatus('1', 'confirmed')).rejects.toThrow(
        'Error updating appointment: Update failed'
      )
    })
  })

  describe('cancelAppointment', () => {
    it('should cancel appointment successfully', async () => {
      mockFrom.mockReturnValue({
        update: mockUpdate.mockReturnValue({
          eq: mockEq.mockResolvedValue({ error: null })
        })
      })

      await expect(appointmentsService.cancelAppointment('1')).resolves.not.toThrow()

      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'cancelled',
        updated_at: expect.any(String)
      })
      expect(mockEq).toHaveBeenCalledWith('id', '1')
    })

    it('should throw error when cancellation fails', async () => {
      mockFrom.mockReturnValue({
        update: mockUpdate.mockReturnValue({
          eq: mockEq.mockResolvedValue({ error: { message: 'Cancellation failed' } })
        })
      })

      await expect(appointmentsService.cancelAppointment('1')).rejects.toThrow(
        'Error cancelling appointment: Cancellation failed'
      )
    })
  })
})