import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface EventType {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  is_system: boolean;
}

export interface PetEvent {
  id: string;
  pet_id: string;
  user_id: string;
  event_type_id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  is_milestone: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  weekly_bath_source_id?: string; // NOVO: ID do banho semanal que originou este evento
  event_type?: EventType;
  photos?: EventPhoto[];
}

export interface EventPhoto {
  id: string;
  event_id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  caption?: string;
  is_primary: boolean;
  created_at: string;
  photo_url?: string; // Generated public URL
}

export interface CreateEventData {
  pet_id: string;
  event_type_id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  is_milestone?: boolean;
  metadata?: Record<string, unknown>;
}

export const usePetEvents = (petId?: string) => {
  const [events, setEvents] = useState<PetEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch event types
  const fetchEventTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('event_types_pet')
        .select('*')
        .order('name');

      if (error) throw error;
      setEventTypes(data || []);
    } catch (err) {
      console.error('Error fetching event types:', err);
      setError('Erro ao carregar tipos de eventos');
    }
  };

  // Generate photo URL from file path
  const getPhotoUrl = useCallback((filePath: string): string => {
    const { data } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }, []);

  // Helpers: normalizar file_path e criar URL
  const isPublicUrl = useCallback((s: string) => s.startsWith('http://') || s.startsWith('https://'), []);
  const extractPathFromPublicUrl = useCallback((url: string): string | null => {
    const marker = '/object/public/pet-photos/';
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.slice(idx + marker.length);
  }, []);
  const getPhotoUrlFromFilePathOrUrl = useCallback((value: string): string => {
    if (isPublicUrl(value)) {
      const path = extractPathFromPublicUrl(value);
      if (path) {
        return getPhotoUrl(path);
      }
      return value; // já é URL pública utilizável
    }
    return getPhotoUrl(value);
  }, [isPublicUrl, extractPathFromPublicUrl, getPhotoUrl]);

  // Process photos to add public URLs (e normalizar file_path)
  const processPhotos = useCallback((photos: EventPhoto[]): EventPhoto[] => {
    return photos.map(photo => {
      const normalizedPath = isPublicUrl(photo.file_path)
        ? (extractPathFromPublicUrl(photo.file_path) ?? photo.file_path)
        : photo.file_path;
      const photoUrl = getPhotoUrlFromFilePathOrUrl(photo.file_path);
      return {
        ...photo,
        file_path: normalizedPath,
        photo_url: photoUrl,
      };
    });
  }, [getPhotoUrlFromFilePathOrUrl, isPublicUrl, extractPathFromPublicUrl]);

  // Fetch pet events
  const fetchPetEvents = useCallback(async () => {
    if (!petId || !user) {
      console.log('🔄 usePetEvents - Missing petId or user, skipping fetch');
      return;
    }

    try {
      console.log('🔄 usePetEvents - Starting fetch for petId:', petId);
      setLoading(true);
      const { data, error } = await supabase
        .from('pet_events_pet')
        .select(`
          *,
          event_type:event_types_pet(*),
          photos:event_photos_pet(*)
        `)
        .eq('pet_id', petId)
        // Removido filtro por user_id para exibir eventos integrados criados por admins
        .order('event_date', { ascending: false });

      if (error) throw error;
      
      console.log('✅ usePetEvents - Raw data fetched:', data?.length, 'events');
      
      // Process events to add photo URLs
      const processedEvents: PetEvent[] = (data || []).map((event: PetEvent) => ({
        ...event,
        photos: event.photos ? processPhotos(event.photos as EventPhoto[]) : []
      }));

      // Fallback: eventos sem fotos mas com weekly_bath_source_id -> buscar image_path/image_url dos banhos
      const missingPhotoBathIds = processedEvents
        .filter(e => e.weekly_bath_source_id && (!e.photos || e.photos.length === 0))
        .map(e => e.weekly_bath_source_id!)
        .filter(Boolean);

      let bathsById: Record<string, { id: string; image_path?: string; image_url?: string }> = {};
      if (missingPhotoBathIds.length > 0) {
        const { data: bathsData, error: bathsError } = await supabase
          .from('weekly_baths')
          .select('id,image_path,image_url')
          .in('id', missingPhotoBathIds);
        if (!bathsError && bathsData) {
          const bathsArray = bathsData as Array<{ id: string; image_path?: string; image_url?: string }>;
          bathsById = Object.fromEntries(bathsArray.map(b => [b.id, b]));
        } else {
          console.warn('⚠️ usePetEvents - Falha ao buscar weekly_baths para fallback', bathsError);
        }
      }

      const withFallback = processedEvents.map(e => {
        if (e.weekly_bath_source_id && (!e.photos || e.photos.length === 0)) {
          const bath = bathsById[e.weekly_bath_source_id];
          if (bath) {
            const path = bath.image_path ?? extractPathFromPublicUrl(bath.image_url || '') ?? undefined;
            if (path) {
              const url = getPhotoUrlFromFilePathOrUrl(path);
              const name = path.split('/').pop() || 'photo.jpg';
              const fallbackPhoto: EventPhoto = {
                id: `fallback-${e.id}`,
                event_id: e.id,
                user_id: e.user_id,
                file_path: path,
                file_name: name,
                is_primary: true,
                created_at: new Date().toISOString(),
                photo_url: url,
              };
              return { ...e, photos: [fallbackPhoto] };
            }
          }
        }
        return e;
      });
      
      console.log('✅ usePetEvents - Processed events (with fallback):', withFallback.length);
      setEvents(withFallback);
    } catch (err) {
      console.error('❌ usePetEvents - Error fetching pet events:', err);
      setError('Erro ao carregar eventos do pet');
    } finally {
      setLoading(false);
    }
  }, [petId, user, processPhotos, getPhotoUrlFromFilePathOrUrl, extractPathFromPublicUrl]);

  // Create new event
  const createEvent = async (eventData: CreateEventData): Promise<PetEvent | null> => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('pet_events_pet')
        .insert({
          ...eventData,
          user_id: user.id,
        })
        .select(`
          *,
          event_type:event_types_pet(*),
          photos:event_photos_pet(*)
        `)
        .single();

      if (error) throw error;

      // Process photos to add URLs
      const processedEvent = {
        ...data,
        photos: data.photos ? processPhotos(data.photos) : []
      };

      // Update local state
      setEvents(prev => [processedEvent as PetEvent, ...prev]);
      return processedEvent as PetEvent;
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Erro ao criar evento');
      return null;
    }
  };

  // Update event
  const updateEvent = async (eventId: string, updates: Partial<CreateEventData>): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('pet_events_pet')
        .update(updates)
        .eq('id', eventId)
        .eq('user_id', user.id)
        .select(`
          *,
          event_type:event_types_pet(*),
          photos:event_photos_pet(*)
        `)
        .single();

      if (error) throw error;

      // Process photos to add URLs
      const processedEvent = {
        ...data,
        photos: data.photos ? processPhotos(data.photos) : []
      } as PetEvent;

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId ? processedEvent : event
      ));
      return true;
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Erro ao atualizar evento');
      return false;
    }
  };

  // Delete event
  const deleteEvent = async (eventId: string): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('pet_events_pet')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setEvents(prev => prev.filter(event => event.id !== eventId));
      return true;
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Erro ao deletar evento');
      return false;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  useEffect(() => {
    fetchEventTypes();
  }, []);

  useEffect(() => {
    fetchPetEvents();
  }, [fetchPetEvents]);

  return {
    events,
    eventTypes,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    clearError,
  };
};