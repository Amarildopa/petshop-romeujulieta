import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface ServiceProgressBarProps {
  currentStep: number;
}

const steps = [
  "Check-in",
  "Aguardando",
  "Banho",
  "Secagem",
  "Finalização",
  "Prontinho!",
];

export const ServiceProgressBar: React.FC<ServiceProgressBarProps> = ({ currentStep }) => {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full">
      <div className="relative h-2 bg-surface-dark rounded-full mb-2">
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const stepIndex = index + 1;
          const isActive = stepIndex <= currentStep;
          return (
            <div key={index} className="flex flex-col items-center text-center w-20">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                isActive
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-accent text-text-color'
              }`}>
                {isActive && <CheckCircle className="h-5 w-5" />}
              </div>
              <p className={`mt-2 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-dark' : 'text-text-color'
              }`}>
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
