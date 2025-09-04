import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Video } from 'lucide-react';

interface LiveFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  petName: string;
}

export const LiveFeedModal: React.FC<LiveFeedModalProps> = ({ isOpen, onClose, petName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-text-color-dark/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-accent/20 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-text-color-dark flex items-center">
                        <Video className="h-6 w-6 mr-3 text-primary" />
                        Acompanhando {petName} ao Vivo
                    </h2>
                </div>
                <button onClick={onClose} className="text-text-color hover:text-primary-dark">
                    <X className="h-6 w-6" />
                </button>
            </div>
            <div className="p-2 bg-text-color-dark">
                <div className="bg-black rounded-lg aspect-video flex items-center justify-center text-white relative">
                    <div className="text-center">
                    <Camera className="h-12 w-12 text-text-color mx-auto" />
                    <p className="mt-2 text-text-color">Câmera ao vivo indisponível no momento.</p>
                    <p className="text-xs text-text-color/70">Disponível durante os serviços.</p>
                    </div>
                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-status-danger animate-pulse"></div>
                    <span className="text-sm font-medium">LIVE</span>
                    </div>
                </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
