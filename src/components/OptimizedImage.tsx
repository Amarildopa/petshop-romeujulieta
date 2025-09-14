import React, { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ImageIcon, AlertCircle } from 'lucide-react'
import { useIntersectionObserver } from '../hooks/usePerformance'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
  lazy?: boolean
  onLoad?: () => void
  onError?: () => void
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  lazy = true,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)

  // Intersection Observer para lazy loading
  const { isIntersecting } = useIntersectionObserver(imgRef, {
    threshold: 0.1,
    rootMargin: '50px'
  })

  // Atualizar visibilidade quando entrar na viewport
  React.useEffect(() => {
    if (isIntersecting && lazy) {
      setIsInView(true)
    }
  }, [isIntersecting, lazy])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  // Gerar URL otimizada (implementar conforme seu serviço de imagens)
  const getOptimizedUrl = useCallback((originalSrc: string) => {
    // Aqui você pode integrar com serviços como Cloudinary, ImageKit, etc.
    // Por enquanto, retornamos a URL original
    return originalSrc
  }, [])

  const optimizedSrc = isInView ? getOptimizedUrl(src) : ''

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
      >
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Erro ao carregar imagem</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
        >
          {placeholder ? (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-gray-400" />
          )}
        </motion.div>
      )}

      {/* Imagem principal */}
      {isInView && optimizedSrc && (
        <motion.img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
        />
      )}

      {/* Loading spinner */}
      {isInView && !isLoaded && !hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="h-6 w-6 border-2 border-gray-300 border-t-primary rounded-full"
          />
        </motion.div>
      )}
    </div>
  )
}

export default OptimizedImage
