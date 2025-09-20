import { supabase } from '../lib/supabase';

export interface WeeklyBath {
  id: string;
  created_at: string;
  updated_at: string;
  pet_name: string;
  pet_id?: string;
  image_url: string;
  bath_date: string;
  approved: boolean;
  approved_by?: string;
  approved_at?: string;
  week_start: string; // Data da segunda-feira da semana
  display_order: number;
  curator_notes?: string;
}

export interface WeeklyBathCreate {
  pet_name: string;
  pet_id?: string;
  image_url: string;
  bath_date: string;
  week_start: string;
  display_order?: number;
  curator_notes?: string;
}

export interface WeeklyBathUpdate {
  pet_name?: string;
  image_url?: string;
  bath_date?: string;
  approved?: boolean;
  approved_by?: string;
  display_order?: number;
  curator_notes?: string;
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
      .order('created_at', { ascending: false });

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

  // Update display order for multiple baths
  async updateDisplayOrder(updates: { id: string; display_order: number }[]): Promise<void> {
    const promises = updates.map(({ id, display_order }) =>
      supabase
        .from('weekly_baths')
        .update({ display_order, updated_at: new Date().toISOString() })
        .eq('id', id)
    );

    const results = await Promise.all(promises);
    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
      throw new Error(`Erro ao atualizar ordem de exibição: ${errors[0].error?.message}`);
    }
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

  // Archive old weeks (keep only last 8 weeks)
  async archiveOldWeeks(): Promise<void> {
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - (8 * 7));
    const cutoffDate = getWeekStart(eightWeeksAgo);

    const { error } = await supabase
      .from('weekly_baths')
      .delete()
      .lt('week_start', cutoffDate);

    if (error) {
      throw new Error(`Erro ao arquivar semanas antigas: ${error.message}`);
    }
  }
};

// Helper function to get the start of the week (Monday)
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=domingo, 1=segunda, 2=terça...
  
  // Calcular quantos dias voltar para chegar na segunda-feira
  let daysToSubtract;
  if (day === 0) {
    // Se é domingo, voltar 6 dias para chegar na segunda anterior
    daysToSubtract = 6;
  } else {
    // Se é segunda a sábado, voltar (day - 1) dias
    daysToSubtract = day - 1;
  }
  
  const monday = new Date(d);
  monday.setDate(d.getDate() - daysToSubtract);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

// Helper function to get the start of the previous week (for carousel display)
function getPreviousWeekStart(date: Date): string {
  const currentWeekStart = getWeekStart(date);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  return previousWeekStart.toISOString().split('T')[0];
}

// Helper function to get week range string for display
export function getWeekRangeString(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };
  
  return `${formatDate(start)} - ${formatDate(end)}`;
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
