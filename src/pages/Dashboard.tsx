import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Heart, Plus, Loader, PlayCircle, Bone, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore';

// --- Interfaces ---
interface Pet {
  id: string;
  name: string;
  breed: string;
  species: string;
}

interface Appointment {
  id: string;
  petId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'confirmado' | 'em-andamento' | 'concluido';
  petName?: string;
  serviceName?: string;
}

const services = [
    { id: 'banho-tosa', name: 'Banho & Tosa'},
    { id: 'veterinario', name: 'Check-up Veterinário' },
];

export const Dashboard: React.FC = () => {
  const { currentUser, userData } = useAuth(); // Usando o userData do AuthContext
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      try {
        // Busca Pets
        const petsCollectionRef = collection(db, 'usuarios', currentUser.uid, 'pets');
        const petsSnapshot = await getDocs(petsCollectionRef);
        const petsList = petsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Pet[];
        setPets(petsList);

        // Busca Agendamentos Futuros
        if (petsList.length > 0) {
            const appointmentsQuery = query(
              collection(db, 'agendamentos'), 
              where("userId", "==", currentUser.uid),
              where("date", ">=", today),
              orderBy("date"),
              orderBy("time")
            );
            const appointmentsSnapshot = await getDocs(appointmentsQuery);
            const appointmentsList = appointmentsSnapshot.docs.map(doc => {
                const data = doc.data();
                const pet = petsList.find(p => p.id === data.petId);
                const service = services.find(s => s.id === data.serviceId);
                return {
                    id: doc.id, ...data,
                    petName: pet?.name || 'Pet não encontrado',
                    serviceName: service?.name || 'Serviço não encontrado',
                } as Appointment;
            });
            setAppointments(appointmentsList);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-surface"><Loader className="animate-spin text-primary" size={48} /></div>;
  }

  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-text-color-dark">Olá, {userData?.fullName}!</h1>
            <p className="text-text-color mt-1">Bem-vindo(a) ao seu painel. Aqui está um resumo da sua jornada conosco.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Próximos Agendamentos */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-xl font-semibold text-text-color-dark mb-4">Próximos Agendamentos</h2>
              <div className="space-y-4">
                {appointments.length > 0 ? appointments.map(app => (
                  <div key={app.id} className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary-light/50 p-3 rounded-lg"><Calendar className="h-6 w-6 text-primary" /></div>
                      <div>
                        <h3 className="font-semibold text-text-color-dark">{app.serviceName}</h3>
                        <p className="text-sm text-text-color">{`${app.petName} • ${new Date(app.date + 'T00:00:00').toLocaleDateString('pt-BR')} às ${app.time}`}</p>
                      </div>
                    </div>
                    {new Date(app.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0] ? (
                        <Link to={`/check-in/${app.id}`} className="flex items-center px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors">
                           <PlayCircle className="h-5 w-5 mr-2"/> Acompanhar
                        </Link>
                    ) : (
                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Confirmado</span>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 bg-white rounded-xl shadow-sm">
                    <p className="text-text-color">Nenhum agendamento futuro.</p>
                    <Link to="/booking" className="text-primary font-medium mt-2 inline-block">Que tal agendar um serviço?</Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Coluna da Direita */}
          <div className="space-y-8">
            {/* Meus Pets */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-xl font-semibold text-text-color-dark mb-4">Meus Pets</h2>
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                {pets.map(pet => (
                    <div key={pet.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                        <Link to={`/pet-profile/${pet.id}`} className="flex items-center space-x-3 group">
                            <img src={`https://ui-avatars.com/api/?name=${pet.name}&background=random&color=fff`} alt={pet.name} className="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <p className="font-semibold text-text-color-dark group-hover:text-primary transition-colors">{pet.name}</p>
                                <p className="text-sm text-text-color">{pet.breed || pet.species}</p>
                            </div>
                        </Link>
                        <Link to={`/pet-profile/${pet.id}`} className="text-sm text-primary font-medium hover:underline">Ver Perfil</Link>
                    </div>
                ))}
                 <Link to="/pet-profile" className="w-full flex items-center justify-center bg-primary-light/50 text-primary py-3 px-4 rounded-lg hover:bg-primary-light transition-colors font-medium mt-4">
                    <Plus className="h-5 w-5 mr-2" />
                    Adicionar Novo Pet
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
