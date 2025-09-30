import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

interface UseLazyLoadingReturn {
  imgRef: React.RefObject<HTMLImageElement>;
  isLoaded: boolean;
  isInView: boolean;
  error: boolean;
  retry: () => void;
}

export const useLazyLoading = (
  src: string,
  options: UseLazyLoadingOptions = {}
): UseLazyLoadingReturn => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    fallbackSrc,
    onLoad,
    onError
  } = options;

  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);

  // Função para tentar carregar a imagem novamente
  const retry = useCallback(() => {
    setError(false);
    setIsLoaded(false);
    setCurrentSrc(src);
  }, [src]);

  // Intersection Observer para detectar quando a imagem entra na viewport
  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setCurrentSrc(src);
          observer.unobserve(imgElement);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(imgElement);

    return () => {
      observer.unobserve(imgElement);
    };
  }, [src, threshold, rootMargin]);

  // Gerenciar carregamento da imagem
  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement || !currentSrc) return;

    const handleLoad = () => {
      setIsLoaded(true);
      setError(false);
      onLoad?.();
    };

    const handleError = () => {
      setError(true);
      setIsLoaded(false);
      onError?.();
      
      // Tentar carregar imagem de fallback se disponível
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      }
    };

    imgElement.addEventListener('load', handleLoad);
    imgElement.addEventListener('error', handleError);

    // Definir src apenas se ainda não foi definido
    if (imgElement.src !== currentSrc) {
      imgElement.src = currentSrc;
    }

    return () => {
      imgElement.removeEventListener('load', handleLoad);
      imgElement.removeEventListener('error', handleError);
    };
  }, [currentSrc, fallbackSrc, onLoad, onError]);

  return {
    imgRef,
    isLoaded,
    isInView,
    error,
    retry
  };
};

export default useLazyLoading;