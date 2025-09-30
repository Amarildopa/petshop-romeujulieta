import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Photo {
  id: string;
  photo_url: string;
  caption?: string;
  is_main?: boolean;
}

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  eventTitle: string;
}

const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  onClose,
  photos,
  currentIndex,
  onPrevious,
  onNext,
  eventTitle
}) => {
  const currentPhoto = photos[currentIndex];

  if (!currentPhoto) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-4xl max-h-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent z-10 p-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="text-lg font-semibold">{eventTitle}</h3>
                  <p className="text-sm opacity-80">
                    {currentIndex + 1} de {photos.length} fotos
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Image */}
            <div className="relative">
              <img
                src={currentPhoto.photo_url}
                alt={currentPhoto.caption || `Foto ${currentIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              {currentPhoto.is_main && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-white rounded-full p-2 shadow-lg">
                  <Star className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Navigation */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={onPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors text-white"
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={onNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors text-white"
                  disabled={currentIndex === photos.length - 1}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Caption */}
            {currentPhoto.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                <p className="text-white text-center">{currentPhoto.caption}</p>
              </div>
            )}

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-2 bg-black/30 backdrop-blur-sm rounded-full p-2">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => {
                        const diff = index - currentIndex;
                        if (diff > 0) {
                          for (let i = 0; i < diff; i++) onNext();
                        } else if (diff < 0) {
                          for (let i = 0; i < Math.abs(diff); i++) onPrevious();
                        }
                      }}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentIndex
                          ? 'border-white scale-110'
                          : 'border-white/50 hover:border-white/80'
                      }`}
                    >
                      <img
                        src={photo.photo_url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhotoModal;