import { supabase } from '../lib/supabase'

export interface Pet {
  id: string
  created_at: string
  updated_at: string
  owner_id: string
  name: string
  species: string
  breed: string
  age: string
  weight: string
  height: string
  color: string
  gender: string
  image_url: string | null
  personality: string[]
  allergies: string[]
  medications: string[]
}

export const petsService = {
  // Get all pets for the current user
  async getPets(): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets_pet')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar pets: ${error.message}`)
    }

    return data || []
  },

  // Get a single pet by ID
  async getPetById(id: string): Promise<Pet | null> {
    const { data, error } = await supabase
      .from('pets_pet')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      // PGRST116 means no rows found, which is expected for non-existent pets
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Erro ao buscar pet: ${error.message}`)
    }

    return data
  },

  // Create a new pet
  async createPet(petData: Omit<Pet, 'id' | 'created_at' | 'updated_at' | 'owner_id'>): Promise<Pet> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('pets_pet')
      .insert({
        ...petData,
        owner_id: user.id
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar pet: ${error.message}`)
    }

    return data
  },

  // Update a pet
  async updatePet(id: string, updates: Partial<Omit<Pet, 'id' | 'created_at' | 'updated_at' | 'owner_id'>>): Promise<Pet> {
    const { data, error } = await supabase
      .from('pets_pet')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar pet: ${error.message}`)
    }

    return data
  },

  // Delete a pet
  async deletePet(id: string): Promise<void> {
    const { error } = await supabase
      .from('pets_pet')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Erro ao deletar pet: ${error.message}`)
    }
  }
}
