import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dog, Cat, Bird, Save, Loader, ArrowLeft, Edit, Calendar, Siren, MessageSquare, Bone, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { BreedAutocomplete } from '../components/BreedAutocomplete'; // Importando o componente extraído

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

interface Appointment {
    id: string;
    serviceId: string;
    date: string;
    time: string;
    serviceName?: string;
}

const services = [
    { id: 'banho-tosa', name: 'Banho & Tosa'},
    { id: 'veterinario', name: 'Check-up Veterinário' },
];

// --- Componente Principal ---
export const PetProfile: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  return petId ? <ViewEditPet petId={petId} /> : <AddPet />;
};

// --- Componente para ADICIONAR Pet ---
const AddPet: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formState, setFormState] = useState<Partial<PetData>>({ name: '', species: 'Cachorro', breed: '', gender: 'Macho', birthDate: '', allergies: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    if (name === 'species') {
      setFormState(prev => ({ ...prev, breed: '' }));
    }
  };

  const handleBreedChange = useCallback((breed: string) => {
    setFormState(prev => ({ ...prev, breed }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { setError('Você precisa estar logado.'); return; }
    if (!formState.name || !formState.species) { setError('Nome e Espécie são obrigatórios.'); return; }

    setLoading(true);
    try {
      const petsCollectionRef = collection(db, 'usuarios', currentUser.uid, 'pets');
      await addDoc(petsCollectionRef, { ...formState, createdAt: new Date() });
      navigate('/dashboard');
    } catch (err) {
      setError('Ocorreu um erro ao salvar. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
        <div className="max-w-2xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-dark mr-3"><ArrowLeft className="h-5 w-5 text-text-color" /></button>
                <h1 className="text-3xl font-bold text-text-color-dark">Adicionar novo Pet</h1>
            </motion.div>
            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
                {/* Nome, Espécie, etc. */}
                <div>
                    <label className="block text-sm font-medium text-text-color mb-2">Raça</label>
                    <BreedAutocomplete 
                        value={formState.breed || ''} 
                        onChange={handleBreedChange} 
                        species={formState.species || ''} 
                    />
                </div>
                {/* Outros campos e botão de submit */}
            </motion.form>
        </div>
    </div>
  );
};

// --- Componente para VISUALIZAR/EDITAR Pet ---
const ViewEditPet: React.FC<{ petId: string }> = ({ petId }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [pet, setPet] = useState<PetData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<Partial<PetData>>({});

  useEffect(() => {
    // ... Lógica para buscar dados do pet e agendamentos ...
  }, [currentUser, petId, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBreedChange = useCallback((breed: string) => {
    setFormState(prev => ({ ...prev, breed }));
  }, []);

  const handleUpdate = async () => {
    // ... Lógica para atualizar dados do pet ...
  };
  
  const calculateAge = (birthDate: string): string => {
    // ... Lógica para calcular idade ...
    return "";
  }

  if (loading && !pet) { return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-primary" size={48} /></div>; }

  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4">
            {/* Header da Página */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm p-6 self-start">
                    {isEditing ? (
                        <div className="space-y-4">
                            {/* Campos de edição */}
                            <div>
                                <label className="block text-sm font-medium text-text-color mb-1">Raça</label>
                                <BreedAutocomplete 
                                    value={formState.breed || ''}
                                    onChange={handleBreedChange}
                                    species={formState.species || ''}
                                />
                            </div>
                            {/* Outros campos de edição */}
                        </div>
                    ) : (
                        <div className="space-y-5">
                           {/* Visualização do Perfil */}
                        </div>
                    )}
                </div>
                <div className="lg:col-span-2 space-y-8">
                    {/* Histórico de Serviços */}
                </div>
            </div>
        </div>
    </div>
  );
};
