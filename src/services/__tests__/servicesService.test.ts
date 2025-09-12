import { describe, it, expect, vi, beforeEach } from 'vitest'
import { servicesService } from '../servicesService'
import { supabase } from '../../lib/supabase'

// Mock do Supabase
vi.mock('../../lib/supabase', () => {
  const mockSelect = vi.fn()
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  const mockEq = vi.fn()
  const mockOrder = vi.fn()
  const mockSingle = vi.fn()

  return {
    supabase: {
      from: mockFrom
    },
    mockFrom,
    mockSelect,
    mockEq,
    mockOrder,
    mockSingle
  }
})

const { mockFrom, mockSelect, mockEq, mockOrder, mockSingle } = vi.mocked(
  await import('../../lib/supabase')
)

describe('servicesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getServices', () => {
    it('should return all active services', async () => {
      const mockServices = [
        {
          id: '1',
          name: 'Banho e Tosa',
          description: 'Serviço completo de banho e tosa',
          price: 50,
          duration: '2h',
          category: 'higiene',
          image_url: null,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          name: 'Consulta Veterinária',
          description: 'Consulta com veterinário',
          price: 80,
          duration: '1h',
          category: 'saude',
          image_url: null,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ]

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: mockServices, error: null })
        })
      })

      const result = await servicesService.getServices()

      expect(mockFrom).toHaveBeenCalledWith('services_pet')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('is_active', true)
      expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true })
      expect(result).toEqual(mockServices)
    })

    it('should throw error when Supabase returns error', async () => {
      const mockError = { message: 'Database error' }

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: null, error: mockError })
        })
      })

      await expect(servicesService.getServices()).rejects.toThrow(
        'Error fetching services: Database error'
      )
    })

    it('should return empty array when no data', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: null, error: null })
        })
      })

      const result = await servicesService.getServices()
      expect(result).toEqual([])
    })
  })

  describe('getServicesByCategory', () => {
    it('should return services filtered by category', async () => {
      const mockServices = [
        {
          id: '1',
          name: 'Banho e Tosa',
          description: 'Serviço completo de banho e tosa',
          price: 50,
          duration: '2h',
          category: 'higiene',
          image_url: null,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ]

      mockSelect.mockReturnValue({
        eq: mockEq
          .mockReturnValueOnce({
            eq: mockEq.mockReturnValue({
              order: mockOrder.mockResolvedValue({ data: mockServices, error: null })
            })
          })
      })

      const result = await servicesService.getServicesByCategory('higiene')

      expect(mockFrom).toHaveBeenCalledWith('services_pet')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('category', 'higiene')
      expect(mockEq).toHaveBeenCalledWith('is_active', true)
      expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true })
      expect(result).toEqual(mockServices)
    })

    it('should throw error when Supabase returns error', async () => {
      const mockError = { message: 'Database error' }

      mockSelect.mockReturnValue({
        eq: mockEq
          .mockReturnValueOnce({
            eq: mockEq.mockReturnValue({
              order: mockOrder.mockResolvedValue({ data: null, error: mockError })
            })
          })
      })

      await expect(servicesService.getServicesByCategory('higiene')).rejects.toThrow(
        'Error fetching services by category: Database error'
      )
    })
  })

  describe('getServiceById', () => {
    it('should return service by ID', async () => {
      const mockService = {
        id: '1',
        name: 'Banho e Tosa',
        description: 'Serviço completo de banho e tosa',
        price: 50,
        duration: '2h',
        category: 'higiene',
        image_url: null,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: mockService, error: null })
        })
      })

      const result = await servicesService.getServiceById('1')

      expect(mockFrom).toHaveBeenCalledWith('services_pet')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(mockSingle).toHaveBeenCalled()
      expect(result).toEqual(mockService)
    })

    it('should throw error when Supabase returns error', async () => {
      const mockError = { message: 'Service not found' }

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: null, error: mockError })
        })
      })

      await expect(servicesService.getServiceById('1')).rejects.toThrow(
        'Error fetching service: Service not found'
      )
    })
  })
})