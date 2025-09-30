/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, PawPrint, Star, ArrowLeft, Cake, Award, 
  Home, Shield, Stethoscope, Scissors, Play, 
  UtensilsCrossed, GraduationCap, MapPin, Gift,
  Share2, ExternalLink, Loader2
} from 'lucide-react';
import { sharingService } from '../services/sharingService';
import { getPlaceholderImageByCategory } from '../utils/placeholderImages';

// Icon mapping for event types
const iconMap: Record<string, any> = {
  'Home': Home,
  'Shield': Shield,
  'Stethoscope': Stethoscope,
  'Scissors': Scissors,
  'Play': Play,
  'UtensilsCrossed': UtensilsCrossed,
  'GraduationCap': GraduationCap,
  'MapPin': MapPin,
  'Gift': Gift,
  'Cake': Cake,
  'Award': Award,
  'Star': Star,
  'Camera': Camera,
  'PawPrint': PawPrint
};

interface Pet {
  id: string;
  name: string;
  image_url: string | null;
  species: string;
  breed: string;
}

interface EventType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface EventPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  is_primary: boolean;
}

interface PetEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_type_id: string;
  event_types_pet: EventType;
  event_photos_pet: EventPhoto[];
}

const SharedJourney: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [events, setEvents] = useState<PetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedJourney = async () => {
      if (!shareToken) {
        setError('Token de compartilhamento não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Busca a jornada compartilhada
        const sharedJourney = await sharingService.getSharedJourney(shareToken);
        if (!sharedJourney) {
          setError('Jornada não encontrada ou link expirado');
          setLoading(false);
          return;
        }

        // Busca os eventos da jornada
        const journeyEvents = await sharingService.getSharedJourneyEvents(
          sharedJourney.pet_id,
          shareToken
        );
        setEvents(journeyEvents);

        // Busca informações do pet (assumindo que temos acesso)
        // Em um cenário real, essas informações poderiam vir junto com os eventos
        if (journeyEvents.length > 0) {
          // Simula dados do pet baseado nos eventos
          setPet({
            id: sharedJourney.pet_id,
            name: 'Pet Compartilhado', // Seria obtido dos dados reais
            image_url: null,
            species: 'Cão', // Seria obtido dos dados reais
            breed: 'Raça Mista' // Seria obtido dos dados reais
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar jornada compartilhada';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadSharedJourney();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando jornada compartilhada...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Jornada Não Encontrada</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  if (!pet || events.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Nenhum evento encontrado</h1>
          <p className="text-gray-600 mb-6">Esta jornada ainda não possui eventos registrados.</p>
          <Link to="/" className="text-purple-600 hover:text-purple-800">
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link 
              to="/"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Início
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Share2 className="w-4 h-4" />
              Jornada Compartilhada
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <img 
              src={pet.image_url || getPlaceholderImageByCategory({ category: pet.species.toLowerCase(), width: 96, height: 96 })} 
              alt={pet.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Jornada de Crescimento - {pet.name}
              </h1>
              <p className="text-gray-600 mb-2">
                {pet.breed} • {pet.species}
              </p>
              <p className="text-gray-600">
                Acompanhe todos os momentos especiais e marcos importantes na vida deste pet.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {events.map((event, index) => {
            const eventType = event.event_types_pet;
            const Icon = iconMap[eventType?.icon || 'PawPrint'] || PawPrint;
            const mainPhoto = event.event_photos_pet?.find(photo => photo.is_primary) || event.event_photos_pet?.[0];
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Event Icon & Date */}
                  <div className="lg:w-48 bg-gradient-to-br from-purple-500 to-pink-500 p-6 flex flex-col items-center justify-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h4 className="font-semibold text-center mb-2">{eventType?.name}</h4>
                    <p className="text-sm text-purple-100 text-center">
                      {new Date(event.event_date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Main Photo */}
                      {mainPhoto && (
                        <div className="lg:w-48 flex-shrink-0">
                          <img
                            src={mainPhoto.photo_url}
                            alt={mainPhoto.caption || event.title}
                            className="w-full h-48 lg:h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      
                      {/* Event Details */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {event.title}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {new Date(event.event_date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {event.description}
                        </p>
                        {event.event_photos_pet && event.event_photos_pet.length > 1 && (
                          <div className="flex space-x-2 overflow-x-auto">
                            {event.event_photos_pet.slice(0, 4).map((photo, photoIndex) => (
                              <img
                                key={photo.id}
                                src={photo.photo_url}
                                alt={photo.caption || `Foto ${photoIndex + 1}`}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                              />
                            ))}
                            {event.event_photos_pet.length > 4 && (
                              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs text-gray-500">
                                  +{event.event_photos_pet.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-purple-600" />
              <span className="text-gray-600">Esta jornada foi compartilhada com você</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Crie sua própria conta para documentar a jornada do seu pet
            </p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Criar Minha Conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedJourney;