import { supabase } from '../lib/supabase'

export interface Appointment {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  pet_id: string
  service_id: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  notes: string | null
  total_price: number
  extras: string[]
  
  // Related data
  pet?: {
    name: string
    breed: string
    avatar_url: string | null
  }
  service?: {
    name: string
    description: string
    duration: string
  }
}

export const appointmentsService = {
  // Get all appointments for the current user
  async getAppointments(): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments_pet')
        .select(`
          *,
          pet:pets_pet(name, breed, avatar_url),
          service:services_pet(name, description, duration)
        `)
        .order('appointment_date', { ascending: true })

      if (error) {
        console.warn('Error fetching appointments:', error.message)
        return []
      }

      return data || []
    } catch (err) {
      console.warn('Exception in getAppointments:', err)
      return []
    }
  },

  // Get upcoming appointments
  async getUpcomingAppointments(): Promise<Appointment[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('appointments_pet')
        .select(`
          *,
          pet:pets_pet(name, breed, avatar_url),
          service:services_pet(name, description, duration)
        `)
        .gte('appointment_date', today)
        .in('status', ['pending', 'confirmed', 'in_progress'])
        .order('appointment_date', { ascending: true })

      if (error) {
        console.warn('Error fetching upcoming appointments:', error.message)
        return [] // Retorna array vazio em caso de erro
      }

      return data || []
    } catch (err) {
      console.warn('Exception in getUpcomingAppointments:', err)
      return [] // Retorna array vazio em caso de exceção
    }
  },

  // Get appointments for today
  async getTodayAppointments(): Promise<Appointment[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('appointments_pet')
        .select(`
          *,
          pet:pets_pet(name, breed, avatar_url),
          service:services_pet(name, description, duration)
        `)
        .eq('appointment_date', today)
        .in('status', ['confirmed', 'in_progress'])

      if (error) {
        console.warn('Error fetching today\'s appointments:', error.message)
        return []
      }

      return data || []
    } catch (err) {
      console.warn('Exception in getTodayAppointments:', err)
      return []
    }
  },

  // Create a new appointment
  async createAppointment(appointmentData: {
    pet_id: string
    service_id: string
    appointment_date: string
    appointment_time: string
    notes?: string
    total_price: number
    extras?: string[]
  }): Promise<Appointment> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('appointments_pet')
      .insert({
        ...appointmentData,
        user_id: user.id
      })
      .select(`
        *,
        pet:pets_pet(name, breed, avatar_url),
        service:services_pet(name, description, duration)
      `)
      .single()

    if (error) {
      throw new Error(`Error creating appointment: ${error.message}`)
    }

    return data
  },

  // Update appointment status
  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments_pet')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        pet:pets_pet(name, breed, avatar_url),
        service:services_pet(name, description, duration)
      `)
      .single()

    if (error) {
      throw new Error(`Error updating appointment: ${error.message}`)
    }

    return data
  },

  // Cancel an appointment
  async cancelAppointment(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments_pet')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Error cancelling appointment: ${error.message}`)
    }
  }
}
