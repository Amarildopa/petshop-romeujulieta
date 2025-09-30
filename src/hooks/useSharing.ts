import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { sharingService, SharedJourney, ShareJourneyData } from '../services/sharingService';
import { toast } from 'sonner';

export interface UseSharing {
  sharedJourneys: SharedJourney[];
  loading: boolean;
  error: string | null;
  createShareLink: (data: ShareJourneyData) => Promise<SharedJourney | null>;
  revokeShareLink: (shareId: string) => Promise<void>;
  updateShareLink: (shareId: string, updates: Partial<Pick<SharedJourney, 'is_public' | 'expires_at' | 'shared_with'>>) => Promise<void>;
  copyShareUrl: (shareToken: string) => Promise<void>;
  loadUserSharedJourneys: () => Promise<void>;
  generateShareUrl: (shareToken: string) => string;
}

export const useSharing = (): UseSharing => {
  const { user } = useAuth();
  const [sharedJourneys, setSharedJourneys] = useState<SharedJourney[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShareLink = useCallback(async (data: ShareJourneyData): Promise<SharedJourney | null> => {
    if (!user) {
      setError('Usuário não autenticado');
      toast.error('Você precisa estar logado para compartilhar');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const sharedJourney = await sharingService.createShareLink(data, user);
      
      // Atualiza a lista local
      setSharedJourneys(prev => [sharedJourney, ...prev]);
      
      toast.success('Link de compartilhamento criado com sucesso!');
      return sharedJourney;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar link de compartilhamento';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const revokeShareLink = useCallback(async (shareId: string): Promise<void> => {
    if (!user) {
      setError('Usuário não autenticado');
      toast.error('Você precisa estar logado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sharingService.revokeShareLink(shareId, user.id);
      
      // Remove da lista local
      setSharedJourneys(prev => prev.filter(journey => journey.id !== shareId));
      
      toast.success('Link de compartilhamento revogado');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao revogar link';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateShareLink = useCallback(async (
    shareId: string, 
    updates: Partial<Pick<SharedJourney, 'is_public' | 'expires_at' | 'shared_with'>>
  ): Promise<void> => {
    if (!user) {
      setError('Usuário não autenticado');
      toast.error('Você precisa estar logado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedJourney = await sharingService.updateShareLink(shareId, user.id, updates);
      
      // Atualiza na lista local
      setSharedJourneys(prev => 
        prev.map(journey => 
          journey.id === shareId ? updatedJourney : journey
        )
      );
      
      toast.success('Configurações de compartilhamento atualizadas');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar configurações';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const copyShareUrl = useCallback(async (shareToken: string): Promise<void> => {
    try {
      await sharingService.copyShareUrl(shareToken);
      toast.success('Link copiado para a área de transferência!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao copiar link';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  const loadUserSharedJourneys = useCallback(async (): Promise<void> => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const journeys = await sharingService.getUserSharedJourneys(user.id);
      setSharedJourneys(journeys);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar jornadas compartilhadas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const generateShareUrl = useCallback((shareToken: string): string => {
    return sharingService.generateShareUrl(shareToken);
  }, []);

  return {
    sharedJourneys,
    loading,
    error,
    createShareLink,
    revokeShareLink,
    updateShareLink,
    copyShareUrl,
    loadUserSharedJourneys,
    generateShareUrl
  };
};

export default useSharing;