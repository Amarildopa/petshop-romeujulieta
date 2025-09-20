import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { logger } from '../lib/sentry'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  static displayName = 'ErrorBoundary'
  
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log do erro
    logger.error('ErrorBoundary caught an error', error, {
      componentStack: errorInfo.componentStack
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-text-color-dark mb-4">
              Oops! Algo deu errado
            </h1>
            
            <p className="text-text-color mb-6">
              Encontramos um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
            </p>

            {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-text-color hover:text-text-color-dark mb-2">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono text-gray-800 overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Tentar novamente
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center px-4 py-3 bg-white text-text-color border border-accent rounded-lg hover:bg-surface-dark transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                Ir para o início
              </button>
            </div>

            <div className="mt-6 text-sm text-text-color">
              <p>
                Se o problema persistir, entre em contato conosco através do{' '}
                <a 
                  href="/help" 
                  className="text-primary hover:text-primary-dark underline"
                >
                  centro de ajuda
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
