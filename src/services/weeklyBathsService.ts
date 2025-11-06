import { supabase } from '../lib/supabase';

export interface WeeklyBath {
  id: string;
  created_at: string;
  updated_at: string;
  pet_name: string;
  pet_id?: string;
  image_url: string;
  image_path?: string;
  bath_date: string;
  approved: boolean;
  approved_by?: string;
  approved_at?: string;
  week_start: string; // Data da segunda-feira da semana
  display_order: number;
  curator_notes?: string;
  add_to_journey: boolean; // NOVO: Se deve ser adicionado à jornada
  journey_event_id?: string; // NOVO: ID do evento criado na jornada
}

export interface WeeklyBathCreate {
  pet_name: string;
  pet_id?: string;
  image_url: string;
  image_path?: string;
  bath_date: string;
  week_start: string;
  display_order?: number;
  curator_notes?: string;
  add_to_journey?: boolean; // NOVO: Se deve ser adicionado à jornada
}

export interface WeeklyBathUpdate {
  pet_name?: string;
  image_url?: string;
  image_path?: string;
  bath_date?: string;
  approved?: boolean;
  approved_by?: string;
  display_order?: number;
  curator_notes?: string;
  add_to_journey?: boolean; // NOVO: Se deve ser adicionado à jornada
  journey_event_id?: string; // NOVO: ID do evento criado na jornada
  // Adicionado: permitir atualizar o vínculo do pet
  pet_id?: string;
}

export const weeklyBathsService = {
  // Get previous week's approved baths for display (Monday to Saturday)
  async getCurrentWeekBaths(): Promise<WeeklyBath[]> {
    const previousWeekStart = getPreviousWeekStart(new Date());
    console.log('Buscando banhos para a semana que inicia em:', previousWeekStart);
    const { data, error } = await supabase
      .from('weekly_baths')
      .select('*')
      .eq('week_start', previousWeekStart)
      .eq('approved', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar banhos da semana: ${error.message}`);
    }

    return data || [];
  },

  // Get all baths for a specific week (for curation)
  async getWeekBaths(weekStart: string): Promise<WeeklyBath[]> {
    const { data, error } = await supabase
      .from('weekly_baths')
      .select('*')
      .eq('week_start', weekStart)
      // Ordenar por data do banho para refletir cronologia
      .order('bath_date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar banhos da semana: ${error.message}`);
    }

    return data || [];
  },

  // Get pending baths for approval
  async getPendingBaths(): Promise<WeeklyBath[]> {
    const { data, error } = await supabase
      .from('weekly_baths')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar banhos pendentes: ${error.message}`);
    }

    return data || [];
  },

  // Create a new weekly bath entry
  async createWeeklyBath(bathData: WeeklyBathCreate): Promise<WeeklyBath> {
    const { data, error } = await supabase
      .from('weekly_baths')
      .insert({
        ...bathData,
        approved: false,
        display_order: bathData.display_order || 0
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar entrada de banho: ${error.message}`);
    }

    return data;
  },

  // Update a weekly bath entry
  async updateWeeklyBath(id: string, updates: WeeklyBathUpdate): Promise<WeeklyBath> {
    const updateData: Partial<WeeklyBath> = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // If approving, set approval timestamp
    if (updates.approved === true && updates.approved_by) {
      updateData.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('weekly_baths')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar banho: ${error.message}`);
    }

    return data;
  },

  // Delete a weekly bath entry
  async deleteWeeklyBath(id: string): Promise<void> {
    const { error } = await supabase
      .from('weekly_baths')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar banho: ${error.message}`);
    }
  },

  // Approve multiple baths at once
  async approveBaths(ids: string[], approvedBy: string): Promise<WeeklyBath[]> {
    const { data, error } = await supabase
      .from('weekly_baths')
      .update({
        approved: true,
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select();

    if (error) {
      throw new Error(`Erro ao aprovar banhos: ${error.message}`);
    }

    return data || [];
  },

  // Get weeks that have baths (for navigation)
  async getAvailableWeeks(): Promise<string[]> {
    const { data, error } = await supabase
      .from('weekly_baths')
      .select('week_start')
      .order('week_start', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar semanas disponíveis: ${error.message}`);
    }

    // Remove duplicates and return unique week starts
    const uniqueWeeks = [...new Set(data?.map(item => item.week_start) || [])];
    return uniqueWeeks;
  },

  // Get pets for selection (integration feature)
  async getPetsForSelection(): Promise<Pet[]> {
    const { data, error } = await supabase
      .rpc('get_pets_for_selection');

    if (error) {
      throw new Error(`Erro ao buscar pets para seleção: ${error.message}`);
    }

    return data || [];
  },

  // Approve bath with integration to journey
  async approveBathWithIntegration(
    bathId: string, 
    approvedBy: string, 
    petId?: string
  ): Promise<IntegrationResult> {
    const { data, error } = await supabase
      .rpc('approve_bath_with_integration', {
        p_bath_id: bathId,
        p_approved_by: approvedBy,
        p_pet_id: petId
      });

    if (error) {
      throw new Error(`Erro ao aprovar banho com integração: ${error.message}`);
    }

    return data;
  },

  async getIntegrationStats(): Promise<IntegrationStats> {
    const { data, error } = await supabase
      .rpc('get_integration_stats');

    if (error) {
      throw new Error(`Erro ao buscar estatísticas de integração: ${error.message}`);
    }

    return data || { total_baths: 0, integrated_baths: 0, total_events: 0 };
  },

  async isBathIntegrated(bathId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('weekly_baths')
      .select('journey_event_id')
      .eq('id', bathId)
      .single();

    if (error) {
      throw new Error(`Erro ao verificar integração do banho: ${error.message}`);
    }

    return !!data?.journey_event_id;
  },

  async getJourneyEventFromBath(bathId: string): Promise<JourneyEvent | null> {
    const { data, error } = await supabase
      .from('pet_events_pet')
      .select('*')
      .eq('weekly_bath_source_id', bathId)
      .single();

    if (error) {
      // If not found, return null
      if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar evento da jornada: ${error.message}`);
    }

    return data || null;
  }
};

function getWeekStart(date: Date): string {
  // Normaliza para meia-noite local e calcula segunda-feira
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = base.getDay(); // 0 (Domingo) a 6 (Sábado)
  const diff = base.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(base.getFullYear(), base.getMonth(), diff);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const d = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekRangeString(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6); // Monday to Sunday
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

export function getPreviousWeekStart(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 7);
  return getWeekStart(d);
}

// Helper function to check if it's Monday (update day)
export function isMondayUpdateTime(): boolean {
  const now = new Date();
  return now.getDay() === 1; // Monday is 1
}

// Helper function to get current week start
export function getCurrentWeekStart(): string {
  return getWeekStart(new Date());
}

// Novo: obter o início da semana a partir de uma string de data (yyyy-mm-dd)
export function getWeekStartFromString(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return getWeekStart(new Date(y, (m || 1) - 1, d || 1));
}
