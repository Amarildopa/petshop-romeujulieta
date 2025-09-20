import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Heart, ChevronRight, Check, Plus, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { servicesService, type Service } from '../services/servicesService';
import { petsService, type Pet } from '../services/petsService';
import { careExtrasService, type CareExtra } from '../services/careExtrasService';
import { availableSlotsService, type AvailableSlot } from '../services/availableSlotsService';
import { appointmentsService } from '../services/appointmentsService';
import { getImageUrl } from '../config/images';
import { BreedSelector } from '../components/BreedSelector';
import { Breed } from '../services/breedsService';
import PhotoUpload from '../components/PhotoUpload';

// Função para calcular idade baseada na data de nascimento
const calculateAge = (birthDate: string): string => {
  if (!birthDate) return '';
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age > 0 ? `${age} anos` : 'Menos de 1 ano';
};

const Booking: React.FC = () => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Estados para dados reais
  const [services, setServices] = useState<Service[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [careExtras, setCareExtras] = useState<CareExtra[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  // Estados para cadastro de pet inline
  const [showPetForm, setShowPetForm] = useState(false);
  const [petFormLoading, setPetFormLoading] = useState(false);
  const [petFormData, setPetFormData] = useState({
    name: '',
    species: 'Cachorro',
    breed: '',
    breed_id: null as string | null,
    birth_date: '',
    gender: 'Macho',
    weight: '',
    color: '',
    microchip_id: '',
    notes: '',
    avatar_url: '',
    age: '',
    height: '',
    personality: [] as string[],
    allergies: [] as string[],
    medications: [] as string[]
  });

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!authLoading && !user) {
      // Redirecionar para login com parâmetro de redirecionamento
      navigate('/login?redirect=/booking');
    }
  }, [user, authLoading, navigate]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [servicesData, petsData, careExtrasData] = await Promise.all([
          servicesService.getServices(),
          petsService.getPets(),
          careExtrasService.getCareExtras()
        ]);

        setServices(servicesData);
        setPets(petsData);
        setCareExtras(careExtrasData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Load available slots when service is selected
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!selectedService) return;
      
      try {
        const slots = await availableSlotsService.getAvailableSlots(selectedService);
        setAvailableSlots(slots);
        
        // Extract unique dates
        const dates = [...new Set(slots.map(slot => slot.date))].sort();
        setAvailableDates(dates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar horários disponíveis');
      }
    };

    loadAvailableSlots();
  }, [selectedService]);

  // Load available times when date is selected
  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    
    const slotsForDate = availableSlots.filter(slot => slot.date === selectedDate);
    const times = slotsForDate.map(slot => slot.start_time).sort();
    setAvailableTimes(times);
  }, [selectedService, selectedDate, availableSlots]);

  const handleBooking = async () => {
    if (!selectedService || !selectedPet || !selectedDate || !selectedTime) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      
      // Calculate total price
      const selectedServiceData = services.find(s => s.id === selectedService);
      const selectedExtrasData = careExtras.filter(extra => selectedExtras.includes(extra.id));
      const totalPrice = (selectedServiceData?.price || 0) + selectedExtrasData.reduce((sum, extra) => sum + extra.price, 0);

      // Create appointment
      await appointmentsService.createAppointment({
        pet_id: selectedPet,
        service_id: selectedService,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        notes: `Extras selecionados: ${selectedExtrasData.map(e => e.name).join(', ')}`,
        total_price: totalPrice
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento');
    } finally {
      // Loading finished
    }
  };



  const steps = [
    { number: 1, title: 'Serviço', completed: step > 1 },
    { number: 2, title: 'Pet', completed: step > 2 },
    { number: 3, title: 'Data & Hora', completed: step > 3 },
    { number: 4, title: 'Confirmação', completed: false }
  ];

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedService !== '';
      case 2:
        return selectedPet !== '';
      case 3:
        return selectedDate !== '' && selectedTime !== '';
      default:
        return false;
    }
  };

  const handleToggleExtra = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) ? prev.filter(id => id !== extraId) : [...prev, extraId]
    );
  };

  const handleCreatePet = async () => {
    if (!petFormData.name || !petFormData.species) {
      setError('Por favor, preencha os campos obrigatórios do pet (nome e espécie)');
      return;
    }

    try {
      setPetFormLoading(true);
      
      // Debug: Log dos dados que serão enviados
      console.log('🐕 Dados do pet a serem enviados:', petFormData);
      
      const newPet = await petsService.createPet({
        ...petFormData,
        avatar_url: petFormData.avatar_url || null // Usar o valor do formulário ou null
      });
      
      console.log('✅ Pet criado com sucesso:', newPet);
      
      // Adicionar o novo pet à lista
      setPets(prev => [newPet, ...prev]);
      
      // Selecionar automaticamente o pet recém-criado
      setSelectedPet(newPet.id);
      
      // Fechar o formulário
      setShowPetForm(false);
      
      // Limpar o formulário
      setPetFormData({
        name: '',
        species: 'Cachorro',
        breed: '',
        breed_id: null as string | null,
        birth_date: '',
        gender: 'Macho',
        weight: '',
        color: '',
        microchip_id: '',
        notes: '',
        avatar_url: '',
        age: '',
        height: '',
        personality: [] as string[],
        allergies: [] as string[],
        medications: [] as string[]
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar pet');
    } finally {
      setPetFormLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    await handleBooking();
  };

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedPetData = pets.find(p => p.id === selectedPet);
  const selectedExtrasData = careExtras.filter(extra => selectedExtras.includes(extra.id));
  const extrasTotal = selectedExtrasData.reduce((sum, extra) => sum + extra.price, 0);
  const total = (selectedServiceData?.price || 0) + extrasTotal;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-color">Carregando dados...</p>
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

  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-text-color-dark">
            Agendar Serviço
          </h1>
          <p className="text-text-color mt-2">
            Em apenas 3 passos seu pet estará agendado
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4 md:space-x-8">
            {steps.map((stepItem, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    stepItem.completed
                      ? 'bg-status-success border-status-success text-white'
                      : step === stepItem.number
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-accent text-text-color'
                  }`}>
                    {stepItem.completed ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      stepItem.number
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    step === stepItem.number ? 'text-primary-dark' : 'text-text-color'
                  }`}>
                    {stepItem.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-2 md:mx-4 ${
                    stepItem.completed ? 'bg-status-success' : 'bg-accent'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-semibold text-text-color-dark mb-6">
                Escolha o serviço
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                      selectedService === service.id
                        ? 'border-primary bg-primary-light/30'
                        : 'border-accent/20 hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={getImageUrl.serviceImage(service.image_url)}
                      alt={service.name}
                      className="w-full h-32 object-cover rounded-t-xl"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-text-color-dark mb-2">
                        {service.name}
                      </h3>
                      <p className="text-sm text-text-color mb-3">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-dark">
                          R$ {service.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-text-color">
                          {service.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-semibold text-text-color-dark mb-6">
                Escolha o pet
              </h2>
              
              {pets.length === 0 && !showPetForm ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-color-dark mb-2">
                    Você não possui nenhum pet cadastrado
                  </h3>
                  <p className="text-text-color mb-6">
                    Para continuar com o agendamento, você precisa cadastrar seu pet primeiro.
                  </p>
                  <button
                    onClick={() => setShowPetForm(true)}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Cadastrar meu pet</span>
                  </button>
                </div>
              ) : showPetForm ? (
                <div className="bg-surface-dark rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-text-color-dark">
                      Cadastrar novo pet
                    </h3>
                    <button
                      onClick={() => setShowPetForm(false)}
                      className="text-text-color hover:text-text-color-dark"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Nome do pet *
                      </label>
                      <input
                        type="text"
                        value={petFormData.name}
                        onChange={(e) => setPetFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ex: Rex, Luna, Mimi..."
                        maxLength={100}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Espécie *
                      </label>
                      <select
                        value={petFormData.species}
                        onChange={(e) => setPetFormData(prev => ({ ...prev, species: e.target.value }))}
                        className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Cachorro">Cachorro</option>
                        <option value="Gato">Gato</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Raça
                      </label>
                      <BreedSelector
                        value={petFormData.breed_id}
                        onChange={(breedId, breed) => {
                          setPetFormData(prev => ({
                            ...prev,
                            breed_id: breedId,
                            breed: breed?.name || ''
                          }));
                        }}
                        species={petFormData.species === 'Cachorro' ? 'dog' : petFormData.species === 'Gato' ? 'cat' : undefined}
                        placeholder="Digite para buscar uma raça..."
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Data de nascimento
                      </label>
                      <input
                        type="date"
                        value={petFormData.birth_date}
                        onChange={(e) => setPetFormData(prev => ({ 
                          ...prev, 
                          birth_date: e.target.value,
                          age: calculateAge(e.target.value)
                        }))}
                        className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Gênero
                      </label>
                      <select
                        value={petFormData.gender}
                        onChange={(e) => setPetFormData(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Selecione...</option>
                        <option value="Macho">Macho</option>
                        <option value="Fêmea">Fêmea</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Peso (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="999.99"
                        value={petFormData.weight}
                        onChange={(e) => setPetFormData(prev => ({ ...prev, weight: e.target.value }))}
                        className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ex: 15.5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Altura
                      </label>
                      <input
                        type="text"
                        value={petFormData.height}
                        onChange={(e) => setPetFormData(prev => ({ ...prev, height: e.target.value }))}
                        className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ex: 60cm, Grande, Médio..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Cor
                      </label>
                      <input
                        type="text"
                        value={petFormData.color}
                        onChange={(e) => setPetFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ex: Dourado, Preto e branco..."
                        maxLength={50}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Microchip ID
                      </label>
                      <input
                        type="text"
                        value={petFormData.microchip_id}
                        onChange={(e) => setPetFormData(prev => ({ ...prev, microchip_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ex: 123456789012345"
                        maxLength={50}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Idade (calculada automaticamente)
                      </label>
                      <input
                        type="text"
                        value={petFormData.age}
                        readOnly
                        className="w-full px-3 py-2 border border-accent/20 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        placeholder="Selecione a data de nascimento para calcular a idade"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Observações
                      </label>
                      <textarea
                        value={petFormData.notes}
                        onChange={(e) => setPetFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Informações adicionais sobre o pet..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Foto do pet
                      </label>
                      <PhotoUpload
                        onUploadComplete={(imageUrl) => {
                          setPetFormData(prev => ({ ...prev, avatar_url: imageUrl }));
                        }}
                        onUploadError={(error) => {
                          console.error('Erro no upload da foto:', error);
                        }}
                        maxSizeMB={5}
                        className="w-full"
                      />
                      {petFormData.avatar_url && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ Foto carregada com sucesso
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Personalidade
                      </label>
                      <input
                        type="text"
                        value={petFormData.personality.join(', ')}
                        onChange={(e) => setPetFormData(prev => ({ 
                          ...prev, 
                          personality: e.target.value.split(',').map(item => item.trim()).filter(item => item) 
                        }))}
                        className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ex: Brincalhão, Calmo, Sociável (separar por vírgula)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Alergias
                      </label>
                      <input
                        type="text"
                        value={petFormData.allergies.join(', ')}
                        onChange={(e) => setPetFormData(prev => ({ 
                          ...prev, 
                          allergies: e.target.value.split(',').map(item => item.trim()).filter(item => item) 
                        }))}
                        className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ex: Frango, Pólen, Ácaros (separar por vírgula)"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Medicamentos
                      </label>
                      <input
                        type="text"
                        value={petFormData.medications.join(', ')}
                        onChange={(e) => setPetFormData(prev => ({ 
                          ...prev, 
                          medications: e.target.value.split(',').map(item => item.trim()).filter(item => item) 
                        }))}
                        className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ex: Antibiótico, Vermífugo (separar por vírgula)"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowPetForm(false)}
                      className="px-4 py-2 text-text-color hover:text-text-color-dark transition-colors"
                      disabled={petFormLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreatePet}
                      disabled={petFormLoading || !petFormData.name || !petFormData.species}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {petFormLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Cadastrando...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Cadastrar pet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {pets.map((pet) => (
                      <div
                        key={pet.id}
                        onClick={() => setSelectedPet(pet.id)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                          selectedPet === pet.id
                            ? 'border-primary bg-primary-light/30'
                            : 'border-accent/20 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={getImageUrl.petImage(pet.avatar_url, 'small')}
                            alt={pet.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-color-dark">
                              {pet.name}
                            </h3>
                            <p className="text-text-color">
                              {pet.breed} • {pet.age}
                            </p>
                          </div>
                          <Heart className={`h-6 w-6 ${
                            selectedPet === pet.id ? 'text-status-danger fill-current' : 'text-gray-400'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Botão para adicionar outro pet */}
                  <div className="mt-4">
                    <button
                      onClick={() => setShowPetForm(true)}
                      className="w-full p-4 border-2 border-dashed border-accent/40 rounded-xl hover:border-primary/50 transition-colors flex items-center justify-center space-x-2 text-text-color hover:text-primary"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Cadastrar outro pet</span>
                    </button>
                  </div>
                </>
              )}
              
              {pets.length > 0 && !showPetForm && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-text-color-dark mb-4">
                    Que tal adicionar um cuidado extra?
                  </h3>
                  <div className="space-y-3">
                    {careExtras.map((extra) => (
                      <div
                        key={extra.id}
                        onClick={() => handleToggleExtra(extra.id)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                          selectedExtras.includes(extra.id)
                            ? 'border-primary bg-primary-light/30'
                            : 'border-accent/20 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center">
                            <Heart className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <span className="font-medium text-text-color-dark">{extra.name}</span>
                            <p className="text-sm text-text-color">{extra.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-primary-dark">+ R$ {extra.price.toFixed(2)}</span>
                          <p className="text-xs text-text-color">{extra.duration_minutes} min</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold text-text-color-dark">
                Escolha data e horário
              </h2>
              
              <div>
                <h3 className="text-lg font-medium text-text-color-dark mb-4">
                  Selecione a data
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {availableDates.map((date, index) => {
                    const dateObj = new Date(date);
                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        disabled={isWeekend}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          isWeekend
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : selectedDate === date
                            ? 'bg-primary text-white'
                            : 'bg-surface-dark text-text-color hover:bg-primary-light/50'
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {dateObj.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {dateObj.getDate()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <h3 className="text-lg font-medium text-text-color-dark mb-4">
                    Selecione o horário
                  </h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          selectedTime === time
                            ? 'bg-primary text-white'
                            : 'bg-surface-dark text-text-color hover:bg-primary-light/50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-semibold text-text-color-dark mb-6">
                Confirmar agendamento
              </h2>
              
              <div className="bg-surface-dark rounded-xl p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={getImageUrl.petImage(selectedPetData?.avatar_url, 'small')}
                    alt={selectedPetData?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-text-color-dark">
                      {selectedPetData?.name}
                    </h3>
                    <p className="text-text-color">
                      {selectedPetData?.breed}
                    </p>
                  </div>
                </div>

                <div className="border-t border-accent/20 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-color">{selectedServiceData?.name}</span>
                    <span className="font-medium text-text-color-dark">R$ {selectedServiceData?.price.toFixed(2)}</span>
                  </div>
                  {selectedExtrasData.map(extra => (
                    <div key={extra.id} className="flex justify-between">
                      <span className="text-text-color">{extra.name}</span>
                      <span className="font-medium text-text-color-dark">R$ {extra.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-accent/20 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-text-color-dark">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-primary-dark">
                      R$ {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-accent/20 pt-4 flex items-center space-x-4">
                  <div className="bg-status-success-light p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-status-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-color-dark">
                      {new Date(selectedDate).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p className="text-text-color">
                      {selectedTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary-light/50 rounded-xl p-4 mt-6">
                <h4 className="font-semibold text-secondary-dark mb-2">
                  📸 Acompanhamento em Tempo Real
                </h4>
                <p className="text-text-color text-sm">
                  Você receberá fotos e atualizações do seu pet durante todo o serviço!
                </p>
              </div>
            </motion.div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-accent text-text-color-dark rounded-lg hover:bg-surface-dark transition-colors"
              >
                Voltar
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
                  canProceed()
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-gray-300 text-text-color cursor-not-allowed'
                }`}
              >
                Continuar
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button 
                onClick={handleConfirmBooking}
                className="px-8 py-3 bg-status-success text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Confirmar Agendamento
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
