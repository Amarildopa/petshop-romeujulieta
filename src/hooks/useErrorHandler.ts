import React from 'react'
import { logger } from '../lib/sentry'

// Hook para usar o Error Boundary em componentes funcionais
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: React.ErrorInfo) => {
    logger.error('Unhandled error in component', error, errorInfo)
  }

  return { handleError }
}
