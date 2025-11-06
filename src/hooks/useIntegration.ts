import { useState, useEffect, useCallback } from 'react';
import { integrationService } from '../services/integrationService';
import { weeklyBathsService } from '../services/weeklyBathsService';
import { petsService } from '../services/petsService';
import type { Pet as ServicePet } from '../services/petsService';
import type { 
  Pet, 
  IntegrationStats, 
  IntegrationPreviewData,
  ApprovalWithIntegrationResponse 
} from '../types/integration';
import type { WeeklyBath } from '../services/weeklyBathsService';

interface UseIntegrationState {
  pets: Pet[];
  stats: IntegrationStats | null;
  selectedPet: Pet | null;
  isLoading: boolean;
  error: string | null;
  previewData: IntegrationPreviewData | null;
}

interface UseIntegrationActions {
  loadPets: () => Promise<void>;
  loadStats: () => Promise<void>;
  selectPet: (pet: Pet | null) => void;
  generatePreview: (bath: WeeklyBath, pet: Pet) => Promise<void>;
  approveBathWithIntegration: (
    bathId: string, 
    approvedBy: string, 
    petId?: string
  ) => Promise<ApprovalWithIntegrationResponse>;
  validatePetForIntegration: (petId: string) => Promise<boolean>;
  checkBathIntegration: (bathId: string) => Promise<boolean>;
  clearError: () => void;
  clearPreview: () => void;
}

export function useIntegration(): UseIntegrationState & UseIntegrationActions {
  const [state, setState] = useState<UseIntegrationState>({
    pets: [],
    stats: null,
    selectedPet: null,
    isLoading: false,
    error: null,
    previewData: null,
  });

  // Helper: map petsService Pet -> integration Pet
  const mapUserPetsToIntegration = (userPets: ServicePet[]): Pet[] => {
    return (userPets || []).map((p: ServicePet) => ({
      id: p.id,
      name: p.name,
      breed: p.breed,
      avatar_url: p.avatar_url || null,
      owner_name: undefined,
      has_journey: undefined,
    }));
  };

  // Load pets for selection
  const loadPets = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Primeiro tenta via RPC dedicado
      const rpcPets = await integrationService.getPetsForSelection();
      if (rpcPets && rpcPets.length > 0) {
        setState(prev => ({ 
          ...prev, 
          pets: rpcPets, 
          isLoading: false 
        }));
        return;
      }

      // Fallback: carrega pets do usuário autenticado
      const userPets = await petsService.getPets();
      const mapped = mapUserPetsToIntegration(userPets);

      setState(prev => ({ 
        ...prev, 
        pets: mapped, 
        isLoading: false 
      }));
    } catch (error) {
      // Em caso de erro no RPC, tenta fallback
      try {
        const userPets = await petsService.getPets();
        const mapped = mapUserPetsToIntegration(userPets);
        setState(prev => ({ 
          ...prev, 
          pets: mapped, 
          isLoading: false 
        }));
      } catch {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Erro ao carregar pets',
          isLoading: false 
        }));
      }
    }
  }, []);

  // Load integration statistics
  const loadStats = useCallback(async () => {
    try {
      const stats = await integrationService.getIntegrationStats();
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erro ao carregar estatísticas'
      }));
    }
  }, []);

  // Select a pet
  const selectPet = useCallback((pet: Pet | null) => {
    setState(prev => ({ ...prev, selectedPet: pet, previewData: null }));
  }, []);

  // Generate preview of how the event will appear in the journey
  const generatePreview = useCallback(async (bath: WeeklyBath, pet: Pet) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, selectedPet: pet }));
    try {
      const preview = await integrationService.generateIntegrationPreview(bath.id);
      setState(prev => ({ ...prev, previewData: preview, isLoading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erro ao gerar preview',
        isLoading: false 
      }));
    }
  }, []);

  // Approve bath with integration
  const approveBathWithIntegration = useCallback(async (
    bathId: string, 
    approvedBy: string, 
    petId?: string
  ): Promise<ApprovalWithIntegrationResponse> => {
    try {
      return await integrationService.approveBathWithIntegration(bathId, approvedBy, petId);
    } catch (error) {
      return {
        bath_id: bathId,
        approved: false,
        added_to_journey: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }, []);

  // Validate pet for integration
  const validatePetForIntegration = useCallback(async (petId: string): Promise<boolean> => {
    try {
      return await integrationService.validatePetForIntegration(petId);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erro ao validar pet'
      }));
      return false;
    }
  }, []);

  // Check if bath is integrated
  const checkBathIntegration = useCallback(async (bathId: string): Promise<boolean> => {
    try {
      return await integrationService.isBathIntegrated(bathId);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erro ao verificar integração'
      }));
      return false;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear preview
  const clearPreview = useCallback(() => {
    setState(prev => ({ ...prev, previewData: null }));
  }, []);

  // Load pets on mount
  useEffect(() => {
    loadPets();
  }, [loadPets]);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    ...state,
    loadPets,
    loadStats,
    selectPet,
    generatePreview,
    approveBathWithIntegration,
    validatePetForIntegration,
    checkBathIntegration,
    clearError,
    clearPreview,
  };
}

// Hook for simplified integration status checking
export function useIntegrationStatus(bathId?: string) {
  const [isIntegrated, setIsIntegrated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const checkStatus = useCallback(async () => {
    if (!bathId) return;
    
    setIsLoading(true);
    try {
      const integrated = await weeklyBathsService.isBathIntegrated(bathId);
      setIsIntegrated(integrated);
    } catch (error) {
      console.error('Erro ao verificar status de integração:', error);
    } finally {
      setIsLoading(false);
    }
  }, [bathId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return { isIntegrated, isLoading, refresh: checkStatus };
}