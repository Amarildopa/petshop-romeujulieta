import React from 'react';
import { ImageOff, RotateCcw } from 'lucide-react';
import { useLazyLoading } from '../hooks/useLazyLoading';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  placeholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
  showRetry?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  placeholder,
  errorPlaceholder,
  onLoad,
  onError,
  threshold,
  rootMargin,
  showRetry = true
}) => {
  const { imgRef, isLoaded, isInView, error, retry } = useLazyLoading(src, {
    threshold,
    rootMargin,
    fallbackSrc,
    onLoad,
    onError
  });

  // Placeholder padrão
  const defaultPlaceholder = (
    <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 bg-gray-300 rounded" />
    </div>
  );

  // Placeholder de erro padrão
  const defaultErrorPlaceholder = (
    <div className={`bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 ${className}`}>
      <ImageOff className="w-8 h-8 text-gray-400 mb-2" />
      <p className="text-sm text-gray-500 text-center mb-2">Erro ao carregar imagem</p>
      {showRetry && (
        <button
          onClick={retry}
          className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Tentar novamente</span>
        </button>
      )}
    </div>
  );

  // Se houve erro, mostrar placeholder de erro
  if (error) {
    return errorPlaceholder || defaultErrorPlaceholder;
  }

  // Se não está na viewport ou não carregou, mostrar placeholder
  if (!isInView || !isLoaded) {
    return (
      <>
        {placeholder || defaultPlaceholder}
        <img
          ref={imgRef}
          alt={alt}
          className="hidden"
          style={{ display: 'none' }}
        />
      </>
    );
  }

  // Imagem carregada
  return (
    <img
      ref={imgRef}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
};

export default LazyImage;