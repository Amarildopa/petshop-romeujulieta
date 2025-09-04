import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader, User, PawPrint, Calendar, Clock, Siren, MessageSquare, Bone, Heart } from 'lucide-react';

// --- Interfaces ---
interface PetData {
    id: string;
    name: string;
    species: string;
    breed: string;
    gender: string;
    birthDate?: string;
    allergies?: string;
    notes?: string;
}

interface UserData {
    fullName: string;
    email: string;
}

interface Appointment {
    id: string;
    serviceId: string;
    date: string;
    time: string;
    status: 'confirmado' | 'em-andamento' | 'concluido';
    userId: string;
    petId: string;
}

interface CombinedData {
    appointment: Appointment;
    pet: PetData;
    user: UserData;
}

const serviceIdToName: { [key: string]: string } = {
    'banho-tosa': 'Banho & Tosa',
    'veterinario': 'Check-up Veterinário',
};

const statusOptions: Appointment['status'][] = ['confirmado', 'em-andamento', 'concluido'];

// --- Componente ---
export const AdminService: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();

    const [data, setData] = useState<CombinedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!appointmentId) return;

        const fetchAllData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Appointment
                const appointmentRef = doc(db, 'agendamentos', appointmentId);
                const appointmentSnap = await getDoc(appointmentRef);
                if (!appointmentSnap.exists()) throw new Error("Agendamento não encontrado.");
                const appointmentData = { id: appointmentSnap.id, ...appointmentSnap.data() } as Appointment;

                // 2. Fetch User
                const userRef = doc(db, 'usuarios', appointmentData.userId);
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) throw new Error("Cliente não encontrado.");
                const userData = userSnap.data() as UserData;

                // 3. Fetch Pet
                const petRef = doc(db, 'usuarios', appointmentData.userId, 'pets', appointmentData.petId);
                const petSnap = await getDoc(petRef);
                if (!petSnap.exists()) throw new Error("Pet não encontrado.");
                const petData = { id: petSnap.id, ...petSnap.data() } as PetData;

                setData({ appointment: appointmentData, user: userData, pet: petData });

            } catch (err: any) { setError(err.message); }
            finally { setLoading(false); }
        };

        fetchAllData();
    }, [appointmentId]);

    const handleStatusChange = async (newStatus: Appointment['status']) => {
        if (!appointmentId || !data) return;
        setUpdating(true);
        try {
            const batch = writeBatch(db);
            const appointmentRef = doc(db, 'agendamentos', appointmentId);

            // Update appointment status
            batch.update(appointmentRef, { status: newStatus });

            // Create notification for user
            const notificationRef = doc(collection(db, 'notificacoes'));
            const serviceName = serviceIdToName[data.appointment.serviceId] || 'Serviço';
            let notificationTitle = '';
            let notificationMessage = '';

            if (newStatus === 'em-andamento') {
                notificationTitle = 'Serviço Iniciado!';
                notificationMessage = `O serviço de ${serviceName} para ${data.pet.name} começou.`;
            }
            else if (newStatus === 'concluido') {
                notificationTitle = 'Serviço Concluído!';
                notificationMessage = `O serviço de ${serviceName} para ${data.pet.name} foi finalizado e ele(a) está pronto(a) para ser retirado(a)!`;
            }
            
            if(notificationMessage){
                batch.set(notificationRef, {
                    userId: data.appointment.userId,
                    title: notificationTitle,
                    message: notificationMessage,
                    createdAt: new Date(),
                    isRead: false,
                    link: `/check-in/${appointmentId}`
                });
            }

            await batch.commit();
            setData(prev => prev ? { ...prev, appointment: { ...prev.appointment, status: newStatus } } : null);
        
        } catch (err) { console.error("Erro ao atualizar status:", err); }
        finally { setUpdating(false); }
    };
    
    const calculateAge = (birthDate?: string) => {
        if (!birthDate) return 'Idade não informada';
        const birth = new Date(birthDate);
        const today = new Date();
        let years = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) { years--; }
        return `${years} anos`;
    }

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-primary" size={48} /></div>;
    if (error) return <div className="text-center py-10 text-status-danger">{error}</div>;
    if (!data) return null;

    const { appointment, pet, user } = data;

    return (
        <div className="min-h-screen bg-surface p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mb-6">
                    <button onClick={() => navigate('/admin/dashboard')} className="p-2 rounded-full hover:bg-surface-dark mr-3"><ArrowLeft className="h-5 w-5 text-text-color" /></button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-color-dark">Detalhes do Serviço</h1>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Coluna de Detalhes do Pet e Cliente */}
                    <div className="md:col-span-1 space-y-6">
                        <InfoCard title="Informações do Pet" icon={PawPrint}>
                            <DetailItem label="Nome" value={pet.name} />
                            <DetailItem label="Espécie" value={pet.species} />
                            <DetailItem label="Raça" value={pet.breed} />
                            <DetailItem label="Idade" value={calculateAge(pet.birthDate)} />
                            {pet.allergies && <HighlightItem label="Alergias" value={pet.allergies} icon={Siren} color="#EF4444" />}
                            {pet.notes && <HighlightItem label="Observações" value={pet.notes} icon={MessageSquare} color="#F59E0B" />}
                        </InfoCard>
                        <InfoCard title="Dados do Cliente" icon={User}>
                            <DetailItem label="Nome" value={user.fullName} />
                            <DetailItem label="Email" value={user.email} />
                        </InfoCard>
                    </div>

                    {/* Coluna de Status do Serviço */}
                    <div className="md:col-span-2">
                        <InfoCard title="Detalhes do Agendamento" icon={Calendar}>
                            <DetailItem label="Serviço" value={serviceIdToName[appointment.serviceId] || appointment.serviceId} />
                            <DetailItem label="Data" value={new Date(`${appointment.date}T00:00:00`).toLocaleDateString('pt-BR')} />
                            <DetailItem label="Hora" value={appointment.time} />
                            <div className="mt-4 pt-4 border-t border-accent/20">
                                <label className="block text-sm font-medium text-text-color mb-2">Status do Serviço</label>
                                <div className="flex space-x-2">
                                    {statusOptions.map(status => (
                                        <button 
                                            key={status} 
                                            onClick={() => handleStatusChange(status)}
                                            disabled={updating || appointment.status === status}
                                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 border-2 ${appointment.status === status ? 'bg-primary text-white border-primary' : 'bg-transparent border-accent/30 text-text-color-dark hover:border-primary hover:text-primary disabled:opacity-50'}`}>
                                            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                                        </button>
                                    ))}
                                    {updating && <Loader className="animate-spin text-primary ml-4"/>}
                                </div>
                            </div>
                        </InfoCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Componentes Auxiliares ---
const InfoCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center text-xl font-semibold text-text-color-dark mb-4 pb-3 border-b border-accent/20">
            <Icon className="h-6 w-6 mr-3 text-primary" />
            {title}
        </div>
        <div className="space-y-3 text-sm">{children}</div>
    </motion.div>
);

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="font-medium text-text-color">{label}</p>
        <p className="font-semibold text-text-color-dark text-base">{value}</p>
    </div>
);

const HighlightItem: React.FC<{ label: string; value: string; icon: React.ElementType; color: string }> = ({ label, value, icon: Icon, color }) => (
    <div className="p-3 rounded-lg mt-2" style={{ backgroundColor: `${color}1A`}}>
        <p className="font-semibold flex items-center" style={{ color: color }}>
            <Icon className="h-5 w-5 mr-2"/> {label}
        </p>
        <p className="text-text-color-dark whitespace-pre-wrap mt-1">{value}</p>
    </div>
);
