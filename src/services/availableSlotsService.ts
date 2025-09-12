import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type AvailableSlot = Database['public']['Tables']['available_slots_pet']['Row'];
type AvailableSlotInsert = Database['public']['Tables']['available_slots_pet']['Insert'];
type AvailableSlotUpdate = Database['public']['Tables']['available_slots_pet']['Update'];

export class AvailableSlotsService {
  async getAvailableSlots(serviceId: string, date?: string): Promise<AvailableSlot[]> {
    let query = supabase
      .from('available_slots_pet')
      .select('*')
      .eq('service_id', serviceId)
      .eq('is_available', true);

    if (date) {
      query = query.eq('date', date);
    } else {
      // Buscar slots para os próximos 30 dias
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      query = query.gte('date', today).lte('date', futureDateStr);
    }

    const { data, error } = await query.order('date', { ascending: true }).order('start_time', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar horários disponíveis: ${error.message}`);
    }

    return data || [];
  }

  async getAvailableSlotsByDateRange(serviceId: string, startDate: string, endDate: string): Promise<AvailableSlot[]> {
    const { data, error } = await supabase
      .from('available_slots_pet')
      .select('*')
      .eq('service_id', serviceId)
      .eq('is_available', true)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar horários disponíveis por período: ${error.message}`);
    }

    return data || [];
  }

  async getAvailableSlotsByTime(serviceId: string, date: string, startTime: string, endTime: string): Promise<AvailableSlot[]> {
    const { data, error } = await supabase
      .from('available_slots_pet')
      .select('*')
      .eq('service_id', serviceId)
      .eq('date', date)
      .eq('is_available', true)
      .gte('start_time', startTime)
      .lte('end_time', endTime)
      .order('start_time', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar horários disponíveis por horário: ${error.message}`);
    }

    return data || [];
  }

  async createAvailableSlot(slot: AvailableSlotInsert): Promise<AvailableSlot> {
    const { data, error } = await supabase
      .from('available_slots_pet')
      .insert(slot)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar horário disponível: ${error.message}`);
    }

    return data;
  }

  async createMultipleSlots(slots: AvailableSlotInsert[]): Promise<AvailableSlot[]> {
    const { data, error } = await supabase
      .from('available_slots_pet')
      .insert(slots)
      .select();

    if (error) {
      throw new Error(`Erro ao criar múltiplos horários: ${error.message}`);
    }

    return data || [];
  }

  async updateAvailableSlot(id: string, slot: AvailableSlotUpdate): Promise<AvailableSlot> {
    const { data, error } = await supabase
      .from('available_slots_pet')
      .update(slot)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar horário disponível: ${error.message}`);
    }

    return data;
  }

  async bookSlot(id: string): Promise<AvailableSlot> {
    // Primeiro, verificar se o slot ainda está disponível
    const { data: currentSlot, error: fetchError } = await supabase
      .from('available_slots_pet')
      .select('current_appointments, max_appointments')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Erro ao buscar slot: ${fetchError.message}`);
    }

    if (currentSlot.current_appointments >= currentSlot.max_appointments) {
      throw new Error('Slot não está mais disponível');
    }

    // Incrementar o número de agendamentos
    const { data, error } = await supabase
      .from('available_slots_pet')
      .update({ 
        current_appointments: currentSlot.current_appointments + 1,
        is_available: currentSlot.current_appointments + 1 < currentSlot.max_appointments
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao reservar slot: ${error.message}`);
    }

    return data;
  }

  async releaseSlot(id: string): Promise<AvailableSlot> {
    // Primeiro, verificar o slot atual
    const { data: currentSlot, error: fetchError } = await supabase
      .from('available_slots_pet')
      .select('current_appointments, max_appointments')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Erro ao buscar slot: ${fetchError.message}`);
    }

    if (currentSlot.current_appointments <= 0) {
      throw new Error('Slot já está liberado');
    }

    // Decrementar o número de agendamentos
    const { data, error } = await supabase
      .from('available_slots_pet')
      .update({ 
        current_appointments: currentSlot.current_appointments - 1,
        is_available: true
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao liberar slot: ${error.message}`);
    }

    return data;
  }

  async deleteAvailableSlot(id: string): Promise<void> {
    const { error } = await supabase
      .from('available_slots_pet')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar horário disponível: ${error.message}`);
    }
  }

  async generateSlotsForService(
    serviceId: string, 
    startDate: string, 
    endDate: string, 
    startTime: string, 
    endTime: string, 
    durationMinutes: number = 60,
    maxAppointments: number = 1
  ): Promise<AvailableSlot[]> {
    const slots: AvailableSlotInsert[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Obter o usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const startDateTime = new Date(date);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      
      const endDateTime = new Date(date);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      
      for (let time = new Date(startDateTime); time < endDateTime; time.setMinutes(time.getMinutes() + durationMinutes)) {
        const slotStartTime = time.toTimeString().split(' ')[0].substring(0, 5);
        const slotEndTime = new Date(time.getTime() + durationMinutes * 60000).toTimeString().split(' ')[0].substring(0, 5);
        
        slots.push({
          service_id: serviceId,
          date: dateStr,
          start_time: slotStartTime,
          end_time: slotEndTime,
          is_available: true,
          max_appointments: maxAppointments,
          current_appointments: 0,
          created_by: user.id
        });
      }
    }

    return this.createMultipleSlots(slots);
  }
}

export const availableSlotsService = new AvailableSlotsService();
export type { AvailableSlot, AvailableSlotInsert, AvailableSlotUpdate };
