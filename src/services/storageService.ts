import { supabase } from '../lib/supabase';

/**
 * Serviço para gerenciar uploads e otimização de imagens no Supabase Storage
 */
export class StorageService {
  private static instance: StorageService;
  private readonly bucketName = 'pet-photos'; // Bucket correto para fotos de eventos dos pets
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Valida um arquivo antes do upload
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Verifica tipo do arquivo
    if (!this.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Tipo de arquivo não suportado. Use: ${this.allowedTypes.join(', ')}`
      };
    }

    // Verifica tamanho do arquivo
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${this.maxFileSize / (1024 * 1024)}MB`
      };
    }

    return { isValid: true };
  }

  /**
   * Redimensiona uma imagem usando Canvas
   */
  private async resizeImage(
    file: File, 
    maxWidth: number = 800, 
    maxHeight: number = 600, 
    quality: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcula novas dimensões mantendo proporção
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Desenha a imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Converte para blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Erro ao redimensionar imagem'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Gera um nome único para o arquivo
   */
  private generateFileName(originalName: string, prefix: string = 'weekly-bath'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${prefix}-${timestamp}-${random}.${extension}`;
  }

  /**
   * Faz upload de uma imagem com otimização automática
   */
  async uploadImage(
    file: File,
    options: {
      folder?: string;
      resize?: boolean;
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      prefix?: string;
    } = {}
  ): Promise<{ url: string; path: string }> {
    const {
      folder = 'events', // Pasta para fotos de eventos dos pets
      resize = true,
      maxWidth = 800,
      maxHeight = 600,
      quality = 0.8,
      prefix = 'pet'
    } = options;

    console.log('🔍 StorageService.uploadImage iniciado:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      bucketName: this.bucketName,
      folder,
      prefix
    });

    // Valida o arquivo
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      console.error('❌ Validação falhou:', validation.error);
      throw new Error(validation.error);
    }

    try {
      let fileToUpload: File | Blob = file;

      // Redimensiona se solicitado
      if (resize) {
        console.log('🖼️ Redimensionando imagem...');
        fileToUpload = await this.resizeImage(file, maxWidth, maxHeight, quality);
        console.log('✅ Imagem redimensionada');
      }

      // Gera nome único
      const fileName = this.generateFileName(file.name, prefix);
      const filePath = `${folder}/${fileName}`;
      
      console.log('📁 Caminho do arquivo:', filePath);
      console.log('🪣 Bucket:', this.bucketName);

      // Faz upload
      console.log('⬆️ Iniciando upload...');
      const { error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('✅ Upload concluído com sucesso');

      // Obtém URL pública
      console.log('🔗 Obtendo URL pública...');
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      console.log('✅ URL pública obtida:', publicUrl);

      return {
        url: publicUrl,
        path: filePath
      };

    } catch (error) {
      console.error('💥 Erro no upload:', error);
      throw error;
    }
  }

  /**
   * Faz upload de múltiplas imagens
   */
  async uploadMultipleImages(
    files: File[],
    options: Parameters<typeof this.uploadImage>[1] = {}
  ): Promise<Array<{ url: string; path: string; originalName: string }>> {
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const result = await this.uploadImage(file, options);
        return {
          ...result,
          originalName: file.name
        };
      })
    );

    const successful: Array<{ url: string; path: string; originalName: string }> = [];
    const failed: Array<{ name: string; error: string }> = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        failed.push({
          name: files[index].name,
          error: result.reason.message
        });
      }
    });

    if (failed.length > 0) {
      console.warn('Alguns uploads falharam:', failed);
    }

    return successful;
  }

  /**
   * Remove uma imagem do storage
   */
  async deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) {
      throw new Error(`Erro ao deletar imagem: ${error.message}`);
    }
  }

  /**
   * Remove múltiplas imagens
   */
  async deleteMultipleImages(paths: string[]): Promise<void> {
    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove(paths);

    if (error) {
      throw new Error(`Erro ao deletar imagens: ${error.message}`);
    }
  }

  /**
   * Obtém URL otimizada para diferentes tamanhos
   */
  getOptimizedUrl(
    originalUrl: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {}
  ): string {
    // Se o Supabase suportar transformações de imagem, use aqui
    // Por enquanto, retorna a URL original
    const optimizedUrl = originalUrl;
    
    // Exemplo de como seria com transformações (se disponível):
    // const params = new URLSearchParams();
    // if (width) params.append('width', width.toString());
    // if (height) params.append('height', height.toString());
    // params.append('quality', quality.toString());
    // params.append('format', format);
    // optimizedUrl = `${originalUrl}?${params.toString()}`;
    
    return optimizedUrl;
  }

  /**
   * Obtém informações sobre o uso do storage
   */
  async getStorageInfo(): Promise<{
    totalFiles: number;
    totalSize: number;
    weeklyBathsFiles: number;
  }> {
    try {
      const { data: files, error } = await supabase.storage
        .from(this.bucketName)
        .list('events', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        throw new Error(`Erro ao obter informações: ${error.message}`);
      }

      const totalFiles = files?.length || 0;
      const totalSize = files?.reduce((acc, file) => acc + (file.metadata?.size || 0), 0) || 0;

      return {
        totalFiles,
        totalSize,
        eventPhotosFiles: totalFiles
      };
    } catch (error) {
      console.error('Erro ao obter informações do storage:', error);
      return {
          totalFiles: 0,
          totalSize: 0,
          eventPhotosFiles: 0
        };
    }
  }

  /**
   * Limpa arquivos antigos (mais de X dias)
   */
  async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    try {
      const { data: files, error } = await supabase.storage
        .from(this.bucketName)
        .list('events', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'asc' }
        });

      if (error || !files) {
        throw new Error(`Erro ao listar arquivos: ${error?.message}`);
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const filesToDelete = files.filter(file => {
        const fileDate = new Date(file.created_at);
        return fileDate < cutoffDate;
      });

      if (filesToDelete.length > 0) {
        const pathsToDelete = filesToDelete.map(file => `events/${file.name}`);
        await this.deleteMultipleImages(pathsToDelete);
      }

      return filesToDelete.length;
    } catch (error) {
      console.error('Erro na limpeza de arquivos antigos:', error);
      return 0;
    }
  }
}

// Instância singleton
export const storageService = StorageService.getInstance();

// Tipos auxiliares
export interface UploadResult {
  url: string;
  path: string;
}

export interface MultipleUploadResult extends UploadResult {
  originalName: string;
}

export interface StorageInfo {
  totalFiles: number;
  totalSize: number;
  eventPhotosFiles: number;
}
