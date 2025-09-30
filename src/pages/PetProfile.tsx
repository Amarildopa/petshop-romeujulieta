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
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { petsService, type Pet, type Vaccination } from '../services/petsService';
import { getImageUrl } from '../config/images';

const PetProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPet, setSelectedPet] = useState('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editedPet, setEditedPet] = useState<Partial<Pet>>({});
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
      const currentPet = pets.find(pet => pet.id === selectedPet);
      if (currentPet) {
        const updatedPetData = {
          ...currentPet,
          ...editedPet
        };
        
        await petsService.updatePet(selectedPet, {
          name: updatedPetData.name || currentPet.name,
          breed: updatedPetData.breed || currentPet.breed,
          age: updatedPetData.age || currentPet.age,
          weight: updatedPetData.weight || currentPet.weight,
          height: updatedPetData.height || currentPet.height,
          color: updatedPetData.color || currentPet.color,
          gender: updatedPetData.gender || currentPet.gender,
          personality: updatedPetData.personality || currentPet.personality,
          allergies: updatedPetData.allergies || currentPet.allergies,
          medications: updatedPetData.medications || currentPet.medications
        });
        
        // Atualizar o estado local
        setPets(prevPets => 
          prevPets.map(pet => 
            pet.id === selectedPet ? { ...pet, ...editedPet } : pet
          )
        );
        
        setIsEditing(false);
        setEditedPet({});
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
      .map((vacc: Vaccination) => ({
        ...vacc,
        daysUntil: Math.ceil((new Date(vacc.nextDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }))
      .filter((vacc: Vaccination & { daysUntil: number }) => vacc.daysUntil > 0)
      .sort((a: Vaccination & { daysUntil: number }, b: Vaccination & { daysUntil: number }) => a.daysUntil - b.daysUntil)[0];
    
    return upcoming;
  };

  const getAverageRating = () => {
    // Funcionalidade em desenvolvimento
    return '0.0';
  };

  const nextVaccination = getNextVaccination();

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
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
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-color">Nenhum pet encontrado...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" message="Carregando pets..." />
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
          <button 
            onClick={() => navigate('/add-pet')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
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
            <button 
              onClick={() => navigate('/add-pet')}
              className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isEditing) {
                    console.log('🎯 Salvando pet:', selectedPet);
                    handleSavePet();
                  } else {
                    console.log('🎯 Editando pet:', selectedPet);
                    setIsEditing(true);
                    // Inicializar editedPet com os dados atuais
                    const currentPet = pets.find(pet => pet.id === selectedPet);
                    if (currentPet) {
                      setEditedPet({
                        name: currentPet.name,
                        breed: currentPet.breed,
                        age: currentPet.age,
                        weight: currentPet.weight,
                        height: currentPet.height,
                        color: currentPet.color,
                        gender: currentPet.gender,
                        personality: currentPet.personality,
                        allergies: currentPet.allergies,
                        medications: currentPet.medications
                      });
                    }
                  }
                }}
                disabled={saving}
                className="p-2 text-text-color hover:text-primary transition-colors disabled:opacity-50 hover:bg-gray-100 rounded-lg"
                title={isEditing ? 'Salvar alterações' : 'Editar pet'}
                type="button"
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
                
                {/* Nome editável */}
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPet.name || currentPet.name}
                    onChange={(e) => setEditedPet(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold text-text-color-dark mt-3 text-center bg-white border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <h3 className="text-2xl font-bold text-text-color-dark mt-3">{currentPet.name}</h3>
                )}
                
                {/* Raça editável */}
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPet.breed || currentPet.breed}
                    onChange={(e) => setEditedPet(prev => ({ ...prev, breed: e.target.value }))}
                    className="text-text-color text-center bg-white border border-gray-300 rounded-lg px-3 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-text-color">{currentPet.breed}</p>
                )}
              </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-surface-dark rounded-lg">
                  <Calendar className="h-5 w-5 text-text-color mx-auto mb-1" />
                  <p className="text-sm text-text-color">Idade</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPet.age || currentPet.age || ''}
                      onChange={(e) => setEditedPet(prev => ({ ...prev, age: e.target.value }))}
                      className="font-semibold text-text-color-dark bg-white border border-gray-300 rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="font-semibold text-text-color-dark">{currentPet.age}</p>
                  )}
                </div>
                <div className="text-center p-3 bg-surface-dark rounded-lg">
                  <Weight className="h-5 w-5 text-text-color mx-auto mb-1" />
                  <p className="text-sm text-text-color">Peso</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPet.weight || currentPet.weight || ''}
                      onChange={(e) => setEditedPet(prev => ({ 
                        ...prev, 
                        weight: e.target.value ? parseFloat(e.target.value) || null : null 
                      }))}
                      className="font-semibold text-text-color-dark bg-white border border-gray-300 rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="font-semibold text-text-color-dark">{currentPet.weight}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-color">Sexo:</span>
                  {isEditing ? (
                    <select
                      value={editedPet.gender || currentPet.gender}
                      onChange={(e) => setEditedPet(prev => ({ ...prev, gender: e.target.value }))}
                      className="font-medium text-text-color-dark bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Macho">Macho</option>
                      <option value="Fêmea">Fêmea</option>
                    </select>
                  ) : (
                    <span className="font-medium text-text-color-dark">{currentPet.gender}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-text-color">Cor:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPet.color || currentPet.color}
                      onChange={(e) => setEditedPet(prev => ({ ...prev, color: e.target.value }))}
                      className="font-medium text-text-color-dark bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <span className="font-medium text-text-color-dark">{currentPet.color}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-text-color">Altura:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPet.height || currentPet.height}
                      onChange={(e) => setEditedPet(prev => ({ ...prev, height: e.target.value }))}
                      className="font-medium text-text-color-dark bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <span className="font-medium text-text-color-dark">{currentPet.height}</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-color-dark mb-2">Conta pra gente: como é o jeitinho do seu pet?</h4>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedPet.personality ? editedPet.personality.join(', ') : currentPet.personality.join(', ')}
                      onChange={(e) => setEditedPet(prev => ({ 
                        ...prev, 
                        personality: e.target.value.split(',').map(trait => trait.trim()).filter(trait => trait.length > 0)
                      }))}
                      placeholder="Digite as características separadas por vírgula"
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">Separe as características com vírgulas</p>
                  </div>
                ) : (
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
                )}
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

              <div className="grid md:grid-cols-1 gap-6">
                <div>
                  <h3 className="font-semibold text-text-color-dark mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-status-danger mr-2" />
                    Alguma Alergia?
                  </h3>
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editedPet.allergies ? editedPet.allergies.join(', ') : (currentPet.allergies || []).join(', ')}
                        onChange={(e) => setEditedPet(prev => ({ 
                          ...prev, 
                          allergies: e.target.value.split(',').map(allergy => allergy.trim()).filter(allergy => allergy.length > 0)
                        }))}
                        placeholder="Digite as alergias separadas por vírgula (deixe vazio se não houver)"
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500">Separe as alergias com vírgulas ou deixe vazio se não houver</p>
                    </div>
                  ) : (
                    <>
                      {currentPet.allergies && currentPet.allergies.length > 0 ? (
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
                    </>
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
                      0
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
                  Informações Adicionais
                </h3>
                <div className="space-y-3">
                  <div className="text-center text-text-color">
                    <p>Histórico de serviços em desenvolvimento</p>
                  </div>
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
                <div className="text-center text-text-color py-8">
                  <p>Histórico de serviços em desenvolvimento</p>
                  <p className="text-sm mt-2">Esta funcionalidade será implementada em breve</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetProfile;
