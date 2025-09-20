import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Camera, 
  Edit, 
  Save, 
  Plus,
  Calendar,
  Weight,
  AlertCircle,
  Star,
  Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { petsService, type Pet } from '../services/petsService';
import { getImageUrl } from '../config/images';

const PetProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPet, setSelectedPet] = useState('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load pets data
  useEffect(() => {
    const loadPets = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const petsData = await petsService.getPets();
        setPets(petsData);
        if (petsData.length > 0 && !selectedPet) {
          setSelectedPet(petsData[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar pets');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadPets();
    }
  }, [user, selectedPet]);

  const handleSavePet = async () => {
    if (!selectedPet) return;
    
    try {
      setSaving(true);
      const petToUpdate = pets.find(pet => pet.id === selectedPet);
      if (petToUpdate) {
        await petsService.updatePet(selectedPet, {
          name: petToUpdate.name,
          breed: petToUpdate.breed,
          age: petToUpdate.age,
          weight: petToUpdate.weight,
          height: petToUpdate.height,
          color: petToUpdate.color,
          gender: petToUpdate.gender,
          personality: petToUpdate.personality,
          allergies: petToUpdate.allergies,
          medications: petToUpdate.medications
        });
        setIsEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar pet');
    } finally {
      setSaving(false);
    }
  };

  const currentPet = pets.find(pet => pet.id === selectedPet) || pets[0];

  const getNextVaccination = () => {
    if (!currentPet || !currentPet.vaccinations) {
      return null;
    }
    
    const upcoming = currentPet.vaccinations
      .map(vacc => ({
        ...vacc,
        daysUntil: Math.ceil((new Date(vacc.nextDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }))
      .filter(vacc => vacc.daysUntil > 0)
      .sort((a, b) => a.daysUntil - b.daysUntil)[0];
    
    return upcoming;
  };

  const getAverageRating = () => {
    if (!currentPet || !currentPet.services || currentPet.services.length === 0) {
      return '0.0';
    }
    
    const total = currentPet.services.reduce((sum, service) => sum + service.rating, 0);
    return (total / currentPet.services.length).toFixed(1);
  };

  const nextVaccination = getNextVaccination();

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-color">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Don't render if no pets available
  if (!currentPet) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-color">Nenhum pet encontrado...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-color">Carregando pets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-color-dark mb-2">Nenhum pet cadastrado</h2>
          <p className="text-text-color mb-6">Comece adicionando seu primeiro pet!</p>
          <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
            Adicionar Pet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-accent/20 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-text-color-dark">
              Perfil dos Pets
            </h1>
            <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
              <Plus className="h-4 w-4" />
              <span>Adicionar Pet</span>
            </button>
          </div>

          <div className="flex space-x-4">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet.id)}
                className={`flex items-center space-x-3 p-4 rounded-xl transition-all ${
                  selectedPet === pet.id
                    ? 'bg-primary-light/50 border-2 border-primary/20'
                    : 'bg-surface-dark border-2 border-transparent hover:bg-accent/20'
                }`}
              >
                <img
                  src={getImageUrl.petImage(pet.avatar_url, 'small')}
                  alt={pet.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="text-left">
                  <h3 className="font-semibold text-text-color-dark">{pet.name}</h3>
                  <p className="text-sm text-text-color">{pet.breed}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-accent/20 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-color-dark">
                Informações Básicas
              </h2>
              <button
                onClick={isEditing ? handleSavePet : () => setIsEditing(true)}
                disabled={saving}
                className="p-2 text-text-color hover:text-primary transition-colors disabled:opacity-50"
                title={isEditing ? 'Salvar alterações' : 'Editar pet'}
              >
                {isEditing ? <Save className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="relative inline-block">
                <img
                  src={getImageUrl.petImage(currentPet.avatar_url, 'medium')}
                  alt={currentPet.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-primary-light"
                />
                <button 
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-dark transition-colors"
                  title="Alterar foto do pet"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-2xl font-bold text-text-color-dark mt-3">{currentPet.name}</h3>
              <p className="text-text-color">{currentPet.breed}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-surface-dark rounded-lg">
                  <Calendar className="h-5 w-5 text-text-color mx-auto mb-1" />
                  <p className="text-sm text-text-color">Idade</p>
                  <p className="font-semibold text-text-color-dark">{currentPet.age}</p>
                </div>
                <div className="text-center p-3 bg-surface-dark rounded-lg">
                  <Weight className="h-5 w-5 text-text-color mx-auto mb-1" />
                  <p className="text-sm text-text-color">Peso</p>
                  <p className="font-semibold text-text-color-dark">{currentPet.weight}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-color">Sexo:</span>
                  <span className="font-medium text-text-color-dark">{currentPet.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-color">Cor:</span>
                  <span className="font-medium text-text-color-dark">{currentPet.color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-color">Altura:</span>
                  <span className="font-medium text-text-color-dark">{currentPet.height}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-color-dark mb-2">Personalidade</h4>
                <div className="flex flex-wrap gap-2">
                  {currentPet.personality.map((trait, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-secondary-light text-secondary-dark rounded-full text-sm"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-accent/20 p-6"
            >
              <h2 className="text-xl font-semibold text-text-color-dark mb-6">
                Saúde & Alertas
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-text-color-dark mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-status-danger mr-2" />
                    Alergias
                  </h3>
                  {currentPet.allergies.length > 0 ? (
                    <div className="space-y-2">
                      {currentPet.allergies.map((allergy, index) => (
                        <div
                          key={index}
                          className="p-3 bg-status-danger-light border border-red-200 rounded-lg"
                        >
                          <p className="text-status-danger font-medium">{allergy}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-color text-sm">Nenhuma alergia conhecida</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-text-color-dark mb-3">
                    Medicamentos
                  </h3>
                  {currentPet.medications.length > 0 ? (
                    <div className="space-y-2">
                      {currentPet.medications.map((medication, index) => (
                        <div
                          key={index}
                          className="p-3 bg-status-info-light border border-blue-200 rounded-lg"
                        >
                          <p className="text-status-info font-medium">{medication}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-color text-sm">Nenhum medicamento em uso</p>
                  )}
                </div>
              </div>

              {nextVaccination && (
                <div className="mt-6 p-4 bg-status-warning-light border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-status-warning" />
                    <div>
                      <p className="font-semibold text-yellow-800">
                        Próxima Vacinação: {nextVaccination.name}
                      </p>
                      <p className="text-yellow-700 text-sm">
                        Em {nextVaccination.daysUntil} dias ({new Date(nextVaccination.nextDue).toLocaleDateString('pt-BR')})
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-accent/20 p-6">
                <h3 className="font-semibold text-text-color-dark mb-4">
                  Estatísticas
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-status-info" />
                      <span className="text-sm text-text-color">Total de Serviços</span>
                    </div>
                    <span className="font-semibold text-text-color-dark">
                      {currentPet.services.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-status-warning" />
                      <span className="text-sm text-text-color">Avaliação Média</span>
                    </div>
                    <span className="font-semibold text-text-color-dark">
                      {getAverageRating()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-status-danger" />
                      <span className="text-sm text-text-color">Cliente desde</span>
                    </div>
                    <span className="font-semibold text-text-color-dark">
                      2024
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-accent/20 p-6">
                <h3 className="font-semibold text-text-color-dark mb-4">
                  Último Serviço
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-text-color-dark">
                      {currentPet.lastService.type}
                    </p>
                    <p className="text-sm text-text-color">
                      {new Date(currentPet.lastService.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < currentPet.lastService.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-text-color">
                      {currentPet.lastService.photos} fotos
                    </span>
                  </div>
                  <button className="w-full bg-primary-light/50 text-primary-dark py-2 rounded-lg hover:bg-primary-light/80 transition-colors text-sm font-medium">
                    Ver Fotos e Detalhes
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-accent/20 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-color-dark">
                  Histórico de Serviços
                </h2>
                <button className="text-primary hover:text-primary-dark font-medium text-sm">
                  Ver Todos
                </button>
              </div>

              <div className="space-y-4">
                {currentPet.services.slice(0, 4).map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-surface-dark rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-text-color-dark">
                        {service.type}
                      </h3>
                      <p className="text-sm text-text-color">
                        {new Date(service.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < service.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <button className="text-primary hover:text-primary-dark text-sm font-medium">
                        Detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetProfile;
