import React, { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface PetAvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarUpdate: (url: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  petName?: string;
}

const PetAvatarUpload: React.FC<PetAvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarUpdate,
  onUploadError,
  className = '',
  petName = 'Pet'
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const getAvatarUrl = (url: string | null | undefined): string => {
    if (url && url.startsWith('http')) {
      return url;
    }
    // Fallback para imagem padrão de pet
    return '/images/default-pet-avatar.svg';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🖼️ PetAvatarUpload: handleFileSelect iniciado');
    const file = event.target.files?.[0];
    if (!file || !user) {
      console.log('❌ PetAvatarUpload: Arquivo não selecionado ou usuário não autenticado');
      return;
    }

    console.log('📁 PetAvatarUpload: Arquivo selecionado:', file.name, 'Tamanho:', file.size);

    // Validações básicas
    if (!file.type.startsWith('image/')) {
      console.log('❌ PetAvatarUpload: Tipo de arquivo inválido:', file.type);
      onUploadError?.('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      console.log('❌ PetAvatarUpload: Arquivo muito grande:', file.size);
      onUploadError?.('A imagem deve ter no máximo 5MB.');
      return;
    }

    console.log('⏳ PetAvatarUpload: Iniciando upload...');
    setUploading(true);

    try {
      // Gerar nome único para o arquivo do pet
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      console.log('📝 PetAvatarUpload: Nome do arquivo gerado:', fileName);

      // Upload para o bucket 'avatars' no caminho 'pets/'
      console.log('☁️ PetAvatarUpload: Fazendo upload para bucket avatars/pets/');
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`pets/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.log('❌ PetAvatarUpload: Erro no upload:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('✅ PetAvatarUpload: Upload realizado com sucesso');

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(`pets/${fileName}`);

      const publicUrl = urlData.publicUrl;
      console.log('🔗 PetAvatarUpload: URL pública gerada:', publicUrl);

      // Chamar callback de sucesso
      console.log('📞 PetAvatarUpload: Chamando onAvatarUpdate com URL:', publicUrl);
      onAvatarUpdate(publicUrl);
      console.log('✅ PetAvatarUpload: Processo de upload concluído com sucesso');

    } catch (error) {
      console.error('❌ PetAvatarUpload: Erro no upload da imagem:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Erro desconhecido no upload');
    } finally {
      console.log('🏁 PetAvatarUpload: Finalizando processo, setUploading(false)');
      setUploading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCameraClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="relative">
        <img
          src={getAvatarUrl(currentAvatarUrl)}
          alt={`Foto de ${petName}`}
          className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/default-pet-avatar.svg';
          }}
        />
        
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
        
        <button
          type="button"
          onClick={handleCameraClick}
          disabled={uploading}
          className="absolute bottom-4 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-dark transition-all duration-200 cursor-pointer transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Alterar foto do pet"
        >
          <Camera className="h-4 w-4" />
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

export default PetAvatarUpload;