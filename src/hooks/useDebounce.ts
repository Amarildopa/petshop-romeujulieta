import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para debounce de valores
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos
 * @returns Valor debounced
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para debounce de callbacks
 * @param callback - Função a ser debounced
 * @param delay - Delay em milissegundos
 * @param deps - Dependências do callback
 * @returns Função debounced
 */
export const useDebouncedCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Atualizar referência do callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );

  return debouncedCallback;
};

/**
 * Hook para debounce com controle manual
 * @param delay - Delay em milissegundos
 * @returns Objeto com funções de controle
 */
export const useDebouncedState = <T>(
  initialValue: T,
  delay: number
) => {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    const newValue = typeof value === 'function' ? (value as (prev: T) => T)(immediateValue) : value;
    setImmediateValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(newValue);
    }, delay);
  }, [immediateValue, delay]);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setDebouncedValue(immediateValue);
    }
  }, [immediateValue]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setImmediateValue(debouncedValue);
    }
  }, [debouncedValue]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    value: immediateValue,
    debouncedValue,
    setValue,
    flush,
    cancel,
    isPending: immediateValue !== debouncedValue
  };
};

/**
 * Hook para throttle (limitar frequência de execução)
 * @param callback - Função a ser throttled
 * @param delay - Delay em milissegundos
 * @param deps - Dependências do callback
 * @returns Função throttled
 */
export const useThrottledCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Atualizar referência do callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now;
        callbackRef.current(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callbackRef.current(...args);
        }, delay - timeSinceLastCall);
      }
    }) as T,
    [delay]
  );

  return throttledCallback;
};

/**
 * Hook para busca com debounce
 * @param searchFunction - Função de busca
 * @param delay - Delay em milissegundos
 * @returns Objeto com estado da busca
 */
export const useDebouncedSearch = <T, P = string>(
  searchFunction: (params: P) => Promise<T[]>,
  delay: number = 300
) => {
  const [query, setQuery] = useState<P | null>(null);
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const debouncedQuery = useDebounce(query, delay);
  const searchRef = useRef(searchFunction);

  // Atualizar referência da função de busca
  useEffect(() => {
    searchRef.current = searchFunction;
  }, [searchFunction]);

  // Executar busca quando query debounced mudar
  useEffect(() => {
    if (debouncedQuery === null) {
      setResults([]);
      return;
    }

    const executeSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await searchRef.current(debouncedQuery);
        setResults(searchResults);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erro na busca');
        setError(error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    executeSearch();
  }, [debouncedQuery]);

  const search = useCallback((newQuery: P) => {
    setQuery(newQuery);
  }, []);

  const clear = useCallback(() => {
    setQuery(null);
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    results,
    isLoading,
    error,
    search,
    clear
  };
};

export default useDebounce;