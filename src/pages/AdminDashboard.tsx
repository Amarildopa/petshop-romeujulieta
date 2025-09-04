import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Bone, Calendar, Loader, Clock, ChevronRight } from 'lucide-react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

// --- Interfaces ---
interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number | string;
    color: string;
}

interface Pet {
    id: string;
    name: string;
}

interface UserData {
    fullName: string;
}

interface Appointment {
    id: string;
    serviceId: string;
    time: string;
    petName: string;
    userName: string;
}

const serviceIdToName: { [key: string]: string } = {
    'banho-tosa': 'Banho & Tosa',
    'veterinario': 'Check-up Veterinário',
    'daycare': 'Daycare',
    'adestramento': 'Adestramento',
};

// --- Componentes --- 

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
    <motion.div 
        className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className={`p-4 rounded-lg`} style={{ backgroundColor: `${color}30` }}>
            <Icon className="h-8 w-8" style={{ color: color }} />
        </div>
        <div>
            <p className="text-4xl font-bold text-text-color-dark">{value}</p>
            <p className="text-text-color font-medium">{label}</p>
        </div>
    </motion.div>
);

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ userCount: 0, petCount: 0, todayAppointmentsCount: 0 });
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Stats
                const usersSnapshot = await getDocs(collection(db, 'usuarios'));
                const userCount = usersSnapshot.size;

                let petCount = 0;
                for (const userDoc of usersSnapshot.docs) {
                    const petsSnapshot = await getDocs(collection(db, 'usuarios', userDoc.id, 'pets'));
                    petCount += petsSnapshot.size;
                }

                // 2. Fetch Today's Appointments
                const today = new Date().toISOString().split('T')[0];
                const appointmentsQuery = query(collection(db, 'agendamentos'), where('date', '==', today));
                const appointmentsSnapshot = await getDocs(appointmentsQuery);
                
                const appointmentsList = await Promise.all(appointmentsSnapshot.docs.map(async (appDoc) => {
                    const appData = appDoc.data();
                    const userDoc = await getDoc(doc(db, 'usuarios', appData.userId));
                    const petDoc = await getDoc(doc(db, 'usuarios', appData.userId, 'pets', appData.petId));

                    return {
                        id: appDoc.id,
                        time: appData.time,
                        serviceId: appData.serviceId,
                        userName: userDoc.exists() ? (userDoc.data() as UserData).fullName : 'Cliente não encontrado',
                        petName: petDoc.exists() ? (petDoc.data() as Pet).name : 'Pet não encontrado',
                    } as Appointment;
                }));

                appointmentsList.sort((a, b) => a.time.localeCompare(b.time));
                
                setStats({ userCount, petCount, todayAppointmentsCount: appointmentsSnapshot.size });
                setTodayAppointments(appointmentsList);

            } catch (error) {
                console.error("Erro ao buscar dados do dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-primary" size={48} /></div>;
    }

    return (
        <div className="min-h-screen bg-surface p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <motion.h1 
                    className="text-3xl font-bold text-text-color-dark mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Dashboard Administrativo
                </motion.h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard icon={Users} label="Total de Clientes" value={stats.userCount} color="#3B82F6" />
                    <StatCard icon={Bone} label="Total de Pets" value={stats.petCount} color="#8B5CF6" />
                    <StatCard icon={Calendar} label="Agendamentos Hoje" value={stats.todayAppointmentsCount} color="#10B981" />
                </div>

                <motion.div 
                    className="mt-12 bg-white rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-xl font-semibold text-text-color-dark p-6 border-b border-accent/20">Agenda de Hoje</h2>
                    <div className="divide-y divide-accent/20">
                        {todayAppointments.length > 0 ? todayAppointments.map(app => (
                            <div key={app.id} className="p-4 flex items-center justify-between hover:bg-surface-dark transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2 text-primary font-bold">
                                        <Clock className="h-5 w-5" />
                                        <span>{app.time}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-text-color-dark">{serviceIdToName[app.serviceId] || app.serviceId}</p>
                                        <p className="text-sm text-text-color">{app.petName} ({app.userName})</p>
                                    </div>
                                </div>
                                <Link to={`/admin/servico/${app.id}`} className="text-sm font-medium text-primary hover:underline flex items-center">
                                    Ver Detalhes <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                        )) : (
                            <p className="p-6 text-center text-text-color">Nenhum agendamento para hoje.</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
