import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Camera, 
  Edit, 
  Save, 
  Plus,
  Calendar,
  Weight,
  Ruler,
  AlertCircle,
  Star,
  Award,
  Activity
} from 'lucide-react';

export const PetProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPet, setSelectedPet] = useState('luna');

  const pets = [
    {
      id: 'luna',
      name: 'Luna',
      breed: 'Golden Retriever',
      age: '2 anos',
      weight: '28 kg',
      height: '58 cm',
      color: 'Dourado',
      gender: 'Fêmea',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop&crop=face',
      personality: ['Brincalhona', 'Carinhosa', 'Obediente'],
      allergies: ['Frango', 'Corante vermelho'],
      medications: [],
      lastService: {
        type: 'Banho & Tosa',
        date: '2025-01-10',
        rating: 5,
        photos: 12
      },
      vaccinations: [
        { name: 'Múltipla', date: '2024-12-15', nextDue: '2025-12-15' },
        { name: 'Raiva', date: '2024-11-20', nextDue: '2025-11-20' },
        { name: 'Gripe Canina', date: '2024-10-10', nextDue: '2025-10-10' }
      ],
      services: [
        { date: '2025-01-10', type: 'Banho & Tosa', rating: 5 },
        { date: '2024-12-20', type: 'Check-up', rating: 5 },
        { date: '2024-12-05', type: 'Banho & Tosa', rating: 4 },
        { date: '2024-11-15', type: 'Adestramento', rating: 5 }
      ]
    },
    {
      id: 'thor',
      name: 'Thor',
      breed: 'Bulldog Francês',
      age: '3 anos',
      weight: '12 kg',
      height: '30 cm',
      color: 'Tigrado',
      gender: 'Macho',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop&crop=face',
      personality: ['Calmo', 'Protetor', 'Teimoso'],
      allergies: ['Poeira', 'Pólen'],
      medications: ['Anti-alérgico (2x/dia)'],
      lastService: {
        type: 'Check-up',
        date: '2025-01-08',
        rating: 5,
        photos: 8
      },
      vaccinations: [
        { name: 'Múltipla', date: '2024-12-10', nextDue: '2025-12-10' },
        { name: 'Raiva', date: '2024-11-15', nextDue: '2025-11-15' }
      ],
      services: [
        { date: '2025-01-08', type: 'Check-up', rating: 5 },
        { date: '2024-12-25', type: 'Banho & Tosa', rating: 4 },
        { date: '2024-12-01', type: 'Daycare', rating: 5 }
      ]
    }
  ];

  const currentPet = pets.find(pet => pet.id === selectedPet) || pets[0];

  const getNextVaccination = () => {
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
    const total = currentPet.services.reduce((sum, service) => sum + service.rating, 0);
    return (total / currentPet.services.length).toFixed(1);
  };

  const nextVaccination = getNextVaccination();

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
                  src={pet.image}
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
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-text-color hover:text-primary transition-colors"
              >
                {isEditing ? <Save className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="relative inline-block">
                <img
                  src={currentPet.image}
                  alt={currentPet.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-primary-light"
                />
                <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-dark transition-colors">
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
