import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseCacheOptions {
  ttl?: number; // Time to live em milissegundos
  staleWhileRevalidate?: boolean;
  maxAge?: number;
  onError?: (error: Error) => void;
}

interface UseCacheReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  refetch: () => Promise<void>;
  invalidate: () => void;
  setData: (data: T) => void;
}

class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheEntry<unknown>>();
  private subscribers = new Map<string, Set<() => void>>();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  get<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  set<T>(key: string, data: T, ttl: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };

    this.cache.set(key, entry);
    this.notifySubscribers(key);
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    this.notifySubscribers(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.notifySubscribers(key);
    });
  }

  subscribe(key: string, callback: () => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(callback);

    // Retornar função de unsubscribe
    return () => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  private notifySubscribers(key: string): void {
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.forEach(callback => callback());
    }
  }

  clear(): void {
    this.cache.clear();
    this.subscribers.forEach((subs) => {
      subs.forEach(callback => callback());
    });
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      subscribers: this.subscribers.size
    };
  }
}

export const useCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
): UseCacheReturn<T> => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutos por padrão
    staleWhileRevalidate = true,
    maxAge = 30 * 60 * 1000, // 30 minutos
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const cacheManager = CacheManager.getInstance();
  const fetcherRef = useRef(fetcher);
  const isMountedRef = useRef(true);

  // Atualizar referência do fetcher
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Função para buscar dados
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!isMountedRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Verificar cache primeiro (se não for refresh forçado)
      if (!forceRefresh) {
        const cached = cacheManager.get<T>(key);
        if (cached) {
          setData(cached.data);
          setIsStale(Date.now() - cached.timestamp > ttl);
          
          // Se não está stale, não precisa buscar novamente
          if (!isStale && !staleWhileRevalidate) {
            setIsLoading(false);
            return;
          }
        }
      }

      // Buscar dados frescos
      const freshData = await fetcherRef.current();
      
      if (!isMountedRef.current) return;

      // Salvar no cache
      cacheManager.set(key, freshData, Math.min(ttl, maxAge));
      
      setData(freshData);
      setIsStale(false);
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(error);
      onError?.(error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [key, ttl, maxAge, staleWhileRevalidate, onError, isStale, cacheManager]);

  // Função para refetch
  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Função para invalidar cache
  const invalidate = useCallback(() => {
    cacheManager.invalidate(key);
    setData(null);
    setIsStale(false);
    setError(null);
  }, [key, cacheManager]);

  // Função para definir dados manualmente
  const setDataManually = useCallback((newData: T) => {
    cacheManager.set(key, newData, ttl);
    setData(newData);
    setIsStale(false);
    setError(null);
  }, [key, ttl, cacheManager]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchData();
  }, [fetchData, cacheManager]);

  // Subscrever a mudanças no cache
  useEffect(() => {
    const unsubscribe = cacheManager.subscribe(key, () => {
      if (!isMountedRef.current) return;
      
      const cached = cacheManager.get<T>(key);
      if (cached) {
        setData(cached.data);
        setIsStale(Date.now() - cached.timestamp > ttl);
      } else {
        setData(null);
        setIsStale(false);
      }
    });

    return unsubscribe;
  }, [key, ttl, cacheManager]);

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch,
    invalidate,
    setData: setDataManually
  };
};

// Hook para invalidar múltiplas chaves
export const useCacheInvalidation = () => {
  const cacheManager = CacheManager.getInstance();

  const invalidateKeys = useCallback((keys: string[]) => {
    keys.forEach(key => cacheManager.invalidate(key));
  }, [cacheManager]);

  const invalidatePattern = useCallback((pattern: string) => {
    cacheManager.invalidatePattern(pattern);
  }, [cacheManager]);

  const clearAll = useCallback(() => {
    cacheManager.clear();
  }, [cacheManager]);

  const getStats = useCallback(() => {
    return cacheManager.getStats();
  }, [cacheManager]);

  return {
    invalidateKeys,
    invalidatePattern,
    clearAll,
    getStats
  };
};

export default useCache;