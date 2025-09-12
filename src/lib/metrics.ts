// Sistema de métricas de performance e monitoramento
interface MetricData {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
  metadata?: Record<string, any>
}

interface PerformanceMetric extends MetricData {
  type: 'performance'
  operation: string
  duration: number
}

interface BusinessMetric extends MetricData {
  type: 'business'
  event: string
  userId?: string
}

interface ErrorMetric extends MetricData {
  type: 'error'
  errorType: string
  errorMessage: string
  stack?: string
}

type Metric = PerformanceMetric | BusinessMetric | ErrorMetric

class MetricsCollector {
  private metrics: Metric[] = []
  private maxMetrics = 1000
  private flushInterval = 30000 // 30 segundos
  private flushTimer?: NodeJS.Timeout

  constructor() {
    this.startFlushTimer()
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  private stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = undefined
    }
  }

  private addMetric(metric: Metric) {
    this.metrics.push(metric)
    
    // Manter apenas os últimos N métricas
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log da métrica
    console.debug(`[METRICS] ${metric.type}: ${metric.name} = ${metric.value}`, metric)
  }

  // Métricas de Performance
  recordPerformance(operation: string, duration: number, tags?: Record<string, string>, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      type: 'performance',
      name: `performance.${operation}`,
      value: duration,
      timestamp: Date.now(),
      operation,
      duration,
      tags,
      metadata
    }
    this.addMetric(metric)
  }

  // Métricas de Negócio
  recordBusinessEvent(event: string, value: number = 1, userId?: string, tags?: Record<string, string>, metadata?: Record<string, any>) {
    const metric: BusinessMetric = {
      type: 'business',
      name: `business.${event}`,
      value,
      timestamp: Date.now(),
      event,
      userId,
      tags,
      metadata
    }
    this.addMetric(metric)
  }

  // Métricas de Erro
  recordError(errorType: string, errorMessage: string, value: number = 1, stack?: string, tags?: Record<string, string>, metadata?: Record<string, any>) {
    const metric: ErrorMetric = {
      type: 'error',
      name: `error.${errorType}`,
      value,
      timestamp: Date.now(),
      errorType,
      errorMessage,
      stack,
      tags,
      metadata
    }
    this.addMetric(metric)
  }

  // Métricas específicas do PetShop
  petCreated = (petId: string, petName: string, userId: string) => {
    this.recordBusinessEvent('pet_created', 1, userId, { petId, petName })
  }

  appointmentBooked = (appointmentId: string, serviceName: string, userId: string, totalPrice: number) => {
    this.recordBusinessEvent('appointment_booked', 1, userId, { appointmentId, serviceName })
    this.recordBusinessEvent('appointment_revenue', totalPrice, userId, { appointmentId, serviceName })
  }

  orderPlaced = (orderId: string, totalAmount: number, userId: string, itemCount: number) => {
    this.recordBusinessEvent('order_placed', 1, userId, { orderId })
    this.recordBusinessEvent('order_revenue', totalAmount, userId, { orderId })
    this.recordBusinessEvent('order_items', itemCount, userId, { orderId })
  }

  subscriptionCreated = (subscriptionId: string, planName: string, monthlyPrice: number, userId: string) => {
    this.recordBusinessEvent('subscription_created', 1, userId, { subscriptionId, planName })
    this.recordBusinessEvent('subscription_revenue', monthlyPrice, userId, { subscriptionId, planName })
  }

  userRegistered = (userId: string, method: string) => {
    this.recordBusinessEvent('user_registered', 1, userId, { method })
  }

  userLoggedIn = (userId: string, method: string) => {
    this.recordBusinessEvent('user_logged_in', 1, userId, { method })
  }

  // Métricas de Performance específicas
  apiCall = (endpoint: string, method: string, duration: number, statusCode: number) => {
    this.recordPerformance('api_call', duration, { 
      endpoint: endpoint.replace(/\/\d+/g, '/:id'), // Normalizar IDs
      method: method.toLowerCase(),
      status: statusCode.toString()
    })
  }

  pageLoad = (page: string, duration: number) => {
    this.recordPerformance('page_load', duration, { page })
  }

  componentRender = (component: string, duration: number) => {
    this.recordPerformance('component_render', duration, { component })
  }

  // Métricas de Erro específicas
  apiError = (endpoint: string, method: string, statusCode: number, errorMessage: string) => {
    this.recordError('api_error', errorMessage, 1, undefined, {
      endpoint: endpoint.replace(/\/\d+/g, '/:id'),
      method: method.toLowerCase(),
      status: statusCode.toString()
    })
  }

  validationError = (field: string, errorMessage: string) => {
    this.recordError('validation_error', errorMessage, 1, undefined, { field })
  }

  // Utilitários para medir performance
  measureAsync = async <T>(
    operation: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const startTime = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - startTime
      this.recordPerformance(operation, duration, tags, metadata)
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      this.recordPerformance(operation, duration, { ...tags, error: 'true' }, { ...metadata, error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }

  measureSync = <T>(
    operation: string,
    fn: () => T,
    tags?: Record<string, string>,
    metadata?: Record<string, any>
  ): T => {
    const startTime = performance.now()
    try {
      const result = fn()
      const duration = performance.now() - startTime
      this.recordPerformance(operation, duration, tags, metadata)
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      this.recordPerformance(operation, duration, { ...tags, error: 'true' }, { ...metadata, error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }

  // Obter métricas
  getMetrics(type?: string): Metric[] {
    if (type) {
      return this.metrics.filter(metric => metric.type === type)
    }
    return [...this.metrics]
  }

  getMetricsByTimeRange(startTime: number, endTime: number): Metric[] {
    return this.metrics.filter(metric => 
      metric.timestamp >= startTime && metric.timestamp <= endTime
    )
  }

  // Estatísticas
  getStats() {
    const now = Date.now()
    const lastHour = now - (60 * 60 * 1000)
    const lastDay = now - (24 * 60 * 60 * 1000)

    const lastHourMetrics = this.getMetricsByTimeRange(lastHour, now)
    const lastDayMetrics = this.getMetricsByTimeRange(lastDay, now)

    return {
      total: this.metrics.length,
      lastHour: lastHourMetrics.length,
      lastDay: lastDayMetrics.length,
      byType: {
        performance: this.metrics.filter(m => m.type === 'performance').length,
        business: this.metrics.filter(m => m.type === 'business').length,
        error: this.metrics.filter(m => m.type === 'error').length
      },
      recentErrors: this.metrics
        .filter(m => m.type === 'error')
        .slice(-10)
        .map(m => ({
          type: (m as ErrorMetric).errorType,
          message: (m as ErrorMetric).errorMessage,
          timestamp: m.timestamp
        }))
    }
  }

  // Enviar métricas para servidor (implementar conforme necessário)
  async flush() {
    if (this.metrics.length === 0) return

    try {
      // Aqui você pode implementar o envio para um serviço de métricas
      // como DataDog, New Relic, ou seu próprio endpoint
      console.log(`[METRICS] Flushing ${this.metrics.length} metrics`)
      
      // Por enquanto, apenas limpar as métricas
      this.metrics = []
    } catch (error) {
      console.error('[METRICS] Failed to flush metrics:', error)
    }
  }

  // Limpar métricas
  clear() {
    this.metrics = []
  }

  // Destruir o coletor
  destroy() {
    this.stopFlushTimer()
    this.flush()
  }
}

// Instância global do coletor de métricas
export const metrics = new MetricsCollector()

// Hook para usar métricas em componentes React
export const useMetrics = () => {
  return {
    recordPerformance: metrics.recordPerformance.bind(metrics),
    recordBusinessEvent: metrics.recordBusinessEvent.bind(metrics),
    recordError: metrics.recordError.bind(metrics),
    measureAsync: metrics.measureAsync.bind(metrics),
    measureSync: metrics.measureSync.bind(metrics),
    petCreated: metrics.petCreated.bind(metrics),
    appointmentBooked: metrics.appointmentBooked.bind(metrics),
    orderPlaced: metrics.orderPlaced.bind(metrics),
    subscriptionCreated: metrics.subscriptionCreated.bind(metrics),
    userRegistered: metrics.userRegistered.bind(metrics),
    userLoggedIn: metrics.userLoggedIn.bind(metrics),
    apiCall: metrics.apiCall.bind(metrics),
    pageLoad: metrics.pageLoad.bind(metrics),
    componentRender: metrics.componentRender.bind(metrics),
    apiError: metrics.apiError.bind(metrics),
    validationError: metrics.validationError.bind(metrics)
  }
}

export default metrics
