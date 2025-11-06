import { supabase } from '../lib/supabase';
import { 
  IntegrationService, 
  Pet, 
  IntegrationStats, 
  ApprovalWithIntegrationResponse,
  IntegrationPreviewData,
  DateRange 
} from '../types/integration';

class IntegrationServiceImpl implements IntegrationService {
  
  /**
   * Criar evento na jornada a partir do banho
   */
  async createJourneyEventFromBath(bathId: string): Promise<string> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.rpc('create_journey_event_from_bath', {
        bath_id: bathId,
        admin_id: user.user.id
      });

      if (error) {
        throw new Error(`Erro ao criar evento na jornada: ${error.message}`);
      }

      // Após criar, se houver curator_notes no banho, atualizar a descrição do evento
      try {
        const { data: bath } = await supabase
          .from('weekly_baths')
          .select('curator_notes')
          .eq('id', bathId)
          .single();
        const notes = bath?.curator_notes?.trim();
        if (notes) {
          await supabase
            .from('pet_events_pet')
            .update({ description: notes })
            .eq('id', data);
        }
      } catch (e) {
        console.warn('Não foi possível aplicar descrição personalizada ao evento recém-criado.', e);
      }

      return data as string;
    } catch (error) {
      console.error('Erro ao criar evento na jornada:', error);
      throw error;
    }
  }
  
  /**
   * Verificar se pet existe e é válido
   */
  async validatePetForIntegration(petId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('pets_pet')
        .select('id, active')
        .eq('id', petId)
        .eq('active', true)
        .single();

      if (error) {
        console.error('Erro ao validar pet:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erro ao validar pet:', error);
      return false;
    }
  }

  /**
   * Obter estatísticas de integração
   */
  async getIntegrationStats(dateRange?: DateRange): Promise<IntegrationStats> {
    try {
      const startDate = dateRange?.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = dateRange?.end_date || new Date().toISOString().split('T')[0];

      const { data, error } = await supabase.rpc('get_integration_stats', {
        start_date: startDate,
        end_date: endDate
      });

      if (error) {
        throw new Error(`Erro ao obter estatísticas: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Buscar pets disponíveis para seleção
   */
  async getPetsForSelection(): Promise<Pet[]> {
    try {
      const { data, error } = await supabase.rpc('get_pets_for_selection');

      if (error) {
        throw new Error(`Erro ao buscar pets: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
      throw error;
    }
  }

  /**
   * Aprovar banho com integração opcional
   */
  async approveBathWithIntegration(bathId: string, approvedBy: string, petId?: string): Promise<ApprovalWithIntegrationResponse> {
    try {
      // Se houver pet selecionado, persistir no registro do banho e sinalizar integração
      if (petId) {
        const { error: updateError } = await supabase
          .from('weekly_baths')
          .update({ pet_id: petId, add_to_journey: true })
          .eq('id', bathId);
        if (updateError) {
          throw new Error(`Erro ao vincular pet ao banho: ${updateError.message}`);
        }
      }

      // Usar o usuário autenticado como admin_id quando disponível
      const { data: user } = await supabase.auth.getUser();
      const adminId = user?.user?.id || approvedBy;

      const { data, error } = await supabase.rpc('approve_bath_with_integration', {
        bath_id: bathId,
        admin_id: adminId,
        should_add_to_journey: !!petId
      });

      if (error) {
        throw new Error(`Erro ao aprovar banho: ${error.message}`);
      }

      // Se foi criado evento e há curator_notes, aplicar como descrição
      try {
        const eventId = (data as Partial<ApprovalWithIntegrationResponse> | null)?.journey_event_id ?? null;
        if (eventId) {
          const { data: bath } = await supabase
            .from('weekly_baths')
            .select('curator_notes')
            .eq('id', bathId)
            .single();
          const notes = bath?.curator_notes?.trim();
          if (notes) {
            await supabase
              .from('pet_events_pet')
              .update({ description: notes })
              .eq('id', eventId);
          }
        }
      } catch (e) {
        console.warn('Falha ao atualizar descrição do evento com curator_notes durante aprovação.', e);
      }

      const response = data as Partial<ApprovalWithIntegrationResponse> | null;
      return {
        bath_id: response?.bath_id ?? bathId,
        approved: !!response?.approved,
        added_to_journey: !!response?.added_to_journey,
        journey_event_id: response?.journey_event_id,
        success: !!response?.success
      };
    } catch (error) {
      console.error('Erro ao aprovar banho com integração:', error);
      return {
        bath_id: bathId,
        approved: false,
        added_to_journey: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  /**
   * Gerar preview da integração
   */
  async generateIntegrationPreview(bathId: string): Promise<IntegrationPreviewData> {
    try {
      // Buscar dados do banho
      const { data: bath, error: bathError } = await supabase
        .from('weekly_baths')
        .select('pet_name, bath_date, image_url, curator_notes')
        .eq('id', bathId)
        .single();

      if (bathError) {
        throw new Error(`Erro ao buscar banho: ${bathError.message}`);
      }

      // Gerar dados do preview
      const eventTitle = `Banho e Tosa - ${bath.pet_name}`;
      const eventDescription = (bath.curator_notes && bath.curator_notes.trim().length > 0)
        ? bath.curator_notes
        : 'Evento criado automaticamente a partir dos banhos semanais.';

      return {
        pet_name: bath.pet_name,
        bath_date: bath.bath_date,
        image_url: bath.image_url,
        event_title: eventTitle,
        event_description: eventDescription,
        event_date: bath.bath_date,
        location: 'Pet Shop Romeu & Julieta'
      };
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      throw error;
    }
  }
  
  /**
   * Verificar se banho já foi integrado
   */
    async isBathIntegrated(bathId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('weekly_baths')
        .select('journey_event_id')
        .eq('id', bathId)
        .single();

      if (error) {
        console.error('Erro ao verificar integração:', error);
        return false;
      }

      return !!data?.journey_event_id;
    } catch (error) {
      console.error('Erro ao verificar integração:', error);
      return false;
    }
  }

  /**
   * Obter ID do evento da jornada criado a partir do banho
   */
  async getJourneyEventFromBath(bathId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('weekly_baths')
        .select('journey_event_id')
        .eq('id', bathId)
        .single();

      if (error) {
        console.error('Erro ao buscar evento da jornada:', error);
        return null;
      }

      return data?.journey_event_id || null;
    } catch (error) {
      console.error('Erro ao buscar evento da jornada:', error);
      return null;
    }
  }

  /**
   * Remover integração (desfazer)
   */
  async removeIntegration(bathId: string): Promise<boolean> {
    try {
      // Buscar o evento da jornada associado
      const eventId = await this.getJourneyEventFromBath(bathId);
      
      if (!eventId) {
        console.warn('Nenhum evento encontrado para remover');
        return true;
      }

      // Remover fotos do evento
      const { error: photosError } = await supabase
        .from('event_photos_pet')
        .delete()
        .eq('event_id', eventId);

      if (photosError) {
        console.error('Erro ao remover fotos do evento:', photosError);
      }

      // Remover evento
      const { error: eventError } = await supabase
        .from('pet_events_pet')
        .delete()
        .eq('id', eventId);

      if (eventError) {
        throw new Error(`Erro ao remover evento: ${eventError.message}`);
      }

      // Atualizar banho para remover referência
      const { error: bathError } = await supabase
        .from('weekly_baths')
        .update({ 
          journey_event_id: null,
          add_to_journey: false 
        })
        .eq('id', bathId);

      if (bathError) {
        throw new Error(`Erro ao atualizar banho: ${bathError.message}`);
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover integração:', error);
      return false;
    }
  }
}

// Exportar instância singleton
export const integrationService = new IntegrationServiceImpl();