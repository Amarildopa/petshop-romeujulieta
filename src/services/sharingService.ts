import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface EventType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface EventPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  is_primary: boolean;
}

interface PetEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_type_id: string;
  event_types_pet: EventType;
  event_photos_pet: EventPhoto[];
}

export interface SharedJourney {
  id: string;
  pet_id: string;
  shared_by: string;
  shared_with?: string;
  share_token: string;
  is_public: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ShareJourneyData {
  pet_id: string;
  is_public: boolean;
  expires_at?: string;
  shared_with?: string;
}

class SharingService {
  /**
   * Cria um link de compartilhamento para a jornada de um pet
   */
  async createShareLink(data: ShareJourneyData, user: User): Promise<SharedJourney> {
    const shareToken = this.generateShareToken();
    
    const { data: sharedJourney, error } = await supabase
      .from('shared_journeys_pet')
      .insert({
        pet_id: data.pet_id,
        shared_by: user.id,
        shared_with: data.shared_with,
        share_token: shareToken,
        is_public: data.is_public,
        expires_at: data.expires_at
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar link de compartilhamento: ${error.message}`);
    }

    return sharedJourney;
  }

  /**
   * Busca uma jornada compartilhada pelo token
   */
  async getSharedJourney(shareToken: string): Promise<SharedJourney | null> {
    const { data, error } = await supabase
      .from('shared_journeys_pet')
      .select('*')
      .eq('share_token', shareToken)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      throw new Error(`Erro ao buscar jornada compartilhada: ${error.message}`);
    }

    // Verifica se o link expirou
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    return data;
  }

  /**
   * Lista todas as jornadas compartilhadas por um usuário
   */
  async getUserSharedJourneys(userId: string): Promise<SharedJourney[]> {
    const { data, error } = await supabase
      .from('shared_journeys_pet')
      .select(`
        *,
        pets_pet!inner(name, species, image_url)
      `)
      .eq('shared_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar jornadas compartilhadas: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Revoga um link de compartilhamento
   */
  async revokeShareLink(shareId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('shared_journeys_pet')
      .delete()
      .eq('id', shareId)
      .eq('shared_by', userId);

    if (error) {
      throw new Error(`Erro ao revogar link de compartilhamento: ${error.message}`);
    }
  }

  /**
   * Atualiza as configurações de um link de compartilhamento
   */
  async updateShareLink(
    shareId: string, 
    userId: string, 
    updates: Partial<Pick<SharedJourney, 'is_public' | 'expires_at' | 'shared_with'>>
  ): Promise<SharedJourney> {
    const { data, error } = await supabase
      .from('shared_journeys_pet')
      .update(updates)
      .eq('id', shareId)
      .eq('shared_by', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar link de compartilhamento: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca eventos de uma jornada compartilhada
   */
  async getSharedJourneyEvents(petId: string, shareToken?: string): Promise<PetEvent[]> {
    // Se não há token, verifica se a jornada é pública
    if (!shareToken) {
      const { data: publicShare } = await supabase
        .from('shared_journeys_pet')
        .select('*')
        .eq('pet_id', petId)
        .eq('is_public', true)
        .single();

      if (!publicShare) {
        throw new Error('Jornada não é pública');
      }
    } else {
      // Verifica se o token é válido
      const sharedJourney = await this.getSharedJourney(shareToken);
      if (!sharedJourney || sharedJourney.pet_id !== petId) {
        throw new Error('Token de compartilhamento inválido');
      }
    }

    // Busca os eventos do pet
    const { data: events, error } = await supabase
      .from('pet_events_pet')
      .select(`
        *,
        event_types_pet(name, icon, color),
        event_photos_pet(id, photo_url, caption, is_primary)
      `)
      .eq('pet_id', petId)
      .order('event_date', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar eventos da jornada: ${error.message}`);
    }

    return events || [];
  }

  /**
   * Gera um token único para compartilhamento
   */
  private generateShareToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Gera URL completa para compartilhamento
   */
  generateShareUrl(shareToken: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared-journey/${shareToken}`;
  }

  /**
   * Copia URL de compartilhamento para a área de transferência
   */
  async copyShareUrl(shareToken: string): Promise<void> {
    const url = this.generateShareUrl(shareToken);
    
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    } else {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
}

export const sharingService = new SharingService();
export default sharingService;