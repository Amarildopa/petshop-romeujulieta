// =============================================
// TIPOS PARA INTEGRAÇÃO BANHOS SEMANAIS E JORNADA
// =============================================

export interface Pet {
  id: string;
  name: string;
  breed: string;
  avatar_url?: string | null;
  owner_name?: string;
  owner_email?: string;
  // opcional: indica se pet já possui jornada
  has_journey?: boolean;
}

export interface IntegrationStats {
  period: {
    start_date: string;
    end_date: string;
  };
  total_approved_baths: number;
  integrated_baths: number;
  integration_rate: number;
  non_integrated_baths: number;
}

export interface IntegrationResult {
  success: boolean;
  bath_id: string;
  journey_event_id?: string;
  message?: string;
}

export interface JourneyEvent {
  id: string;
  pet_id: string;
  user_id: string;
  event_type_id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  is_milestone: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  weekly_bath_source_id?: string;
}

export interface ApprovalWithIntegrationRequest {
  bath_id: string;
  approved_by: string;
  add_to_journey: boolean;
  pet_id?: string;
}

export interface ApprovalWithIntegrationResponse {
  bath_id: string;
  approved: boolean;
  added_to_journey: boolean;
  journey_event_id?: string;
  success: boolean;
  error?: string;
}

export interface IntegrationPreviewData {
  pet_name: string;
  bath_date: string;
  image_url: string;
  event_title?: string;
  event_description?: string;
  event_date?: string;
  location?: string;
}

export interface IntegrationService {
  // Criar evento na jornada a partir do banho
  createJourneyEventFromBath(bathId: string): Promise<string>;
  
  // Verificar se pet existe e é válido
  validatePetForIntegration(petId: string): Promise<boolean>;
  
  // Obter estatísticas de integração
  getIntegrationStats(dateRange?: { start_date: string; end_date: string }): Promise<IntegrationStats>;
  
  // Buscar pets disponíveis para seleção
  getPetsForSelection(): Promise<Pet[]>;
  
  // Aprovar banho com integração opcional
  approveBathWithIntegration(request: ApprovalWithIntegrationRequest): Promise<ApprovalWithIntegrationResponse>;
  
  // Gerar preview da integração
  generateIntegrationPreview(bathId: string): Promise<IntegrationPreviewData>;
}

export interface DateRange {
  start_date: string;
  end_date: string;
}