import { describe, it, expect, vi, beforeEach } from 'vitest'
import { petsService } from '../petsService'
import { supabase } from '../../lib/supabase'

// Mock do Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}))

describe('PetsService', () => {
  const mockSupabase = vi.mocked(supabase)
  const mockFrom = vi.fn()
  const mockSelect = vi.fn()
  const mockEq = vi.fn()
  const mockInsert = vi.fn()
  const mockUpdate = vi.fn()
  const mockDelete = vi.fn()
  const mockSingle = vi.fn()
  const mockOrder = vi.fn()
  const mockGetUser = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete
    } as any)
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null
    } as any)
    
    // Setup default chain for select operations
    const selectChain = {
      eq: mockEq,
      order: mockOrder,
      single: mockSingle
    }
    
    mockSelect.mockReturnValue(selectChain)
    
    mockEq.mockReturnValue({
      order: mockOrder,
      single: mockSingle
    })
    
    mockOrder.mockResolvedValue({
      data: [],
      error: null
    })
    
    mockSingle.mockResolvedValue({
      data: null,
      error: null
    })
  })

  describe('getPets', () => {
    it('should fetch pets successfully', async () => {
      const mockPets = [
        {
          id: '1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          owner_id: 'user1',
          name: 'Buddy',
          species: 'Dog',
          breed: 'Golden Retriever',
          age: '3',
          weight: '30kg',
          height: '60cm',
          color: 'Golden',
          gender: 'Male',
          image_url: null,
          personality: ['friendly'],
          allergies: [],
          medications: []
        }
      ]

      mockSelect.mockReturnValue({
        order: mockOrder.mockResolvedValue({
          data: mockPets,
          error: null
        })
      })

      const result = await petsService.getPets()

      expect(mockSupabase.from).toHaveBeenCalledWith('pets_pet')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockPets)
    })

    it('should throw error when fetch fails', async () => {
      mockSelect.mockReturnValue({
        order: mockOrder.mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      })

      await expect(petsService.getPets()).rejects.toThrow('Erro ao buscar pets: Database error')
    })
  })

  describe('getPetById', () => {
    it('should fetch pet by id successfully', async () => {
      const mockPet = {
        id: '1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        owner_id: 'user1',
        name: 'Rex',
        species: 'dog',
        breed: 'Golden Retriever',
        age: '3',
        weight: '25kg',
        height: '60cm',
        color: 'Golden',
        gender: 'male',
        image_url: null,
        personality: ['friendly'],
        allergies: [],
        medications: []
      }

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({
            data: mockPet,
            error: null
          })
        })
      })

      const result = await petsService.getPetById('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('pets_pet')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockPet)
    })

    it('should return null when pet not found', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle.mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }
          })
        })
      })

      const result = await petsService.getPetById('1')

      expect(result).toBeNull()
    })
  })

  describe('createPet', () => {
    it('should create pet successfully', async () => {
      const mockPet = {
        name: 'Rex',
        species: 'dog',
        breed: 'Golden Retriever',
        age: '3',
        weight: '25kg',
        height: '60cm',
        color: 'Golden',
        gender: 'male',
        image_url: null,
        personality: ['friendly'],
        allergies: [],
        medications: []
      }

      const mockCreatedPet = {
        id: '1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        owner_id: 'user1',
        ...mockPet
      }

      mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle.mockResolvedValue({
            data: mockCreatedPet,
            error: null
          })
        })
      })

      const result = await petsService.createPet(mockPet)

      expect(mockSupabase.from).toHaveBeenCalledWith('pets_pet')
      expect(mockInsert).toHaveBeenCalledWith({
        ...mockPet,
        owner_id: 'user1'
      })
      expect(result).toEqual(mockCreatedPet)
    })

    it('should throw error when creation fails', async () => {
      const mockPet = {
        name: 'Rex',
        species: 'dog',
        breed: 'Golden Retriever',
        age: '3',
        weight: '25kg',
        height: '60cm',
        color: 'Golden',
        gender: 'male',
        image_url: null,
        personality: ['friendly'],
        allergies: [],
        medications: []
      }

      mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle.mockResolvedValue({
            data: null,
            error: { message: 'Creation failed' }
          })
        })
      })

      await expect(petsService.createPet(mockPet)).rejects.toThrow('Erro ao criar pet: Creation failed')
    })
  })

  describe('updatePet', () => {
    it('should update pet successfully', async () => {
      const mockUpdates = {
        name: 'Rex Updated',
        age: '4'
      }

      const mockUpdatedPet = {
        id: '1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        owner_id: 'user1',
        name: 'Rex Updated',
        species: 'dog',
        breed: 'Golden Retriever',
        age: '4',
        weight: '25kg',
        height: '60cm',
        color: 'Golden',
        gender: 'male',
        image_url: null,
        personality: ['friendly'],
        allergies: [],
        medications: []
      }

      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({
              data: mockUpdatedPet,
              error: null
            })
          })
        })
      })

      const result = await petsService.updatePet('1', mockUpdates)

      expect(mockSupabase.from).toHaveBeenCalledWith('pets_pet')
      expect(mockUpdate).toHaveBeenCalledWith({
        ...mockUpdates,
        updated_at: expect.any(String)
      })
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockUpdatedPet)
    })
  })

  describe('deletePet', () => {
    it('should delete pet successfully', async () => {
      mockDelete.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          error: null
        })
      })

      await petsService.deletePet('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('pets_pet')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', '1')
    })

    it('should throw error when deletion fails', async () => {
      mockDelete.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          error: { message: 'Deletion failed' }
        })
      })

      await expect(petsService.deletePet('1')).rejects.toThrow('Erro ao deletar pet: Deletion failed')
    })
  })
})
