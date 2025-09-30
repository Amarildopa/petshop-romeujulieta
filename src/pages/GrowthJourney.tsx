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
  const [selectedEventPhotos, setSelectedEventPhotos] = useState<{url: string; id: string}[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  
  const { events, eventTypes, loading: eventsLoading, createEvent, refetch } = usePetEvents(petId || '');
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
          const currentPet = allPetsData.find(p => p.id === petId);
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

  const handlePetSelect = (selectedPetId: string) => {
    navigate(`/journey/${selectedPetId}`);
  };

  const handleAddEvent = async (eventData: {type: string; title: string; description: string; date: string}) => {
    try {
      console.log('🔄 GrowthJourney - handleAddEvent called with:', eventData);
      const newEvent = await createEvent(eventData);
      console.log('✅ GrowthJourney - Event created successfully:', newEvent);
      
      return newEvent;
    } catch (error) {
      console.error('❌ GrowthJourney - Error in handleAddEvent:', error);
      throw error;
    }
  };

  const handleModalClose = async () => {
    console.log('🔄 GrowthJourney - Modal closing, refreshing timeline');
    setShowAddEvent(false);
    
    // Refresh the events list after modal closes
    try {
      await refetch();
      console.log('✅ GrowthJourney - Timeline refreshed after modal close');
    } catch (error) {
      console.error('❌ GrowthJourney - Error refreshing timeline:', error);
    }
  };

  const handlePhotoClick = (photos: {url: string; id: string}[], photoIndex: number, eventTitle: string) => {
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
              selectedPetId={petId || ''}
              onPetSelect={handlePetSelect}
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
          {/* Central Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-purple-400 via-pink-400 to-blue-400 h-full hidden lg:block"></div>
          
          <div className="space-y-12">
            {events.map((event, index) => {
              const eventType = eventTypes.find(et => et.id === event.event_type_id);
              const Icon = iconMap[eventType?.icon || 'PawPrint'] || PawPrint;
              const mainPhoto = event.photos?.find(photo => photo.is_primary) || event.photos?.[0];
              const isLeft = index % 2 === 0;
              
              return (
                <motion.div
                  key={event.id}
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
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      {/* Event Photo */}
                       {mainPhoto ? (
                         <div 
                           className="relative h-64 overflow-hidden group cursor-pointer"
                           onClick={() => handlePhotoClick(event.photos || [], 0, event.title)}
                         >
                           <img 
                             src={mainPhoto.photo_url} 
                             alt={event.title}
                             className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                               <Camera className="w-6 h-6 text-white" />
                             </div>
                           </div>
                           <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                             <span className="text-sm font-medium text-gray-800">
                               {new Date(event.event_date).toLocaleDateString('pt-BR')}
                             </span>
                           </div>
                         </div>
                       ) : (
                        <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center relative">
                          <div className="text-center">
                            <Icon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                            <p className="text-purple-600 font-medium">Sem foto</p>
                          </div>
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                            <span className="text-sm font-medium text-gray-800">
                              {new Date(event.event_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Event Content */}
                      <div className="p-6">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 lg:hidden">
                            <Icon className="w-4 h-4 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 flex-1">
                            {event.title}
                          </h3>
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
                                   key={`${event.id}-${photo.id}-${photoIndex}`} 
                                   className="relative group flex-shrink-0 cursor-pointer"
                                   onClick={() => handlePhotoClick(event.photos || [], photoIndex, event.title)}
                                 >
                                   <img
                                     src={photo.photo_url}
                                     alt={photo.caption || `Foto ${photoIndex + 1}`}
                                     className="w-20 h-20 rounded-lg object-cover transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg"
                                   />
                                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                     <Camera className="w-4 h-4 text-white" />
                                   </div>
                                   {photo.is_primary && (
                                     <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                       <Star className="w-3 h-3 text-white" />
                                     </div>
                                   )}
                                 </div>
                               ))}
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connector Line */}
                  <div className={`absolute top-6 w-8 h-0.5 bg-purple-300 hidden lg:block ${
                    isLeft 
                      ? 'right-1/2 mr-6' 
                      : 'left-1/2 ml-6'
                  }`}></div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {events.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Nenhum momento registrado ainda
            </h3>
            <p className="text-gray-600 mb-6">
              Comece a documentar a jornada de crescimento do {pet.name}!
            </p>
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
   );
 };

export default GrowthJourney;
