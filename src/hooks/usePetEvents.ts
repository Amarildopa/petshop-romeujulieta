import { useState, useEffect } from 'react';
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
  const getPhotoUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  // Process photos to add public URLs
  const processPhotos = (photos: EventPhoto[]): EventPhoto[] => {
    return photos.map(photo => ({
      ...photo,
      photo_url: getPhotoUrl(photo.file_path)
    }));
  };

  // Fetch pet events
  const fetchPetEvents = async () => {
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
        .eq('user_id', user.id)
        .order('event_date', { ascending: false });

      if (error) throw error;
      
      console.log('✅ usePetEvents - Raw data fetched:', data?.length, 'events');
      
      // Process events to add photo URLs
      const processedEvents = (data || []).map(event => ({
        ...event,
        photos: event.photos ? processPhotos(event.photos) : []
      }));
      
      console.log('✅ usePetEvents - Processed events:', processedEvents.length);
      setEvents(processedEvents);
    } catch (err) {
      console.error('❌ usePetEvents - Error fetching pet events:', err);
      setError('Erro ao carregar eventos do pet');
    } finally {
      setLoading(false);
    }
  };

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
      setEvents(prev => [processedEvent, ...prev]);
      return processedEvent;
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
      };

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
    if (petId && user) {
      fetchPetEvents();
    }
  }, [petId, user]);

  return {
    events,
    eventTypes,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchPetEvents,
    clearError,
  };
};