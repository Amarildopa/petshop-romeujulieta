import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Heart, ChevronRight, Check, Sparkles, Scissors, Stethoscope } from 'lucide-react';

export const Booking: React.FC = () => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const services = [
    {
      id: 'banho-tosa',
      name: 'Banho & Tosa',
      description: 'Banho completo, tosa higiênica e estética',
      duration: '2-3 horas',
      price: 65,
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=200&fit=crop'
    },
    {
      id: 'veterinario',
      name: 'Check-up Veterinário',
      description: 'Consulta completa com veterinário especializado',
      duration: '45 minutos',
      price: 120,
      image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=300&h=200&fit=crop'
    },
    {
      id: 'daycare',
      name: 'Daycare/Hotelzinho',
      description: 'Cuidado e diversão o dia todo para seu pet',
      duration: 'Dia inteiro',
      price: 85,
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop'
    },
    {
      id: 'adestramento',
      name: 'Adestramento',
      description: 'Sessão de adestramento com profissional certificado',
      duration: '1 hora',
      price: 200,
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'
    }
  ];

  const extraCareOptions = [
    { id: 'hidratacao', name: 'Hidratação Profunda', price: 30, icon: Sparkles },
    { id: 'corte-unhas', name: 'Corte de Unhas', price: 15, icon: Scissors },
    { id: 'limpeza-ouvidos', name: 'Limpeza de Ouvidos', price: 20, icon: Stethoscope },
  ];

  const pets = [
    {
      id: 'luna',
      name: 'Luna',
      breed: 'Golden Retriever',
      age: '2 anos',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=80&h=80&fit=crop&crop=face'
    },
    {
      id: 'thor',
      name: 'Thor',
      breed: 'Bulldog Francês',
      age: '3 anos',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=80&h=80&fit=crop&crop=face'
    }
  ];

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const generateAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = generateAvailableDates();

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

  const handleConfirmBooking = () => {
    // Lógica de confirmação aqui
    navigate('/dashboard');
  };

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedPetData = pets.find(p => p.id === selectedPet);
  const selectedExtrasData = extraCareOptions.filter(extra => selectedExtras.includes(extra.id));
  const extrasTotal = selectedExtrasData.reduce((sum, extra) => sum + extra.price, 0);
  const total = (selectedServiceData?.price || 0) + extrasTotal;

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
                      src={service.image}
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
                        src={pet.image}
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
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-text-color-dark mb-4">
                  Que tal adicionar um cuidado extra?
                </h3>
                <div className="space-y-3">
                  {extraCareOptions.map((extra) => (
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
                        <extra.icon className="h-6 w-6 text-secondary-dark" />
                        <span className="font-medium text-text-color-dark">{extra.name}</span>
                      </div>
                      <span className="font-semibold text-primary-dark">+ R$ {extra.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
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
                    const dateStr = date.toISOString().split('T')[0];
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(dateStr)}
                        disabled={isWeekend}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          isWeekend
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : selectedDate === dateStr
                            ? 'bg-primary text-white'
                            : 'bg-surface-dark text-text-color hover:bg-primary-light/50'
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {date.getDate()}
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
                    src={selectedPetData?.image}
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
