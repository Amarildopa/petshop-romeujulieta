import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Camera, PawPrint, Star, ArrowLeft, Cake, Award, 
  Home, Shield, Stethoscope, Scissors, Play, 
  UtensilsCrossed, GraduationCap, MapPin, Gift,
  Plus, Share2
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { usePetEvents } from '../hooks/usePetEvents';
import type { EventPhoto } from '../hooks/usePetEvents';
import { getPlaceholderImageByCategory } from '../utils/placeholderImages';
import { PetSelector } from '../components/PetSelector';
import { petsService } from '../services/petsService';
import AddEventModal from '../components/AddEventModal';
import ShareJourneyModal from '../components/ShareJourneyModal';
import PhotoModal from '../components/PhotoModal';

// Icon mapping for event types
const iconMap: Record<string, React.ComponentType> = {
  'Home': Home,
  'Shield': Shield,
  'Stethoscope': Stethoscope,
  'Scissors': Scissors,
  'Play': Play,
  'UtensilsCrossed': UtensilsCrossed,
  'GraduationCap': GraduationCap,
  'MapPin': MapPin,
  'Gift': Gift,
  'Star': Star,
  'PawPrint': PawPrint,
  'Camera': Camera,
  'Cake': Cake,
  'Award': Award,
};

interface Pet {
  id: string;
  name: string;
  avatar_url: string | null;
  species: string;
  breed: string;
}

