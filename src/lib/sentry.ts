import * as Sentry from '@sentry/react'

// Configuração do Sentry
export const initSentry = () => {
  Sentry.init({
    dsn: (import.meta as unknown as { env: { VITE_SENTRY_DSN?: string } }).env.VITE_SENTRY_DSN || '',
    environment: (import.meta as unknown as { env: { MODE?: string } }).env.MODE || 'development',
    integrations: [
      // Integrações básicas do Sentry
    ],
    // Performance Monitoring
    tracesSampleRate: (import.meta as unknown as { env: { MODE?: string } }).env.MODE === 'production' ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: (import.meta as unknown as { env: { MODE?: string } }).env.MODE === 'production' ? 0.1 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Profiling (desabilitado para evitar problemas de build)
    // profilesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    
    beforeSend(event, hint) {
      // Filtrar eventos sensíveis
      if (event.exception) {
        const error = hint.originalException
        if (error instanceof Error) {
          // Filtrar erros conhecidos que não são úteis
          if (error.message.includes('ResizeObserver loop limit exceeded')) {
            return null
          }
          if (error.message.includes('Non-Error promise rejection captured')) {
            return null
          }
        }
      }
      
      // Remover dados sensíveis
      if (event.user) {
        delete event.user.email
        delete event.user.ip_address
      }
      
      return event
    },
    
    beforeSendTransaction(event) {
      // Filtrar transações desnecessárias
      if (event.transaction?.includes('health-check')) {
        return null
      }
      return event
    }
  })
}

// Utilitários para logging customizado
export const logger = {
  info: (message: string, extra?: unknown) => {
    console.log(`[INFO] ${message}`, extra)
    Sentry.addBreadcrumb({
      message,
      level: 'info',
      data: extra
    })
  },
  
  warn: (message: string, extra?: unknown) => {
    console.warn(`[WARN] ${message}`, extra)
    Sentry.addBreadcrumb({
      message,
      level: 'warning',
      data: extra
    })
  },
  
  error: (message: string, error?: Error, extra?: unknown) => {
    console.error(`[ERROR] ${message}`, error, extra)
    Sentry.captureException(error || new Error(message), {
      extra,
      tags: {
        source: 'custom-logger'
      }
    })
  },
  
  debug: (message: string, extra?: unknown) => {
    if ((import.meta as unknown as { env?: { MODE?: string } }).env?.MODE === 'development') {
      console.debug(`[DEBUG] ${message}`, extra)
      Sentry.addBreadcrumb({
        message,
        level: 'debug',
        data: extra
      })
    }
  }
}

// Hook para capturar erros de componentes React
export const useErrorBoundary = () => {
  const captureException = (error: Error, errorInfo?: unknown) => {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo?.componentStack
        }
      }
    })
  }
  
  return { captureException }
}

// Utilitário para capturar métricas de performance
export const performanceTracker = {
  startTiming: (name: string) => {
    const startTime = performance.now()
    return {
      end: () => {
        const duration = performance.now() - startTime
        Sentry.addBreadcrumb({
          message: `Performance: ${name}`,
          level: 'info',
          data: { duration }
        })
        return duration
      }
    }
  },
  
  measureApiCall: async <T>(
    name: string, 
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const timing = performanceTracker.startTiming(name)
    try {
      const result = await apiCall()
      timing.end()
      return result
    } catch (error) {
      timing.end()
      throw error
    }
  }
}

// Utilitário para capturar eventos de negócio
export const businessTracker = {
  userAction: (action: string, properties?: Record<string, unknown>) => {
    Sentry.addBreadcrumb({
      message: `User Action: ${action}`,
      level: 'info',
      data: properties
    })
  },
  
  petCreated: (petId: string, petName: string) => {
    Sentry.addBreadcrumb({
      message: 'Pet Created',
      level: 'info',
      data: { petId, petName }
    })
  },
  
  appointmentBooked: (appointmentId: string, serviceName: string) => {
    Sentry.addBreadcrumb({
      message: 'Appointment Booked',
      level: 'info',
      data: { appointmentId, serviceName }
    })
  },
  
  orderPlaced: (orderId: string, totalAmount: number) => {
    Sentry.addBreadcrumb({
      message: 'Order Placed',
      level: 'info',
      data: { orderId, totalAmount }
    })
  },
  
  subscriptionCreated: (subscriptionId: string, planName: string) => {
    Sentry.addBreadcrumb({
      message: 'Subscription Created',
      level: 'info',
      data: { subscriptionId, planName }
    })
  }
}

// Configuração de tags padrão
export const setUserContext = (user: { id: string; email: string; user_metadata?: { full_name?: string } }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.user_metadata?.full_name
  })
}

export const setCustomTags = (tags: Record<string, string>) => {
  Sentry.setTags(tags)
}

export const setCustomContext = (key: string, context: unknown) => {
  Sentry.setContext(key, context)
}

export default Sentry
