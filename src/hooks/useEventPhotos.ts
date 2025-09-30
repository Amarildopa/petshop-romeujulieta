import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { EventPhoto } from './usePetEvents';

export interface UploadPhotoData {
  event_id: string;
  file: File;
  caption?: string;
  is_primary?: boolean;
}

export const useEventPhotos = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Upload photo to Supabase Storage and create database record
  const uploadPhoto = async (data: UploadPhotoData): Promise<EventPhoto | null> => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    }

    try {
      setUploading(true);
      setError(null);

      // Generate unique filename
      const fileExt = data.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `event-photos/${user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(filePath, data.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create database record
      const { data: photoRecord, error: dbError } = await supabase
        .from('event_photos_pet')
        .insert({
          event_id: data.event_id,
          user_id: user.id,
          file_path: filePath,
          file_name: data.file.name,
          file_size: data.file.size,
          mime_type: data.file.type,
          caption: data.caption,
          is_primary: data.is_primary || false,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return photoRecord;
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Erro ao fazer upload da foto');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Upload multiple photos
  const uploadMultiplePhotos = async (
    eventId: string,
    files: File[],
    captions?: string[]
  ): Promise<EventPhoto[]> => {
    const uploadedPhotos: EventPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const photo = await uploadPhoto({
        event_id: eventId,
        file: files[i],
        caption: captions?.[i],
        is_primary: i === 0, // First photo is primary
      });

      if (photo) {
        uploadedPhotos.push(photo);
      }
    }

    return uploadedPhotos;
  };

  // Get photo URL from Supabase Storage
  const getPhotoUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  // Delete photo
  const deletePhoto = async (photoId: string, filePath: string): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('pet-photos')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('event_photos_pet')
        .delete()
        .eq('id', photoId)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      return true;
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Erro ao deletar foto');
      return false;
    }
  };

  // Update photo caption
  const updatePhotoCaption = async (photoId: string, caption: string): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('event_photos_pet')
        .update({ caption })
        .eq('id', photoId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating photo caption:', err);
      setError('Erro ao atualizar legenda da foto');
      return false;
    }
  };

  // Set primary photo
  const setPrimaryPhoto = async (eventId: string, photoId: string): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      // First, unset all primary photos for this event
      await supabase
        .from('event_photos_pet')
        .update({ is_primary: false })
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      // Then set the selected photo as primary
      const { error } = await supabase
        .from('event_photos_pet')
        .update({ is_primary: true })
        .eq('id', photoId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error setting primary photo:', err);
      setError('Erro ao definir foto principal');
      return false;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  return {
    uploading,
    error,
    uploadPhoto,
    uploadMultiplePhotos,
    getPhotoUrl,
    deletePhoto,
    updatePhotoCaption,
    setPrimaryPhoto,
    clearError,
  };
};