// Helper para formatar data sem sofrer offset de timezone
const formatEventDate = (dateString: string) => {
  try {
    const d = new Date(dateString);
    // Força renderização em UTC para evitar o -1 dia em fuso local
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch {
    return dateString;
  }
};

const GrowthJourney: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedEventPhotos, setSelectedEventPhotos] = useState<EventPhoto[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  
  const { events, eventTypes, loading: eventsLoading, createEvent } = usePetEvents(petId || '');
  // Removed empty object pattern


  useEffect(() => {
    const fetchData = async () => {
      console.log('🐕 GrowthJourney Debug - petId from URL:', petId);
      console.log('🐕 GrowthJourney Debug - user:', user?.id);
      
      if (!user) {
        console.log('🐕 GrowthJourney Debug - Missing user, returning');
        setLoading(false);
        return;
      }
      
      try {
        // Load all pets first
        const allPetsData = await petsService.getPets();
        console.log('🐕 GrowthJourney Debug - All pets loaded:', allPetsData);
        setAllPets(allPetsData);
        
        // If no petId in URL but we have pets, redirect to first pet
        if (!petId && allPetsData.length > 0) {
          console.log('🐕 GrowthJourney Debug - No petId, redirecting to first pet:', allPetsData[0].id);
          navigate(`/journey/${allPetsData[0].id}`, { replace: true });
          return;
        }
        
        // If petId exists, find the specific pet
        if (petId) {
          const currentPet = allPetsData.find(p => p.id === petId) as Pet | undefined;
          if (currentPet) {
            console.log('🐕 GrowthJourney Debug - Pet found:', currentPet);
            setPet(currentPet);
          } else {
            console.log('🐕 GrowthJourney Debug - Pet not found in user pets');
            setPet(null);
          }
        }
      } catch (error) {
        console.error('🐕 GrowthJourney Debug - Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [petId, user, navigate]);

  if (loading || eventsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Carregando jornada..." />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Pet não encontrado</h1>
          <Link to="/dashboard" className="text-purple-600 hover:text-purple-800">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handlePetSelect = (selectedPet: Pet | null) => {
    if (selectedPet) {
      navigate(`/journey/${selectedPet.id}`);
    }
  };

  const handleAddEvent = async (eventData: { title: string; description: string; event_date: string; event_type_id: string; pet_id: string; photos?: string[] }) => {
    try {
      console.log('🔄 GrowthJourney - handleAddEvent called with:', eventData);
      const newEvent = await createEvent({
        pet_id: eventData.pet_id,
        event_type_id: eventData.event_type_id,
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.event_date,
      });
      console.log('✅ GrowthJourney - Event created successfully:', newEvent);
      return newEvent;
    } catch (error) {
      console.error('❌ GrowthJourney - Error in handleAddEvent:', error);
      throw error;
    }
  };

  const handleModalClose = () => {
    setShowAddEvent(false);
  };

  const handlePhotoClick = (photos: EventPhoto[], photoIndex: number, eventTitle: string) => {
    setSelectedEventPhotos(photos);
    setSelectedPhotoIndex(photoIndex);
    setSelectedEventTitle(eventTitle);
    setShowPhotoModal(true);
  };

  const handlePreviousPhoto = () => {
    setSelectedPhotoIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIndex(prev => Math.min(selectedEventPhotos.length - 1, prev + 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/dashboard" 
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao Dashboard
          </Link>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddEvent(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Momento
            </button>
            
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </button>
          </div>
        </div>

        {/* Pet Selector - Only show if multiple pets */}
        {allPets.length > 1 && (
          <div className="mb-6">
            <PetSelector
              pets={allPets}
              selectedPet={pet}
              onSelectPet={handlePetSelect}
              showValidation={false}
            />
          </div>
        )}

        {/* Pet Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={pet.avatar_url || getPlaceholderImageByCategory('pet')}
                alt={pet.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2">
                <PawPrint className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Jornada de Crescimento - {pet.name}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  {pet.breed}
                </span>
                <span>•</span>
                <span>{pet.species}</span>
                {allPets.length > 1 && (
                  <>
                    <span>•</span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {allPets.findIndex(p => p.id === pet.id) + 1} de {allPets.length} pets
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-purple-200 rounded"></div>

          {/* Events */}
          <div className="space-y-12">
            {events.map((event, index) => {
              const eventType = eventTypes.find(et => et.id === event.event_type_id);
              const Icon = iconMap[eventType?.icon || 'PawPrint'] || PawPrint;
              const mainPhoto = event.photos?.find(photo => photo.is_primary) || event.photos?.[0];
              const isLeft = index % 2 === 0;
              
              return (
                <motion.div
                  key={`event-${event.id}`}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className={`relative flex items-center ${
                    isLeft 
                      ? 'lg:flex-row lg:justify-start' 
                      : 'lg:flex-row-reverse lg:justify-start'
                  }`}
                >
                  {/* Timeline Point */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-10 hidden lg:block">
                    <div className="w-12 h-12 bg-white rounded-full border-4 border-purple-400 flex items-center justify-center shadow-lg">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  
                  {/* Event Card */}
                  <div className={`w-full lg:w-5/12 ${
                    isLeft ? 'lg:pr-8' : 'lg:pl-8'
                  }`}>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      {/* Event Image */}
                      {mainPhoto ? (
                        <div className="relative">
                          <img
                            src={mainPhoto.photo_url}
                            alt={event.title}
                            className="w-full h-64 object-cover"
                            onClick={() => handlePhotoClick(event.photos || [], 0, event.title)}
                          />
                          <div className="absolute top-4 right-4 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {formatEventDate(event.event_date)}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-8 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow">
                            <Scissors className="w-8 h-8 text-purple-600" />
                          </div>
                          <p className="mt-4 text-sm text-purple-700">Sem foto</p>
                          <div className="mt-2 text-xs text-gray-500">{formatEventDate(event.event_date)}</div>
                        </div>
                      )}

                      {/* Event Content */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {event.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                              {eventType?.name || 'Evento'}
                            </span>
                            {event.weekly_bath_source_id && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                🛁 Banho Semanal
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {event.description}
                        </p>
                        
                        {/* Photo Gallery */}
                        {event.photos && event.photos.length > 1 && (
                          <div className="border-t pt-4">
                            <p className="text-sm text-gray-500 mb-3">
                              {event.photos.length} foto{event.photos.length > 1 ? 's' : ''}
                            </p>
                            <div className="flex space-x-2 overflow-x-auto pb-2">
                               {event.photos.map((photo, photoIndex) => (
                                  <div 
                                    key={`photo-${photo.id}-${photoIndex}`}
                                    className="w-20 h-20 rounded overflow-hidden cursor-pointer border hover:border-purple-400"
                                    onClick={() => handlePhotoClick(event.photos || [], photoIndex, event.title)}
                                  >
                                    <img 
                                      src={photo.photo_url} 
                                      alt={photo.caption || event.title} 
                                      className="w-full h-full object-cover" 
                                    />
                                  </div>
                               ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty state */}
          {events.length === 0 && (
            <div className="text-center py-16">
              <PawPrint className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum evento ainda</h3>
              <p className="text-gray-600 mb-6">Comece adicionando um momento especial da {pet.name}.</p>
              <button
                onClick={() => setShowAddEvent(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Adicionar Primeiro Evento
              </button>
            </div>
          )}
        </div>
        
        {/* Add Event Modal */}
        <AddEventModal
          isOpen={showAddEvent}
          onClose={handleModalClose}
          onSubmit={handleAddEvent}
          eventTypes={eventTypes}
          petId={petId}
        />
        
        {/* Share Journey Modal */}
        <ShareJourneyModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          petId={petId || ''}
          petName={pet?.name || ''}
        />
        
        {/* Photo Modal */}
        <PhotoModal
          isOpen={showPhotoModal}
          photos={selectedEventPhotos}
          currentIndex={selectedPhotoIndex}
          eventTitle={selectedEventTitle}
          onClose={() => setShowPhotoModal(false)}
          onPrevious={handlePreviousPhoto}
          onNext={handleNextPhoto}
        />
      </div>
    </div>
  );
};

export default GrowthJourney;
