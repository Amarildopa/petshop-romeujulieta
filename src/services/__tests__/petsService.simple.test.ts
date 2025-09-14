import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock do Supabase
vi.mock('../../lib/supabase', () => {
  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis()
  }
  
  return {
    supabase: {
      from: vi.fn(() => mockQueryBuilder),
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null }))
      }
    }
  }
})

import { supabase } from '../../lib/supabase'
// Interfaces para tipagem dos mocks
interface MockQueryBuilder {
  select: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  in: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
  then: ReturnType<typeof vi.fn>
}

interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>
}

const mockSupabase = supabase as MockSupabaseClient
const mockQueryBuilder = mockSupabase.from()

// Mock do módulo supabase
vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase
}))

// Importar o serviço após o mock
import { petsService } from '../petsService'

describe('PetsService - Simple Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be defined', () => {
    expect(petsService).toBeDefined()
  })

  it('should have getPets method', () => {
    expect(typeof petsService.getPets).toBe('function')
  })

  it('should have getPetById method', () => {
    expect(typeof petsService.getPetById).toBe('function')
  })

  it('should have createPet method', () => {
    expect(typeof petsService.createPet).toBe('function')
  })

  it('should have updatePet method', () => {
    expect(typeof petsService.updatePet).toBe('function')
  })

  it('should have deletePet method', () => {
    expect(typeof petsService.deletePet).toBe('function')
  })

  it('should call supabase.from with correct table name', async () => {
    await petsService.getPets('test-user')
    expect(mockSupabase.from).toHaveBeenCalledWith('pets_pet')
  })

  it('should handle getPets successfully', async () => {
    const mockPets = [
      { id: '1', name: 'Rex', species: 'dog', user_id: 'test-user' }
    ]
    
    mockSupabase.from().select().eq().order.mockResolvedValue({
      data: mockPets,
      error: null
    })

    const result = await petsService.getPets('test-user')
    expect(result).toEqual(mockPets)
  })

  it('should handle getPets error', async () => {
    mockSupabase.from().select().eq().order.mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    })

    await expect(petsService.getPets('test-user')).rejects.toThrow('Erro ao buscar pets: Database error')
  })
})
