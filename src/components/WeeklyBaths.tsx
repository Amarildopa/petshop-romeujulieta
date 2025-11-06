import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Heart, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { weeklyBathsService, WeeklyBath } from '../services/weeklyBathsService';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { settingsService } from '../services/settingsService';

const WeeklyBaths: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [weeklyBaths, setWeeklyBaths] = useState<WeeklyBath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('5511988181826');

  // Função para calcular itens por visualização baseado no tamanho da tela
  const calculateItemsPerView = useCallback(() => {
    const width = window.innerWidth;
    if (width < 640) return 1; // mobile
    if (width < 1024) return 2; // tablet
    return 3; // desktop
  }, []);

  const loadWeeklyBaths = useCallback(async (showRetryIndicator = false) => {
    try {
      if (showRetryIndicator) {
        setRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const baths = await weeklyBathsService.getCurrentWeekBaths();
      setWeeklyBaths(baths);
    } catch (err) {
      console.error('Erro ao carregar banhos da semana:', err);
      const errorMessage = !isOnline 
        ? 'Sem conexão com a internet. Verifique sua conexão e tente novamente.'
        : 'Erro ao carregar as fotos da semana. Tente novamente em alguns instantes.';
      setError(errorMessage);
      // Fallback para dados mock em caso de erro
      const mockBaths: WeeklyBath[] = [
        {
          id: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          pet_name: 'Luna',
          image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop',
          bath_date: '2024-01-15',
          approved: true,
          week_start: '2024-01-15',
          display_order: 1
        },
        {
          id: '2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          pet_name: 'Max',
          image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
          bath_date: '2024-01-16',
          approved: true,
          week_start: '2024-01-15',
          display_order: 2
        },
        {
          id: '3',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          pet_name: 'Bella',
          image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
          bath_date: '2024-01-17',
          approved: true,
          week_start: '2024-01-15',
          display_order: 3
        },
        {
          id: '4',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          pet_name: 'Charlie',
          image_url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
          bath_date: '2024-01-18',
          approved: true,
          week_start: '2024-01-15',
          display_order: 4
        },
        {
          id: '5',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          pet_name: 'Milo',
          image_url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&h=400&fit=crop',
          bath_date: '2024-01-19',
          approved: true,
          week_start: '2024-01-15',
          display_order: 5
        }
      ];
      setWeeklyBaths(mockBaths);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [isOnline]);

  // Monitora status de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (error && weeklyBaths.length === 0) {
        loadWeeklyBaths();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error, weeklyBaths.length, loadWeeklyBaths]);

  // Atualiza itens por visualização quando a tela redimensiona
  useEffect(() => {
    const handleResize = () => {
      // Normaliza índice para continuar ciclando por todos os itens
      if (weeklyBaths.length > 0) {
        setCurrentIndex((prev) => ((prev % weeklyBaths.length) + weeklyBaths.length) % weeklyBaths.length);
      } else {
        setCurrentIndex(0);
      }
    };

    // Define valor inicial
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [weeklyBaths.length, currentIndex, calculateItemsPerView]);

  useEffect(() => {
    const loadWhatsApp = async () => {
      try {
        const number = await settingsService.getWhatsAppNumber();
        setWhatsappNumber(number);
      } catch (e) {
        console.error('Erro ao carregar WhatsApp number:', e);
        setWhatsappNumber('5511988181826');
      }
    };
    loadWhatsApp();
  }, []);

  // Restaurar efeito para carregar banhos da semana com dependência correta
  useEffect(() => {
    loadWeeklyBaths();
  }, [loadWeeklyBaths]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (weeklyBaths.length === 0) return 0;
      return (prevIndex + 1) % weeklyBaths.length;
    });
  }, [weeklyBaths.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (weeklyBaths.length === 0) return 0;
      return (prevIndex - 1 + weeklyBaths.length) % weeklyBaths.length;
    });
  }, [weeklyBaths.length]);

  // Suporte a touch/swipe para dispositivos móveis
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Função para lidar com erros de carregamento de imagem
  const handleImageError = useCallback((bathId: string) => {
    setImageLoadErrors(prev => new Set([...prev, bathId]));
  }, []);

  // Função para tentar novamente
  const handleRetry = useCallback(() => {
    setImageLoadErrors(new Set());
    loadWeeklyBaths(true);
  }, [loadWeeklyBaths]);

  const getVisibleBaths = () => {
    if (weeklyBaths.length === 0) return [];
    
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % weeklyBaths.length;
      visible.push(weeklyBaths[index]);
    }
    return visible;
  };

  const formatDate = (dateString: string) => {
    // Parse da data evitando problemas de timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month é 0-indexed
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  if (loading) {
    return (
      <section className="py-16" style={{ backgroundColor: '#baceae' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-color-dark">
              Banhos da Semana
            </h2>
            <p className="mt-4 text-lg text-text-color">
              Carregando os pets mais fofos da semana...
            </p>
          </div>
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </motion.div>
            {!isOnline && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-center text-orange-600 text-sm"
              >
                <WifiOff className="h-4 w-4 mr-2" />
                Sem conexão com a internet
              </motion.div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (weeklyBaths.length === 0) {
    return (
      <section className="py-16" style={{ backgroundColor: '#baceae' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-text-color-dark">
              Hall da Fama - Quem passou por aqui na última semana?
            </h2>
            <p className="mt-4 text-lg text-text-color">
              Em breve teremos fotos dos pets mais fofos da semana!
            </p>
          </div>
        </div>
      </section>
    );
  }

  const visibleBaths = getVisibleBaths();

  return (
    <section className="py-16" style={{ backgroundColor: '#baceae' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-text-color-dark">
              Hall da Fama - Quem passou por aqui na última semana?
            </h2>
            <p className="mt-4 text-lg text-text-color">
              Confira os pets mais fofos que visitaram nosso petshop!
            </p>
            <div className="flex items-center justify-center mt-2 text-sm text-text-color/70">
              <Calendar className="h-4 w-4 mr-1" />
              Atualizado às segundas-feiras
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center justify-center mt-4">
              {isOnline ? (
                <div className="flex items-center text-green-600 text-sm">
                  <Wifi className="h-4 w-4 mr-2" />
                  Online
                </div>
              ) : (
                <div className="flex items-center text-orange-600 text-sm">
                  <WifiOff className="h-4 w-4 mr-2" />
                  Offline - Mostrando conteúdo em cache
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
                <p className="text-orange-700 text-sm">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="ml-4 px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center"
              >
                {retrying ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-1">Tentar novamente</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          {/* Carousel Container */}
          <div className="flex justify-center items-center space-x-6">
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              className="p-2 sm:p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow z-10 hover:bg-primary/10 touch-manipulation"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </button>

            {/* Images Container */}
            <div 
              className="flex space-x-4 overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {visibleBaths.map((bath, index) => (
                <motion.div
                  key={`${bath.id}-${currentIndex}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: index === 1 ? 1.1 : 1 }}
                  transition={{ duration: 0.5 }}
                  className={`relative group cursor-pointer ${
                    index === 1 ? 'z-10' : 'z-0'
                  }`}
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    {imageLoadErrors.has(bath.id) ? (
                      <div className={`bg-gray-200 flex items-center justify-center ${
                        index === 1 ? 'w-48 h-48 sm:w-64 sm:h-64' : 'w-32 h-32 sm:w-48 sm:h-48'
                      }`}>
                        <div className="text-center text-gray-500">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-xs">Erro ao carregar</p>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={bath.image_url}
                        alt={`${bath.pet_name} após o banho`}
                        className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                          index === 1 ? 'w-48 h-48 sm:w-64 sm:h-64' : 'w-32 h-32 sm:w-48 sm:h-48'
                        }`}
                        loading="lazy"
                        onError={() => handleImageError(bath.id)}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="font-semibold text-sm sm:text-lg">{bath.pet_name}</h3>
                      <p className="text-xs sm:text-sm flex items-center">
                        <Calendar className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                        {formatDate(bath.bath_date)}
                      </p>
                    </div>
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 fill-current" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              className="p-2 sm:p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow z-10 hover:bg-primary/10 touch-manipulation"
              aria-label="Próxima foto"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </button>
          </div>

          {/* Indicators */}
          <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
            {weeklyBaths.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors touch-manipulation ${
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                aria-label={`Ir para foto ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-text-color mb-4">
            Quer ver seu pet aqui na próxima semana?
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Vi o Hall da Fama e queria agendar um banho para meu pet. Quero ver ele(a) também nas fotos da semana! 🐾')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-green-500/90 hover:bg-green-600/90 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm border border-white/20"
            aria-label="Agende pelo WhatsApp"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Agende pelo WhatsApp
          </a>
        </motion.div
        >
      </div>
    </section>
  );
};

export default WeeklyBaths;
