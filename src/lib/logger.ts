import { logger as sentryLogger } from './sentry'

// Níveis de log
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Configuração do logger
interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableSentry: boolean
  enableLocalStorage: boolean
  maxLocalStorageLogs: number
}

const defaultConfig: LoggerConfig = {
  level: import.meta.env.MODE === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableSentry: true,
  enableLocalStorage: import.meta.env.MODE === 'development',
  maxLocalStorageLogs: 100
}

class Logger {
  private config: LoggerConfig
  private logs: Array<{
    timestamp: string
    level: string
    message: string
    data?: unknown
    source?: string
  }> = []

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.loadLogsFromStorage()
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level
  }

  private formatMessage(level: string, message: string, data?: unknown, source?: string): string {
    const timestamp = new Date().toISOString()
    const sourceStr = source ? `[${source}]` : ''
    return `${timestamp} ${level} ${sourceStr} ${message}`
  }

  private saveToLocalStorage(log: any) {
    if (!this.config.enableLocalStorage) return

    this.logs.push(log)
    
    // Manter apenas os últimos N logs
    if (this.logs.length > this.config.maxLocalStorageLogs) {
      this.logs = this.logs.slice(-this.config.maxLocalStorageLogs)
    }

    try {
      localStorage.setItem('petshop-logs', JSON.stringify(this.logs))
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error)
    }
  }

  private loadLogsFromStorage() {
    if (!this.config.enableLocalStorage) return

    try {
      const stored = localStorage.getItem('petshop-logs')
      if (stored) {
        this.logs = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error)
    }
  }

  private log(level: LogLevel, levelName: string, message: string, data?: unknown, source?: string) {
    if (!this.shouldLog(level)) return

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: levelName,
      message,
      data,
      source
    }

    // Console logging
    if (this.config.enableConsole) {
      const formattedMessage = this.formatMessage(levelName, message, data, source)
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage, data)
          break
        case LogLevel.INFO:
          console.info(formattedMessage, data)
          break
        case LogLevel.WARN:
          console.warn(formattedMessage, data)
          break
        case LogLevel.ERROR:
          console.error(formattedMessage, data)
          break
      }
    }

    // Sentry logging
    if (this.config.enableSentry) {
      switch (level) {
        case LogLevel.DEBUG:
          sentryLogger.debug(message, data)
          break
        case LogLevel.INFO:
          sentryLogger.info(message, data)
          break
        case LogLevel.WARN:
          sentryLogger.warn(message, data)
          break
        case LogLevel.ERROR:
          sentryLogger.error(message, data instanceof Error ? data : undefined, data)
          break
      }
    }

    // Local storage logging
    this.saveToLocalStorage(logEntry)
  }

  debug(message: string, data?: any, source?: string) {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data, source)
  }

  info(message: string, data?: unknown, source?: string) {
    this.log(LogLevel.INFO, 'INFO', message, data, source)
  }

  warn(message: string, data?: unknown, source?: string) {
    this.log(LogLevel.WARN, 'WARN', message, data, source)
  }

  error(message: string, error?: Error, data?: unknown, source?: string) {
    this.log(LogLevel.ERROR, 'ERROR', message, { error, ...data }, source)
  }

  // Métodos específicos para diferentes contextos
  api = {
    request: (method: string, url: string, data?: unknown) => {
      this.info(`API Request: ${method} ${url}`, data, 'API')
    },
    
    response: (method: string, url: string, status: number, data?: unknown) => {
      const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO
      this.log(level, level === LogLevel.ERROR ? 'ERROR' : 'INFO', 
        `API Response: ${method} ${url} - ${status}`, data, 'API')
    },
    
    error: (method: string, url: string, error: Error) => {
      this.error(`API Error: ${method} ${url}`, error, undefined, 'API')
    }
  }

  user = {
    login: (userId: string, method: string) => {
      this.info(`User login: ${userId} via ${method}`, { userId, method }, 'USER')
    },
    
    logout: (userId: string) => {
      this.info(`User logout: ${userId}`, { userId }, 'USER')
    },
    
    action: (action: string, userId: string, data?: unknown) => {
      this.info(`User action: ${action}`, { userId, action, ...data }, 'USER')
    }
  }

  business = {
    petCreated: (petId: string, petName: string, userId: string) => {
      this.info(`Pet created: ${petName}`, { petId, petName, userId }, 'BUSINESS')
    },
    
    appointmentBooked: (appointmentId: string, serviceName: string, userId: string) => {
      this.info(`Appointment booked: ${serviceName}`, { appointmentId, serviceName, userId }, 'BUSINESS')
    },
    
    orderPlaced: (orderId: string, totalAmount: number, userId: string) => {
      this.info(`Order placed: ${orderId}`, { orderId, totalAmount, userId }, 'BUSINESS')
    },
    
    subscriptionCreated: (subscriptionId: string, planName: string, userId: string) => {
      this.info(`Subscription created: ${planName}`, { subscriptionId, planName, userId }, 'BUSINESS')
    }
  }

  performance = {
    start: (operation: string) => {
      const startTime = performance.now()
      this.debug(`Performance start: ${operation}`, { startTime }, 'PERFORMANCE')
      return startTime
    },
    
    end: (operation: string, startTime: number, data?: unknown) => {
      const duration = performance.now() - startTime
      this.info(`Performance end: ${operation}`, { duration, ...data }, 'PERFORMANCE')
      return duration
    },
    
    measure: async <T>(operation: string, fn: () => Promise<T>, data?: unknown): Promise<T> => {
      const startTime = this.performance.start(operation)
      try {
        const result = await fn()
        this.performance.end(operation, startTime, data)
        return result
      } catch (error) {
        this.performance.end(operation, startTime, { error: error instanceof Error ? error.message : error, ...data })
        throw error
      }
    }
  }

  // Métodos para gerenciar logs
  getLogs(level?: LogLevel): Array<any> {
    if (level !== undefined) {
      return this.logs.filter(log => {
        const logLevel = LogLevel[log.level as keyof typeof LogLevel]
        return logLevel >= level
      })
    }
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
    if (this.config.enableLocalStorage) {
      localStorage.removeItem('petshop-logs')
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // Configuração dinâmica
  setLevel(level: LogLevel) {
    this.config.level = level
  }

  setConfig(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config }
  }
}

// Instância global do logger
export const logger = new Logger()

// Hook para usar o logger em componentes React
export const useLogger = (source?: string) => {
  return {
    debug: (message: string, data?: any) => logger.debug(message, data, source),
    info: (message: string, data?: any) => logger.info(message, data, source),
    warn: (message: string, data?: any) => logger.warn(message, data, source),
    error: (message: string, error?: Error, data?: any) => logger.error(message, error, data, source)
  }
}

export default logger
