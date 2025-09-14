import { useState, useCallback, useRef, useEffect } from 'react'
import { metrics } from '../lib/metrics'
import { logger } from '../lib/logger'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

interface ApiOptions {
  retries?: number
  retryDelay?: number
  timeout?: number
  cache?: boolean
  cacheTime?: number
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

// Cache global para requisições
const apiCache = new Map<string, CacheEntry<unknown>>()

export const useApi = <T>(
  apiCall: () => Promise<T>,
  options: ApiOptions = {}
) => {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    cache = true,
    cacheTime = 5 * 60 * 1000 // 5 minutos
  } = options

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const retryCount = useRef(0)
  const abortController = useRef<AbortController | null>(null)
  const cacheKey = useRef<string>('')

  // Gerar chave de cache baseada na função
  useEffect(() => {
    cacheKey.current = apiCall.toString()
  }, [apiCall])

  const execute = useCallback(async (forceRefresh = false) => {
    // Verificar cache
    if (cache && !forceRefresh && apiCache.has(cacheKey.current)) {
      const cached = apiCache.get(cacheKey.current)!
      if (Date.now() < cached.expiresAt) {
        setState({
          data: cached.data,
          loading: false,
          error: null
        })
        return cached.data
      } else {
        apiCache.delete(cacheKey.current)
      }
    }

    // Cancelar requisição anterior
    if (abortController.current) {
      abortController.current.abort()
    }

    // Criar novo AbortController
    abortController.current = new AbortController()

    setState(prev => ({ ...prev, loading: true, error: null }))

    const startTime = performance.now()

    try {
      // Timeout
      const timeoutId = setTimeout(() => {
        abortController.current?.abort()
      }, timeout)

      const result = await apiCall()

      clearTimeout(timeoutId)

      const duration = performance.now() - startTime

      // Atualizar cache
      if (cache) {
        apiCache.set(cacheKey.current, {
          data: result,
          timestamp: Date.now(),
          expiresAt: Date.now() + cacheTime
        })
      }

      // Métricas
      metrics.recordPerformance('api_call', duration, {
        endpoint: cacheKey.current,
        cached: false
      })

      setState({
        data: result,
        loading: false,
        error: null
      })

      retryCount.current = 0
      return result

    } catch (error) {
      const duration = performance.now() - startTime
      const isAborted = error instanceof Error && error.name === 'AbortError'

      if (!isAborted) {
        logger.error('API call failed', error as Error, {
          duration,
          retryCount: retryCount.current,
          cacheKey: cacheKey.current
        }, 'API')

        // Retry logic
        if (retryCount.current < retries) {
          retryCount.current += 1
          
          logger.info(`Retrying API call (${retryCount.current}/${retries})`, {
            cacheKey: cacheKey.current,
            delay: retryDelay
          }, 'API')

          setTimeout(() => {
            execute(forceRefresh)
          }, retryDelay * retryCount.current)

          return
        }

        metrics.recordError('api_call_failed', (error as Error).message, 1, undefined, {
          endpoint: cacheKey.current,
          retryCount: retryCount.current
        })
      }

      setState({
        data: null,
        loading: false,
        error: error as Error
      })

      throw error
    }
  }, [apiCall, retries, retryDelay, timeout, cache, cacheTime])

  const refetch = useCallback(() => {
    return execute(true)
  }, [execute])

  const clearCache = useCallback(() => {
    if (cacheKey.current) {
      apiCache.delete(cacheKey.current)
    }
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [])

  return {
    ...state,
    execute,
    refetch,
    clearCache
  }
}

// Hook para múltiplas chamadas de API
export const useMultipleApi = <T extends Record<string, unknown>>(
  apiCalls: { [K in keyof T]: () => Promise<T[K]> }
) => {
  const [state, setState] = useState<{
    data: Partial<T> | null
    loading: boolean
    error: Error | null
  }>({
    data: null,
    loading: false,
    error: null
  })

  const executeAll = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const results = await Promise.allSettled(
        Object.entries(apiCalls).map(([key, apiCall]) =>
          apiCall().then(result => [key, result] as const)
        )
      )

      const data: Partial<T> = {}
      const errors: Error[] = []

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const [key, value] = result.value
          data[key as keyof T] = value
        } else {
          errors.push(result.reason)
        }
      })

      if (errors.length > 0) {
        logger.warn('Some API calls failed', { errors }, 'API')
      }

      setState({
        data,
        loading: false,
        error: errors.length === results.length ? errors[0] : null
      })

      return data
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as Error
      })
      throw error
    }
  }, [apiCalls])

  return {
    ...state,
    executeAll
  }
}

// Hook para paginação
export const usePaginatedApi = <T>(
  apiCall: (page: number, limit: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
  limit: number = 10
) => {
  const [state, setState] = useState<{
    data: T[]
    loading: boolean
    error: Error | null
    page: number
    hasMore: boolean
    total: number
  }>({
    data: [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true,
    total: 0
  })

  const loadPage = useCallback(async (page: number, append = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await apiCall(page, limit)

      setState(prev => ({
        ...prev,
        data: append ? [...prev.data, ...result.data] : result.data,
        loading: false,
        page,
        hasMore: result.hasMore,
        total: result.total
      }))

      return result
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }))
      throw error
    }
  }, [apiCall, limit])

  const loadNextPage = useCallback(() => {
    if (state.hasMore && !state.loading) {
      return loadPage(state.page + 1, true)
    }
  }, [loadPage, state.hasMore, state.loading, state.page])

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      page: 1,
      hasMore: true,
      total: 0
    })
  }, [])

  return {
    ...state,
    loadPage,
    loadNextPage,
    reset
  }
}

// Utilitário para limpar cache
export const clearApiCache = () => {
  apiCache.clear()
  logger.info('API cache cleared', {}, 'CACHE')
}

// Utilitário para obter estatísticas do cache
export const getApiCacheStats = () => {
  const entries = Array.from(apiCache.entries())
  const now = Date.now()
  
  return {
    totalEntries: entries.length,
    expiredEntries: entries.filter(([, entry]) => now >= entry.expiresAt).length,
    totalSize: entries.reduce((acc, [, entry]) => acc + JSON.stringify(entry.data).length, 0)
  }
}

export default {
  useApi,
  useMultipleApi,
  usePaginatedApi,
  clearApiCache,
  getApiCacheStats
}
