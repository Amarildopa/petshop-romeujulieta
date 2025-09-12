import { supabase } from '../lib/supabase'

export interface Service {
  id: string
  created_at: string
  updated_at: string
  name: string
  description: string
  price: number
  duration: string
  category: string
  image_url: string | null
  is_active: boolean
}

export const servicesService = {
  // Get all active services
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services_pet')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Error fetching services: ${error.message}`)
    }

    return data || []
  },

  // Get services by category
  async getServicesByCategory(category: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services_pet')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Error fetching services by category: ${error.message}`)
    }

    return data || []
  },

  // Get a single service by ID
  async getServiceById(id: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services_pet')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Error fetching service: ${error.message}`)
    }

    return data
  }
}
