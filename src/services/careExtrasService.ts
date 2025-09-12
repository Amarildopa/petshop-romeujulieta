import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type CareExtra = Database['public']['Tables']['care_extras_pet']['Row'];
type CareExtraInsert = Database['public']['Tables']['care_extras_pet']['Insert'];
type CareExtraUpdate = Database['public']['Tables']['care_extras_pet']['Update'];

export class CareExtrasService {
  async getCareExtras(): Promise<CareExtra[]> {
    const { data, error } = await supabase
      .from('care_extras_pet')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar extras de cuidado: ${error.message}`);
    }

    return data || [];
  }

  async getCareExtrasByCategory(category: string): Promise<CareExtra[]> {
    const { data, error } = await supabase
      .from('care_extras_pet')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar extras de cuidado por categoria: ${error.message}`);
    }

    return data || [];
  }

  async getCareExtra(id: string): Promise<CareExtra | null> {
    const { data, error } = await supabase
      .from('care_extras_pet')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar extra de cuidado: ${error.message}`);
    }

    return data;
  }

  async createCareExtra(careExtra: CareExtraInsert): Promise<CareExtra> {
    const { data, error } = await supabase
      .from('care_extras_pet')
      .insert(careExtra)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar extra de cuidado: ${error.message}`);
    }

    return data;
  }

  async updateCareExtra(id: string, careExtra: CareExtraUpdate): Promise<CareExtra> {
    const { data, error } = await supabase
      .from('care_extras_pet')
      .update(careExtra)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar extra de cuidado: ${error.message}`);
    }

    return data;
  }

  async deleteCareExtra(id: string): Promise<void> {
    const { error } = await supabase
      .from('care_extras_pet')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar extra de cuidado: ${error.message}`);
    }
  }

  async toggleCareExtraStatus(id: string): Promise<CareExtra> {
    const { data: current, error: fetchError } = await supabase
      .from('care_extras_pet')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Erro ao buscar status do extra de cuidado: ${fetchError.message}`);
    }

    const { data, error } = await supabase
      .from('care_extras_pet')
      .update({ is_active: !current.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao alterar status do extra de cuidado: ${error.message}`);
    }

    return data;
  }
}

export const careExtrasService = new CareExtrasService();
export type { CareExtra, CareExtraInsert, CareExtraUpdate };
