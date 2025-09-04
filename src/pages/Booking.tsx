import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight, Check, Sparkles, Scissors, Stethoscope, Loader, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, doc, DocumentData, QueryDocumentSnapshot, writeBatch } from 'firebase/firestore';

// --- Interfaces --- //
interface Pet {
  id: string;
  name: string;
  breed: string;
  species: string;
  image?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  image: string;
}

// --- Dados (poderiam vir do backend) --- //
const services: Service[] = [
    { id: 'banho-tosa', name: 'Banho & Tosa', description: 'Higiene e estética completa', duration: '2-3 horas', price: 75, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=200&fit=crop' },
    { id: 'veterinario', name: 'Check-up Veterinário', description: 'Consulta de rotina', duration: '45 min', price: 120, image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=300&h=200&fit=crop' },
    // ... outros serviços
];

const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export const Booking: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // --- State --- //
  const [step, setStep] = useState(1);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [selectedService, setSelectedService] = useState('');
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // --- Effects --- //
  useEffect(() => {
    const fetchPets = async () => {
      if (currentUser) {
        try {
          const petsCollectionRef = collection(db, 'usuarios', currentUser.uid, 'pets');
          const petsSnapshot = await getDocs(petsCollectionRef);
          const petsList = petsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() })) as Pet[];
          setPets(petsList);
        } catch (error) { console.error("Error fetching pets:", error); }
        finally { setLoading(false); }
      }
    };
    fetchPets();
  }, [currentUser]);

  // --- Funções --- //
  const generateAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Ignora Sábado e Domingo
        dates.push(date);
      }
    }
    return dates;
  };

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedPetData = pets.find(p => p.id === selectedPet);

  const handleConfirmBooking = async () => {
    if (!currentUser || !selectedPetData || !selectedServiceData || !selectedDate || !selectedTime) return;

    setBookingLoading(true);
    try {
        const batch = writeBatch(db);

        // 1. Cria o documento de agendamento
        const appointmentRef = doc(collection(db, 'agendamentos'));
        batch.set(appointmentRef, {
            userId: currentUser.uid,
            petId: selectedPet,
            serviceId: selectedService,
            date: selectedDate,
            time: selectedTime,
            status: 'confirmado',
            createdAt: new Date(),
        });

        // 2. Cria o documento de notificação
        const notificationRef = doc(collection(db, 'notificacoes'));
        batch.set(notificationRef, {
            userId: currentUser.uid,
            title: 'Agendamento Confirmado!',
            message: `O serviço de ${selectedServiceData.name} para ${selectedPetData.name} foi agendado para ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString('pt-BR')} às ${selectedTime}.`,
            createdAt: new Date(),
            isRead: false,
            link: `/check-in/${appointmentRef.id}` // Link para a página de acompanhamento
        });

        await batch.commit();
        navigate('/dashboard'); // Redireciona após o sucesso
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
    } finally {
        setBookingLoading(false);
    }
  };
  
  // --- Dados Derivados e Lógica de UI --- //
  const canProceed = () => {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedPet;
    if (step === 3) return !!selectedDate && !!selectedTime;
    return false;
  };

  const total = selectedServiceData?.price || 0;

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-primary" size={48} /></div>;
  }

  // --- Renderização --- //
  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mb-6">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-dark mr-3">
                <ArrowLeft className="h-5 w-5 text-text-color" />
            </button>
            <h1 className="text-3xl font-bold text-text-color-dark">Agendar Serviço</h1>
        </motion.div>

        {/* ... Stepper ... */}

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-semibold text-text-color-dark mb-6">1. Escolha o serviço</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {services.map(service => (
                    <div key={service.id} onClick={() => setSelectedService(service.id)} className={`cursor-pointer rounded-xl border-2 p-1 transition-all duration-200 ${selectedService === service.id ? 'border-primary bg-primary-light/30' : 'border-accent/20 hover:border-primary/50'}`}>
                        <img src={service.image} alt={service.name} className="w-full h-32 object-cover rounded-lg"/>
                        <div className="p-3"><h3 className="font-semibold text-text-color-dark">{service.name}</h3></div>
                    </div>
                    ))}
                </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-semibold text-text-color-dark mb-6">2. Escolha o pet</h2>
                <div className="space-y-4">
                  {pets.map(pet => (
                    <div key={pet.id} onClick={() => setSelectedPet(pet.id)} className={`cursor-pointer p-4 rounded-xl border-2 flex items-center space-x-4 transition-all duration-200 ${selectedPet === pet.id ? 'border-primary bg-primary-light/30' : 'border-accent/20 hover:border-primary/50'}`}>
                        <img src={`https://ui-avatars.com/api/?name=${pet.name}&background=random&color=fff`} alt={pet.name} className="w-16 h-16 rounded-full object-cover" />
                        <div><h3 className="font-semibold text-text-color-dark">{pet.name}</h3><p className="text-text-color">{pet.breed || pet.species}</p></div>
                    </div>
                  ))}
                </div>
            </motion.div>
          )}

          {step === 3 && (
             <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-2xl font-semibold text-text-color-dark">3. Escolha data e horário</h2>
                <div>
                    <h3 className="text-lg font-medium text-text-color-dark mb-4">Selecione a data</h3>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                        {generateAvailableDates().map((date, index) => {
                            const dateStr = date.toISOString().split('T')[0];
                            return <button key={index} onClick={() => setSelectedDate(dateStr)} className={`p-3 rounded-lg text-center transition-colors ${selectedDate === dateStr ? 'bg-primary text-white' : 'bg-surface-dark text-text-color hover:bg-primary-light/50'}`}><div className="text-xs font-medium">{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</div><div className="text-lg font-bold">{date.getDate()}</div></button>;
                        })}
                    </div>
                </div>
                {selectedDate && (
                    <div>
                        <h3 className="text-lg font-medium text-text-color-dark mb-4">Selecione o horário</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {availableTimes.map(time => <button key={time} onClick={() => setSelectedTime(time)} className={`p-3 rounded-lg text-center transition-colors ${selectedTime === time ? 'bg-primary text-white' : 'bg-surface-dark text-text-color hover:bg-primary-light/50'}`}>{time}</button>)}
                        </div>
                    </div>
                )}
             </motion.div>
          )}

          {step === 4 && (
             <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                 <h2 className="text-2xl font-semibold text-text-color-dark mb-6">4. Confirme seu agendamento</h2>
                 <div className="bg-surface-dark rounded-xl p-6 space-y-4">
                    <div className="flex justify-between">
                        <span className="text-text-color">{selectedServiceData?.name}</span>
                        <span className="font-medium text-text-color-dark">R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-accent/20 pt-4 flex items-center space-x-4">
                        <Calendar className="h-6 w-6 text-primary" /><p>{new Date(`${selectedDate}T00:00:00`).toLocaleDateString('pt-BR')} às {selectedTime}</p>
                    </div>
                 </div>
             </motion.div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (<button onClick={() => setStep(step - 1)} className="px-6 py-3 border border-accent text-text-color-dark rounded-lg">Voltar</button>) : <div />} 
            {step < 4 ? (
                <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className={`px-6 py-3 rounded-lg font-medium flex items-center ${canProceed() ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                    Continuar <ChevronRight className="h-4 w-4 ml-2" />
                </button>
            ) : (
                <button onClick={handleConfirmBooking} disabled={bookingLoading} className="px-8 py-3 bg-status-success text-white rounded-lg font-medium flex items-center justify-center disabled:bg-opacity-50">
                    {bookingLoading ? <Loader className="animate-spin h-5 w-5" /> : 'Confirmar Agendamento'}
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
