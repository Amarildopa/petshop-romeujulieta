import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { motion } from 'framer-motion';
import { Loader, Calendar, Clock, User, PawPrint } from 'lucide-react';

// Interfaces
interface AdminAppointment {
    id: string;
    petName: string;
    userName: string;
    serviceName: string;
    time: string;
    status: 'confirmado' | 'em-andamento' | 'concluido';
}

// Mock de dados de serviços e usuários (em um app real, viriam do DB)
const services = [
    { id: 'banho-tosa', name: 'Banho & Tosa' },
    { id: 'veterinario', name: 'Check-up Veterinário' },
];

const getMockUserName = async (userId: string) => {
    // Simula a busca do nome do usuário. Em um app real, faríamos uma busca no DB.
    return `Cliente ${userId.substring(0, 4)}`;
}
const getMockPetName = async (petId: string) => {
    // Simula a busca do nome do pet.
    return `Pet ${petId.substring(0, 4)}`;
}

export const AdminAgenda: React.FC = () => {
    const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            try {
                const todayStr = currentDate.toISOString().split('T')[0];
                const q = query(
                    collection(db, 'agendamentos'), 
                    where('date', '==', todayStr),
                    orderBy('time')
                );

                const querySnapshot = await getDocs(q);
                const appointmentsList: AdminAppointment[] = await Promise.all(
                    querySnapshot.docs.map(async (doc) => {
                        const data = doc.data();
                        const service = services.find(s => s.id === data.serviceId);
                        // Simulação da busca de nomes
                        const userName = await getMockUserName(data.userId);
                        const petName = await getMockPetName(data.petId);

                        return {
                            id: doc.id,
                            petName,
                            userName,
                            serviceName: service?.name || 'Serviço desconhecido',
                            time: data.time,
                            status: data.status || 'confirmado',
                        };
                    })
                );

                setAppointments(appointmentsList);
            } catch (err) {
                console.error(err);
                setError('Falha ao carregar a agenda.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [currentDate]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-primary" size={48} /></div>;
    }

    return (
        <div className="min-h-screen bg-surface-dark pt-8 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-bold text-text-color-dark mb-2">Agenda do Dia</h1>
                    <p className="text-text-color">{currentDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </motion.div>

                {error && <p className="text-red-500 mt-4">{error}</p>}

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.length > 0 ? (
                        appointments.map(app => (
                            <motion.div key={app.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="bg-primary-light/40 p-3 rounded-lg mr-4"><Calendar className="h-6 w-6 text-primary"/></div>
                                            <div>
                                                <h2 className="font-bold text-lg text-text-color-dark">{app.serviceName}</h2>
                                                <p className="text-sm text-primary font-medium">{app.time}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${app.status === 'em-andamento' ? 'bg-yellow-200 text-yellow-800' : app.status === 'concluido' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                            {app.status.replace('-',' ')}
                                        </span>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center text-text-color"><PawPrint size={16} className="mr-3 text-accent"/><span>Pet: <span className="font-semibold text-text-color-dark">{app.petName}</span></span></div>
                                        <div className="flex items-center text-text-color"><User size={16} className="mr-3 text-accent"/><span>Cliente: <span className="font-semibold text-text-color-dark">{app.userName}</span></span></div>
                                    </div>
                                </div>
                                <Link to={`/admin/servico/${app.id}`} className="block bg-surface text-center py-3 px-6 text-primary font-medium rounded-b-xl hover:bg-surface-dark transition-colors">
                                    Gerenciar Serviço
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        <p className="text-text-color col-span-full text-center py-10">Nenhum agendamento para hoje.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
