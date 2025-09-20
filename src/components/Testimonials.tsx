import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { feedbackService } from '../services/feedbackService';
import type { FeedbackData } from '../data/mockFeedback';

interface TestimonialsProps {
  limit?: number;
  showNavigation?: boolean;
  autoPlay?: boolean;
  className?: string;
}

const Testimonials: React.FC<TestimonialsProps> = ({ 
  limit = 6, 
  showNavigation = true, 
  autoPlay = true,
  className = '' 
}) => {
  const [testimonials, setTestimonials] = useState<FeedbackData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar depoimentos
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setLoading(true);
        const data = await feedbackService.getFeedbacksForHome(limit);
        setTestimonials(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar depoimentos:', err);
        setError('Erro ao carregar depoimentos');
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, [limit]);

  // Auto-play dos depoimentos
  useEffect(() => {
    if (!autoPlay || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, testimonials.length]);

  // Navegação
  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  // Renderizar estrelas
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Obter ícone do tipo de feedback
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service':
        return '🐕';
      case 'product':
        return '🛍️';
      case 'app':
        return '📱';
      default:
        return '💬';
    }
  };

  // Obter nome do tipo
  const getTypeName = (type: string) => {
    switch (type) {
      case 'service':
        return 'Serviço';
      case 'product':
        return 'Produto';
      case 'app':
        return 'Aplicativo';
      default:
        return 'Geral';
    }
  };

  if (loading) {
    return (
      <div className={`py-16 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando depoimentos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || testimonials.length === 0) {
    return (
      <div className={`py-16 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">
              {error || 'Nenhum depoimento disponível no momento.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Veja os depoimentos de quem já confia no nosso trabalho e no cuidado com seus pets
          </p>
        </div>

        {/* Carrossel de depoimentos */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-2xl shadow-lg p-8 mx-auto max-w-2xl">
                    {/* Quote icon */}
                    <div className="flex justify-center mb-6">
                      <Quote className="w-12 h-12 text-primary-200" />
                    </div>

                    {/* Conteúdo do depoimento */}
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {testimonial.title}
                      </h3>
                      
                      <p className="text-gray-700 text-lg leading-relaxed mb-6">
                        "{testimonial.comment}"
                      </p>

                      {/* Rating */}
                      <div className="flex justify-center items-center mb-4">
                        {renderStars(testimonial.rating)}
                        <span className="ml-2 text-sm text-gray-600">
                          {testimonial.rating}/5
                        </span>
                      </div>

                      {/* Informações do cliente */}
                      <div className="flex justify-center items-center space-x-4">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">
                            {testimonial.user_name || 'Cliente Satisfeito'}
                          </p>
                          <div className="flex items-center justify-center mt-1">
                            <span className="text-sm mr-1">
                              {getTypeIcon(testimonial.type)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {getTypeName(testimonial.type)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navegação */}
          {showNavigation && testimonials.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-200 group"
                aria-label="Depoimento anterior"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-primary-600" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-200 group"
                aria-label="Próximo depoimento"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-primary-600" />
              </button>
            </>
          )}
        </div>

        {/* Indicadores */}
        {testimonials.length > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentIndex 
                    ? 'bg-primary-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir para depoimento ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Estatísticas */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {testimonials.length}+
              </div>
              <div className="text-gray-600">Depoimentos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {Math.round(
                  testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length * 10
                ) / 10}
              </div>
              <div className="text-gray-600">Avaliação Média</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {Math.round(
                  (testimonials.filter(t => t.rating >= 4).length / testimonials.length) * 100
                )}%
              </div>
              <div className="text-gray-600">Satisfação</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
