import React, { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface SimpleAvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarUpdate: (url: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

const SimpleAvatarUpload: React.FC<SimpleAvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarUpdate,
  onUploadError,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const getAvatarUrl = (url: string | null | undefined): string => {
    if (url && url.startsWith('http')) {
      return url;
    }
    // Fallback para imagem padrão
    return '/images/default-avatar.svg';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validações básicas
    if (!file.type.startsWith('image/')) {
      onUploadError?.('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      onUploadError?.('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploading(true);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Upload para o bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Chamar callback de sucesso
      onAvatarUpdate(publicUrl);

    } catch (error) {
      console.error('Erro no upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no upload';
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="relative">
        <img
          src={getAvatarUrl(currentAvatarUrl)}
          alt="Avatar"
          className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-lg object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/default-avatar.svg';
          }}
        />
        
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
        
        <button
          onClick={handleCameraClick}
          disabled={uploading}
          className="absolute bottom-4 right-0 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-dark transition-all duration-200 cursor-pointer transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Alterar foto do perfil"
        >
          <Camera className="h-5 w-5" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};

export default SimpleAvatarUpload;