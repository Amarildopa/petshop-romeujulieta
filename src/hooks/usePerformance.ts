import { useCallback, useMemo, useRef, useEffect } from 'react'
import { metrics } from '../lib/metrics'
import { logger } from '../lib/logger'

// Hook para debounce
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook para throttle
export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay]
  )
}

// Hook para medir performance de componentes
export const useComponentPerformance = (componentName: string) => {
  const renderStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)

  useEffect(() => {
    renderStartTime.current = performance.now()
    renderCount.current += 1

    return () => {
      const renderTime = performance.now() - renderStartTime.current
      metrics.componentRender(componentName, renderTime)
      
      if (renderTime > 16) { // Mais de 16ms (60fps)
        logger.warn(`Slow component render: ${componentName}`, { 
          renderTime, 
          renderCount: renderCount.current 
        }, 'PERFORMANCE')
      }
    }
  })

  return {
    renderCount: renderCount.current
  }
}

// Hook para otimizar listas grandes
export const useVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = React.useState(0)

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    )
    return { start: Math.max(0, start - overscan), end }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }))
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.start * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  }
}

// Hook para cache de dados
export const useDataCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutos
) => {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null)

  const fetchData = useCallback(async () => {
    // Verificar cache
    if (cacheRef.current && Date.now() - cacheRef.current.timestamp < ttl) {
      setData(cacheRef.current.data)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await metrics.measureAsync(`cache_fetch_${key}`, fetcher)
      
      // Atualizar cache
      cacheRef.current = {
        data: result,
        timestamp: Date.now()
      }
      
      setData(result)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error(`Cache fetch failed: ${key}`, error, { key }, 'CACHE')
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl])

  const invalidateCache = useCallback(() => {
    cacheRef.current = null
    setData(null)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidateCache
  }
}

// Hook para otimizar re-renders
export const useOptimizedCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps)
}

export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps)
}

// Hook para intersection observer (lazy loading)
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const [hasIntersected, setHasIntersected] = React.useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [ref, options, hasIntersected])

  return { isIntersecting, hasIntersected }
}

// Hook para medir performance de API calls
export const useApiPerformance = () => {
  const measureApiCall = useCallback(async <T>(
    name: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await apiCall()
      const duration = performance.now() - startTime
      
      metrics.apiCall(name, 'GET', duration, 200)
      
      if (duration > 1000) { // Mais de 1 segundo
        logger.warn(`Slow API call: ${name}`, { duration }, 'API')
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      const statusCode = (error as { status?: number })?.status || 500
      
      metrics.apiError(name, 'GET', statusCode, (error as Error).message)
      logger.error(`API call failed: ${name}`, error as Error, { duration }, 'API')
      
      throw error
    }
  }, [])

  return { measureApiCall }
}

// Hook para otimizar formulários
export const useFormPerformance = (formName: string) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const submitCount = useRef(0)

  const handleSubmit = useCallback(async <T>(
    submitFn: () => Promise<T>
  ): Promise<T> => {
    if (isSubmitting) return Promise.reject(new Error('Form is already submitting'))
    
    setIsSubmitting(true)
    submitCount.current += 1
    
    const startTime = performance.now()
    
    try {
      const result = await submitFn()
      const duration = performance.now() - startTime
      
      metrics.recordPerformance(`form_submit_${formName}`, duration)
      logger.info(`Form submitted: ${formName}`, { duration, submitCount: submitCount.current }, 'FORM')
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      logger.error(`Form submit failed: ${formName}`, error as Error, { duration }, 'FORM')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [formName, isSubmitting])

  return {
    isSubmitting,
    handleSubmit,
    submitCount: submitCount.current
  }
}

export default {
  useDebounce,
  useThrottle,
  useComponentPerformance,
  useVirtualizedList,
  useDataCache,
  useOptimizedCallback,
  useOptimizedMemo,
  useIntersectionObserver,
  useApiPerformance,
  useFormPerformance
}
