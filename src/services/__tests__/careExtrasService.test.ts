import { describe, it, expect, vi, beforeEach } from 'vitest'
import { careExtrasService } from '../careExtrasService'

// Mock do Supabase
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockOrder = vi.fn()

const mockSupabase = {
  from: mockFrom
}

// Mock do módulo supabase
vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}))

describe('CareExtrasService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete
    })
  })

  describe('getCareExtras', () => {
    it('should return all active care extras', async () => {
      const mockCareExtras = [
        {
          id: '1',
          name: 'Banho Especial',
          description: 'Banho com produtos especiais',
          category: 'higiene',
          price: 25.00,
          duration: 30,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          name: 'Corte de Unhas',
          description: 'Corte profissional de unhas',
          category: 'cuidados',
          price: 15.00,
          duration: 15,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ]

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: mockCareExtras, error: null })
        })
      })

      const result = await careExtrasService.getCareExtras()

      expect(mockFrom).toHaveBeenCalledWith('care_extras_pet')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('is_active', true)
      expect(mockOrder).toHaveBeenCalledWith('category', { ascending: true })
      expect(result).toEqual(mockCareExtras)
    })

    it('should throw error when Supabase returns error', async () => {
      const mockError = { message: 'Database error' }

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: null, error: mockError })
        })
      })

      await expect(careExtrasService.getCareExtras())
        .rejects.toThrow('Erro ao buscar extras de cuidado: Database error')
    })

    it('should return empty array when no data', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: null, error: null })
        })
      })

      const result = await careExtrasService.getCareExtras()
      expect(result).toEqual([])
    })
  })

  describe('getCareExtrasByCategory', () => {
    it('should return care extras filtered by category', async () => {
      const mockCareExtras = [
        {
          id: '1',
          name: 'Banho Especial',
          description: 'Banho com produtos especiais',
          category: 'higiene',
          price: 25.00,
          duration: 30,
          is_active: true
        }
      ]

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          eq: mockEq.mockReturnValue({
            order: mockOrder.mockResolvedValue({ data: mockCareExtras, error: null })
          })
        })
      })

      const result = await careExtrasService.getCareExtrasByCategory('higiene')

      expect(mockEq).toHaveBeenCalledWith('is_active', true)
      expect(mockEq).toHaveBeenCalledWith('category', 'higiene')
      expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true })
      expect(result).toEqual(mockCareExtras)
    })

    it('should throw error when fetching by category fails', async () => {
      const mockError = { message: 'Category fetch failed' }

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          eq: mockEq.mockReturnValue({
            order: mockOrder.mockResolvedValue({ data: null, error: mockError })
          })
        })
      })

      await expect(careExtrasService.getCareExtrasByCategory('higiene'))
        .rejects.toThrow('Erro ao buscar extras de cuidado por categoria: Category fetch failed')
    })
  })

  describe('getCareExtra', () => {
    it('should return a single care extra by ID', async () => {
      const mockCareExtra = {
        id: '1',
        name: 'Banho Especial',
        description: 'Banho com produtos especiais',
        category: 'higiene',
        price: 25.00,
        duration: 30,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: mockCareExtra, error: null })
        })
      })

      const result = await careExtrasService.getCareExtra('1')

      expect(mockFrom).toHaveBeenCalledWith('care_extras_pet')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(mockSingle).toHaveBeenCalled()
      expect(result).toEqual(mockCareExtra)
    })

    it('should return null when care extra not found', async () => {
      const mockError = { code: 'PGRST116', message: 'Not found' }

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: null, error: mockError })
        })
      })

      const result = await careExtrasService.getCareExtra('999')
      expect(result).toBeNull()
    })

    it('should throw error when Supabase returns other error', async () => {
      const mockError = { code: 'OTHER_ERROR', message: 'Database error' }

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: null, error: mockError })
        })
      })

      await expect(careExtrasService.getCareExtra('1'))
        .rejects.toThrow('Erro ao buscar extra de cuidado: Database error')
    })
  })

  describe('createCareExtra', () => {
    it('should create a new care extra', async () => {
      const mockCareExtra = {
        id: '1',
        name: 'Novo Extra',
        description: 'Descrição do novo extra',
        category: 'cuidados',
        price: 20.00,
        duration: 20,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      const careExtraData = {
        name: 'Novo Extra',
        description: 'Descrição do novo extra',
        category: 'cuidados',
        price: 20.00,
        duration: 20,
        is_active: true
      }

      mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: mockCareExtra, error: null })
        })
      })

      const result = await careExtrasService.createCareExtra(careExtraData)

      expect(mockInsert).toHaveBeenCalledWith(careExtraData)
      expect(result).toEqual(mockCareExtra)
    })

    it('should throw error when creation fails', async () => {
      const mockError = { message: 'Creation failed' }

      mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: null, error: mockError })
        })
      })

      const careExtraData = {
        name: 'Novo Extra',
        category: 'cuidados',
        price: 20.00
      }

      await expect(careExtrasService.createCareExtra(careExtraData))
        .rejects.toThrow('Erro ao criar extra de cuidado: Creation failed')
    })
  })

  describe('updateCareExtra', () => {
    it('should update an existing care extra', async () => {
      const mockUpdatedCareExtra = {
        id: '1',
        name: 'Extra Atualizado',
        description: 'Descrição atualizada',
        category: 'cuidados',
        price: 25.00,
        duration: 25,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      }

      const updates = {
        name: 'Extra Atualizado',
        description: 'Descrição atualizada',
        price: 25.00
      }

      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: mockUpdatedCareExtra, error: null })
          })
        })
      })

      const result = await careExtrasService.updateCareExtra('1', updates)

      expect(mockUpdate).toHaveBeenCalledWith(updates)
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockUpdatedCareExtra)
    })

    it('should throw error when update fails', async () => {
      const mockError = { message: 'Update failed' }

      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: null, error: mockError })
          })
        })
      })

      await expect(careExtrasService.updateCareExtra('1', { name: 'Updated' }))
        .rejects.toThrow('Erro ao atualizar extra de cuidado: Update failed')
    })
  })

  describe('deleteCareExtra', () => {
    it('should delete a care extra', async () => {
      mockDelete.mockReturnValue({
        eq: mockEq.mockResolvedValue({ error: null })
      })

      await careExtrasService.deleteCareExtra('1')

      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', '1')
    })

    it('should throw error when deletion fails', async () => {
      const mockError = { message: 'Deletion failed' }

      mockDelete.mockReturnValue({
        eq: mockEq.mockResolvedValue({ error: mockError })
      })

      await expect(careExtrasService.deleteCareExtra('1'))
        .rejects.toThrow('Erro ao deletar extra de cuidado: Deletion failed')
    })
  })

  describe('toggleCareExtraStatus', () => {
    it('should toggle care extra status from active to inactive', async () => {
      const currentStatus = { is_active: true }
      const toggledCareExtra = {
        id: '1',
        name: 'Extra Test',
        is_active: false,
        updated_at: '2024-01-02'
      }

      // Mock para buscar status atual
      mockSelect.mockReturnValueOnce({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: currentStatus, error: null })
        })
      })

      // Mock para atualizar status
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: toggledCareExtra, error: null })
          })
        })
      })

      const result = await careExtrasService.toggleCareExtraStatus('1')

      expect(mockUpdate).toHaveBeenCalledWith({ is_active: false })
      expect(result).toEqual(toggledCareExtra)
    })

    it('should toggle care extra status from inactive to active', async () => {
      const currentStatus = { is_active: false }
      const toggledCareExtra = {
        id: '1',
        name: 'Extra Test',
        is_active: true,
        updated_at: '2024-01-02'
      }

      // Mock para buscar status atual
      mockSelect.mockReturnValueOnce({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: currentStatus, error: null })
        })
      })

      // Mock para atualizar status
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: toggledCareExtra, error: null })
          })
        })
      })

      const result = await careExtrasService.toggleCareExtraStatus('1')

      expect(mockUpdate).toHaveBeenCalledWith({ is_active: true })
      expect(result).toEqual(toggledCareExtra)
    })

    it('should throw error when fetching current status fails', async () => {
      const mockError = { message: 'Fetch failed' }

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: null, error: mockError })
        })
      })

      await expect(careExtrasService.toggleCareExtraStatus('1'))
        .rejects.toThrow('Erro ao buscar status do extra de cuidado: Fetch failed')
    })

    it('should throw error when updating status fails', async () => {
      const currentStatus = { is_active: true }
      const mockError = { message: 'Update failed' }

      // Mock para buscar status atual
      mockSelect.mockReturnValueOnce({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: currentStatus, error: null })
        })
      })

      // Mock para falhar na atualização
      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: null, error: mockError })
          })
        })
      })

      await expect(careExtrasService.toggleCareExtraStatus('1'))
        .rejects.toThrow('Erro ao alterar status do extra de cuidado: Update failed')
    })
  })
})