import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Carregando...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-2xl',
    md: 'w-12 h-12 text-4xl',
    lg: 'w-16 h-16 text-5xl'
  };

  const containerClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} flex items-center justify-center`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <span className="text-primary">🐾</span>
      </motion.div>
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-text-color text-center"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;