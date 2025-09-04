import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, onSnapshot, updateDoc, DocumentData } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader, CheckCircle, Circle, Camera } from 'lucide-react';

// --- Interfaces e Dados ---
interface AppointmentData {
    petName: string;
    serviceName: string;
    progress: number;
    photos: { [key: number]: string }; // Inclui o campo de fotos
}

const serviceSteps = [
    { id: 1, title: 'Check-in Realizado', description: 'Seu pet foi recebido por nossa equipe.' },
    { id: 2, title: 'Iniciando o Banho', description: 'Hora de ficar limpinho e cheiroso.' },
    { id: 3, title: 'Secagem e Escovação', description: 'Deixando a pelagem macia e brilhante.' },
    { id: 4, title: 'Finalização e Perfume', description: 'Os toques finais para um look perfeito.' },
    { id: 5, title: 'Pronto para Retirada', description: 'Seu pet está ansioso para te ver!' },
];

// --- Componente ---
export const CheckIn: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [appointment, setAppointment] = useState<AppointmentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser || !appointmentId) return;
        const appointmentRef = doc(db, 'agendamentos', appointmentId);

        // Assegura que o serviço comece
        const startService = async () => {
            const currentDoc = await getDoc(appointmentRef);
            if (currentDoc.exists() && !currentDoc.data().progress) {
                await updateDoc(appointmentRef, { status: 'em-andamento', progress: 1 });
            }
        };
        startService();

        const unsubscribe = onSnapshot(appointmentRef, async (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data() as DocumentData;
                const petDoc = await getDoc(doc(db, 'usuarios', currentUser.uid, 'pets', data.petId));
                const service = { id: 'banho-tosa', name: 'Banho & Tosa' };

                setAppointment({
                    petName: petDoc.exists() ? petDoc.data().name : 'Pet desconhecido',
                    serviceName: service.name,
                    progress: data.progress || 1,
                    photos: data.photos || {}, // Escuta as fotos
                });
                setLoading(false);
            } else { setError("Agendamento não encontrado."); setLoading(false); }
        }, (err) => { console.error(err); setError("Erro ao buscar agendamento."); setLoading(false); });

        return () => unsubscribe();
    }, [appointmentId, currentUser]);

    if (loading) return <div className="flex justify-center items-center h-screen bg-surface-dark"><Loader className="animate-spin text-primary" size={48} /></div>;
    if (error) return <div className="flex flex-col justify-center items-center h-screen"><p>{error}</p><Link to="/dashboard">Voltar</Link></div>;

    return (
        <div className="min-h-screen bg-surface-dark pt-8 pb-12">
            <div className="max-w-3xl mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mb-6">
                    {/* ... Header ... */}
                </motion.div>

                <div className="bg-white rounded-2xl shadow-sm p-8">
                    <div className="space-y-8 relative">
                        {serviceSteps.map((step, index) => (
                            <div key={step.id} className="flex items-start">
                                <div className="flex flex-col items-center mr-6">
                                    <div className={`rounded-full z-10 flex items-center justify-center w-10 h-10 ${appointment && appointment.progress >= step.id ? 'bg-primary' : 'bg-accent'}`}>
                                        {appointment && appointment.progress >= step.id ? <CheckCircle className="text-white w-6 h-6"/> : <Circle className="text-text-color/50 w-6 h-6"/>}
                                    </div>
                                    {index < serviceSteps.length -1 && <div className="w-px h-full mt-2 bg-accent"/>}
                                </div>
                                <motion.div initial={{ y:10, opacity: 0 }} animate={{ y:0, opacity: 1}} transition={{delay: 0.1 * index}} className={`pt-1 flex-1 ${appointment && appointment.progress >= step.id ? 'opacity-100' : 'opacity-50'}`}>
                                    <h3 className="font-semibold text-text-color-dark">{step.title}</h3>
                                    <p className="text-sm text-text-color">{step.description}</p>
                                    {/* Bloco para exibir a foto */}
                                    {appointment?.photos[step.id] && (
                                        <a href={appointment.photos[step.id]} target="_blank" rel="noopener noreferrer" className="mt-3 block">
                                            <img src={appointment.photos[step.id]} alt={`Foto da etapa: ${step.title}`} className="rounded-lg w-full max-w-sm object-cover shadow-md hover:shadow-lg transition-shadow"/>
                                        </a>
                                    )}
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
