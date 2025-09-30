import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Bell, 
  Shield, 
  CreditCard,
  Eye,
  EyeOff,
  Edit,
  Save,
  Loader2,
  Heart,
  Plus,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileService, Profile as ProfileType } from '../services/profileService';
import { petsService } from '../services/petsService';
import { cepService } from '../services/cepService';
// import { getImageUrl } from '../config/images';
import SimpleAvatarUpload from '../components/SimpleAvatarUpload';
import PetAvatarUpload from '../components/PetAvatarUpload';
import { BreedSelector } from '../components/BreedSelector';
import toast from 'react-hot-toast';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  birth_date: string;
  death_date?: string;  // Data de óbito do pet
  gender: string;
  weight: string;
  height: string;
  color: string;
  microchip_id: string;
  notes: string;
  avatar_url: string;
  is_active: boolean;
  age: string;
  personality: string[];
  allergies: string[];
  medications: string[];
  breed_id?: string;
}

interface TabState {
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  loading: boolean;
  error: string | null;
}

const Profile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Estados principais
  console.log('Componente Profile renderizado');
  const [activeTab, setActiveTab] = useState('pets');
  console.log('Aba ativa atual:', activeTab);
  
  // Debug temporário
  React.useEffect(() => {
    console.log('useEffect - activeTab mudou para:', activeTab);
  }, [activeTab]);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  // Estados para o modal de pets
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [showPetModal, setShowPetModal] = useState(false);
  const [isAddingPet, setIsAddingPet] = useState(false);
  
  // Estados por aba
  const [tabStates, setTabStates] = useState<Record<string, TabState>>({
    personal: { isEditing: false, hasUnsavedChanges: false, loading: false, error: null },
    pets: { isEditing: false, hasUnsavedChanges: false, loading: false, error: null },
    notifications: { isEditing: false, hasUnsavedChanges: false, loading: false, error: null },
    security: { isEditing: false, hasUnsavedChanges: false, loading: false, error: null },
    payment: { isEditing: false, hasUnsavedChanges: false, loading: false, error: null }
  });
  
  // Estados específicos
  const [originalProfile, setOriginalProfile] = useState<ProfileType | null>(null);
  const [originalPets, setOriginalPets] = useState<Pet[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [notifications, setNotifications] = useState([
    { id: 'appointments', name: 'Lembretes de Consulta', description: 'Receber notificações sobre consultas agendadas', enabled: true },
    { id: 'promotions', name: 'Promoções e Ofertas', description: 'Receber ofertas especiais e promoções', enabled: false },
    { id: 'health_reminders', name: 'Lembretes de Saúde', description: 'Alertas sobre vacinação e check-ups', enabled: true },
    { id: 'whatsapp', name: 'WhatsApp', description: 'Receber notificações via WhatsApp', enabled: true },
    { id: 'email', name: 'E-mail', description: 'Receber notificações por e-mail', enabled: true },
    { id: 'push', name: 'Push Notifications', description: 'Notificações no aplicativo', enabled: true }
  ]);
  const [paymentMethods] = useState([
    { id: '1', type: 'credit', number: '**** **** **** 1234', brand: 'Visa', isDefault: true },
    { id: '2', type: 'credit', number: '**** **** **** 5678', brand: 'Mastercard', isDefault: false }
  ]);

  const tabs = [
    { id: 'personal', name: 'Meus Dados', icon: User },
    { id: 'pets', name: 'Meus Pets', icon: Heart },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'payment', name: 'Pagamento', icon: CreditCard }
  ];

  // Função para atualizar estado da aba
  const updateTabState = useCallback((tabId: string, updates: Partial<TabState>) => {
    setTabStates(prev => ({
      ...prev,
      [tabId]: { ...prev[tabId], ...updates }
    }));
  }, []);

  // Verificar se há mudanças não salvas
  const checkUnsavedChanges = useCallback((tabId: string) => {
    switch (tabId) {
      case 'personal':
        return JSON.stringify(profile) !== JSON.stringify(originalProfile);
      case 'pets':
        return JSON.stringify(pets) !== JSON.stringify(originalPets);
      case 'notifications':
        // Implementar verificação de mudanças nas notificações
        return false;
      case 'security':
        return passwordData.current !== '' || passwordData.new !== '' || passwordData.confirm !== '';
      case 'payment':
        // Implementar verificação de mudanças nos métodos de pagamento
        return false;
      default:
        return false;
    }
  }, [profile, originalProfile, pets, originalPets, passwordData]);

  // Atualizar estado de mudanças não salvas
  useEffect(() => {
    const hasChanges = checkUnsavedChanges(activeTab);
    updateTabState(activeTab, { hasUnsavedChanges: hasChanges });
  }, [activeTab, checkUnsavedChanges, updateTabState]);

  // Funções para gerenciar pets
  const openPetModal = (pet?: Pet) => {
    console.log('openPetModal chamada com:', pet);
    if (pet) {
      console.log('Editando pet existente:', pet.name);
      setEditingPet(pet);
      setIsAddingPet(false);
    } else {
      console.log('Adicionando novo pet');
      // Criar um novo pet vazio
      const newPet: Pet = {
        id: '',
        name: '',
        species: '',
        breed: '',
        birth_date: '',
        gender: '',
        weight: '',
        height: '',
        color: '',
        microchip_id: '',
        notes: '',
        avatar_url: '',
        is_active: true,
        age: '',
        personality: [],
        allergies: [],
        medications: [],
        breed_id: undefined
      };
      setEditingPet(newPet);
      setIsAddingPet(true);
    }
    setShowPetModal(true);
    console.log('Modal de pet aberto, showPetModal:', true);
  };

  const closePetModal = () => {
    console.log('🚪 closePetModal chamada');
    console.log('📊 Estado antes do fechamento - showPetModal:', showPetModal, 'editingPet:', editingPet, 'isAddingPet:', isAddingPet);
    console.trace('🔍 Stack trace do fechamento do modal:');
    setShowPetModal(false);
    setEditingPet(null);
    setIsAddingPet(false);
    console.log('❌ Modal de pet fechado');
  };

  const handleSavePet = async (petData: Pet) => {
    console.log('🔥 handleSavePet: INICIADO');
    console.log('📋 handleSavePet: petData recebido:', petData);
    console.log('🏷️ handleSavePet: isAddingPet:', isAddingPet);
    console.log('🏷️ handleSavePet: editingPet:', editingPet);
    
    try {
      console.log('⏳ handleSavePet: Atualizando estado de loading...');
      updateTabState('pets', { loading: true, error: null });
      
      if (isAddingPet) {
        // Criar novo pet
        const newPet = await petsService.createPet({
          name: petData.name,
          species: petData.species,
          breed: petData.breed,
          birth_date: petData.birth_date || null,
          death_date: petData.death_date || null,
          gender: petData.gender || null,
          weight: petData.weight ? parseFloat(petData.weight) : null,
          height: petData.height || null,
          color: petData.color || null,
          microchip_id: petData.microchip_id || null,
          notes: petData.notes || null,
          avatar_url: petData.avatar_url || null,
          is_active: petData.death_date ? false : petData.is_active,
          age: petData.age || null,
          personality: petData.personality || [],
          allergies: petData.allergies || [],
          medications: petData.medications || [],
          breed_id: petData.breed_id || null
        });
        
        // Converter para o formato do componente
        const formattedPet: Pet = {
          id: newPet.id,
          name: newPet.name,
          species: newPet.species,
          breed: newPet.breed,
          birth_date: newPet.birth_date || '',
          death_date: newPet.death_date || '',
          gender: newPet.gender || '',
          weight: newPet.weight ? newPet.weight.toString() : '',
          height: newPet.height || '',
          color: newPet.color || '',
          microchip_id: newPet.microchip_id || '',
          notes: newPet.notes || '',
          avatar_url: newPet.avatar_url || '',
          is_active: newPet.is_active ?? true,
          age: newPet.age || '',
          personality: newPet.personality || [],
          allergies: newPet.allergies || [],
          medications: newPet.medications || [],
          breed_id: newPet.breed_id || undefined
        };
        
        const updatedPets = [...pets, formattedPet];
        setPets(updatedPets);
        setOriginalPets(updatedPets);
        console.log('✅ handleSavePet: Pet adicionado com sucesso!');
        toast.success('Pet adicionado com sucesso!');
      } else {
        console.log('🔄 handleSavePet: Atualizando pet existente com ID:', petData.id);
        // Atualizar pet existente
        const updatedPet = await petsService.updatePet(petData.id, {
          name: petData.name,
          species: petData.species,
          breed: petData.breed,
          birth_date: petData.birth_date || null,
          death_date: petData.death_date || null,
          gender: petData.gender || null,
          weight: petData.weight ? parseFloat(petData.weight) : null,
          height: petData.height || null,
          color: petData.color || null,
          microchip_id: petData.microchip_id || null,
          notes: petData.notes || null,
          avatar_url: petData.avatar_url || null,
          is_active: petData.death_date ? false : petData.is_active,
          age: petData.age || null,
          personality: petData.personality || [],
          allergies: petData.allergies || [],
          medications: petData.medications || [],
          breed_id: petData.breed_id || null
        });
        
        // Converter para o formato do componente
        const formattedPet: Pet = {
          id: updatedPet.id,
          name: updatedPet.name,
          species: updatedPet.species,
          breed: updatedPet.breed,
          birth_date: updatedPet.birth_date || '',
          death_date: updatedPet.death_date || '',
          gender: updatedPet.gender || '',
          weight: updatedPet.weight ? updatedPet.weight.toString() : '',
          height: updatedPet.height || '',
          color: updatedPet.color || '',
          microchip_id: updatedPet.microchip_id || '',
          notes: updatedPet.notes || '',
          avatar_url: updatedPet.avatar_url || '',
          is_active: updatedPet.is_active ?? true,
          age: updatedPet.age || '',
          personality: updatedPet.personality || [],
          allergies: updatedPet.allergies || [],
          medications: updatedPet.medications || [],
          breed_id: updatedPet.breed_id || undefined
        };
        
        const updatedPets = pets.map(p => p.id === petData.id ? formattedPet : p);
        setPets(updatedPets);
        setOriginalPets(updatedPets);
        console.log('✅ handleSavePet: Pet atualizado com sucesso!');
        toast.success('Pet atualizado com sucesso!');
      }
      
      console.log('🚪 handleSavePet: Fechando modal...');
      closePetModal();
      console.log('✅ handleSavePet: CONCLUÍDO COM SUCESSO');
    } catch (error) {
      console.error('❌ handleSavePet: ERRO:', error);
      console.error('❌ handleSavePet: Stack trace:', error.stack);
      toast.error('Erro ao salvar pet. Tente novamente.');
    } finally {
      console.log('🔄 handleSavePet: Finalizando - removendo loading...');
      updateTabState('pets', { loading: false });
    }
  };





  const deletePet = async (petId: string) => {
    if (!confirm('Tem certeza que deseja excluir este pet?')) return;
    
    try {
      await petsService.deletePet(petId);
      const updatedPets = pets.filter(p => p.id !== petId);
      setPets(updatedPets);
      setOriginalPets(updatedPets);
      toast.success('Pet excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir pet:', error);
      toast.error('Erro ao excluir pet. Tente novamente.');
    }
  };

  // Função para buscar CEP
  const handleCepChange = useCallback(async (cep: string) => {
    // Limpar erro anterior
    setCepError(null);
    
    // Remover caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');
    
    // Verificar se o CEP tem 8 dígitos
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      
      try {
        const addressData = await cepService.getCepData(cleanCep);
        
        if (addressData) {
          // Preencher os campos de endereço automaticamente
          setProfile(prev => prev ? {
            ...prev,
            street: addressData.logradouro || '',
            neighborhood: addressData.bairro || '',
            city: addressData.localidade || '',
            state: addressData.uf || ''
            // Manter o campo number vazio para o usuário preencher
          } : null);
        } else {
          setCepError('CEP não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setCepError('Erro ao buscar CEP. Tente novamente.');
      } finally {
        setLoadingCep(false);
      }
    } else if (cleanCep.length > 0 && cleanCep.length < 8) {
      setCepError('CEP deve ter 8 dígitos');
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      console.log('🔐 Verificando autenticação - user:', user);
      console.log('🔐 authLoading:', authLoading);
      if (!user) {
        console.log('❌ Usuário não autenticado, redirecionando para login');
        return;
      }
      console.log('✅ Usuário autenticado, carregando dados...');
      
      try {
        updateTabState('personal', { loading: true, error: null });
        
        const profileData = await profileService.getProfile();
        if (profileData) {
          setProfile(profileData);
          setOriginalProfile(profileData);
        } else {
          const defaultProfile = {
            id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            full_name: user.user_metadata?.full_name || 'Usuário',
            email: user.email || '',
            phone: user.user_metadata?.phone || '',
            cpf: '',
            cep: '',
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            complement: '',
            address: '',
            avatar_url: user.user_metadata?.avatar_url || null
          };
          setProfile(defaultProfile);
          setOriginalProfile(defaultProfile);
        }
        
        // Carregar pets reais da tabela pets_pet
        console.log('🐾 Iniciando carregamento dos pets...');
        updateTabState('pets', { loading: true, error: null });
        try {
          const petsData = await petsService.getPets();
          console.log('🐾 Dados dos pets carregados:', petsData);
          // Converter os dados do banco para o formato esperado pelo componente
          const formattedPets: Pet[] = petsData.map(pet => ({
             id: pet.id,
             name: pet.name,
             species: pet.species,
             breed: pet.breed,
             birth_date: pet.birth_date || '',
             death_date: pet.death_date || '',
             gender: pet.gender || '',
             weight: pet.weight ? pet.weight.toString() : '',
             height: pet.height || '',
             color: pet.color || '',
             microchip_id: pet.microchip_id || '',
             notes: pet.notes || '',
             avatar_url: pet.avatar_url || '',
             is_active: pet.is_active ?? true,
             age: pet.age || '',
             personality: pet.personality || [],
             allergies: pet.allergies || [],
             medications: pet.medications || [],
             breed_id: pet.breed_id || undefined
           }));
          console.log('🐾 Pets formatados:', formattedPets);
          setPets(formattedPets);
          setOriginalPets(formattedPets);
        } catch (err) {
          console.error('❌ Erro ao carregar pets:', err);
          updateTabState('pets', { error: 'Erro ao carregar pets' });
          // Em caso de erro, inicializar com array vazio
          setPets([]);
          setOriginalPets([]);
        } finally {
          updateTabState('pets', { loading: false });
        }
        
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        updateTabState('personal', { error: 'Erro ao carregar dados do perfil' });
      } finally {
        updateTabState('personal', { loading: false });
      }
    };

    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, navigate, updateTabState]);

  // Função para trocar de aba
  const handleTabChange = (tabId: string) => {
    const currentTabState = tabStates[activeTab];
    
    if (currentTabState.hasUnsavedChanges) {
      setPendingTab(tabId);
      setShowConfirmDialog(true);
    } else {
      setActiveTab(tabId);
    }
  };

  // Confirmar troca de aba perdendo dados
  const confirmTabChange = () => {
    if (pendingTab) {
      // Resetar dados da aba atual
      resetTabData(activeTab);
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
    setShowConfirmDialog(false);
  };

  // Cancelar troca de aba
  const cancelTabChange = () => {
    setPendingTab(null);
    setShowConfirmDialog(false);
  };

  // Resetar dados da aba
  const resetTabData = (tabId: string) => {
    switch (tabId) {
      case 'personal':
        setProfile(originalProfile);
        break;
      case 'pets':
        setPets(originalPets);
        break;
      case 'security':
        setPasswordData({ current: '', new: '', confirm: '' });
        break;
    }
    updateTabState(tabId, { isEditing: false, hasUnsavedChanges: false, error: null });
  };

  // Iniciar edição
  const startEditing = (tabId: string) => {
    updateTabState(tabId, { isEditing: true });
  };

  // Cancelar edição
  const cancelEditing = (tabId: string) => {
    resetTabData(tabId);
  };

  // Salvar dados da aba
  const saveTabData = async (tabId: string) => {
    try {
      updateTabState(tabId, { loading: true, error: null });
      
      switch (tabId) {
        case 'personal':
          if (profile) {
            const { ...profileUpdates } = profile;
            const updatedProfile = await profileService.updateProfile(profileUpdates);
            setProfile(updatedProfile);
            setOriginalProfile(updatedProfile);
          }
          break;
        case 'pets':
          // Implementar salvamento de pets
          setOriginalPets([...pets]);
          break;
        case 'security':
          // Implementar alteração de senha
          setPasswordData({ current: '', new: '', confirm: '' });
          break;
        case 'notifications':
          // Implementar salvamento de notificações
          break;
        case 'payment':
          // Implementar salvamento de métodos de pagamento
          break;
      }
      
      updateTabState(tabId, { isEditing: false, hasUnsavedChanges: false });
    } catch (err) {
      console.error('Erro ao salvar:', err);
      updateTabState(tabId, { error: 'Erro ao salvar dados' });
    } finally {
      updateTabState(tabId, { loading: false });
    }
  };



  if (authLoading || tabStates.personal.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light to-accent-light flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-text-color">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentTabState = tabStates[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-accent-light py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-color-dark mb-2">Meu Perfil</h1>
          <p className="text-text-color">Gerencie suas informações pessoais e configurações</p>
        </div>

        {/* Navegação das Abas */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const hasUnsaved = tabStates[tab.id].hasUnsavedChanges;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      relative py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${isActive 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                      {hasUnsaved && (
                        <div className="w-2 h-2 bg-red-500 rounded-full" title="Alterações não salvas" />
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Conteúdo das Abas */}
          <div className="p-6">
            {/* Barra de Status */}
            {currentTabState.hasUnsavedChanges && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">
                      Você tem alterações não salvas
                    </p>
                    <p className="text-sm text-yellow-700">
                      Lembre-se de salvar antes de trocar de aba ou sair da página
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => cancelEditing(activeTab)}
                      className="text-sm text-yellow-800 hover:text-yellow-900 font-medium"
                    >
                      Descartar
                    </button>
                    <button
                      onClick={() => saveTabData(activeTab)}
                      disabled={currentTabState.loading}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 flex items-center"
                    >
                      {currentTabState.loading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      Salvar Agora
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Erro */}
            {currentTabState.error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                  <p className="text-sm text-red-800">{currentTabState.error}</p>
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text-color-dark">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              
              <div className="flex space-x-3">
                {currentTabState.isEditing ? (
                  <>
                    <button
                      onClick={() => cancelEditing(activeTab)}
                      disabled={currentTabState.loading}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => saveTabData(activeTab)}
                      disabled={currentTabState.loading || !currentTabState.hasUnsavedChanges}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center"
                    >
                      {currentTabState.loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </button>
                  </>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        console.log('Botão clicado para aba:', activeTab);
                        if (activeTab === 'pets') {
                          // Para aba pets, abrir modal de adicionar pet
                          openPetModal();
                        } else {
                          // Para outras abas, ativar modo de edição
                          startEditing(activeTab);
                        }
                      }}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
                    >
                      {activeTab === 'pets' ? (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Pet
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Conteúdo da Aba Ativa */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'personal' && (
                  <PersonalDataTab 
                    profile={profile}
                    setProfile={setProfile}
                    isEditing={currentTabState.isEditing}
                    loadingCep={loadingCep}
                    cepError={cepError}
                    onCepChange={handleCepChange}
                  />
                )}
                
                {activeTab === 'pets' && (
                  (() => {
                    console.log('Renderizando PetsTab - pets:', pets, 'isEditing:', currentTabState.isEditing);
                    return (
                      <PetsTab 
                        pets={pets}
                        setPets={setPets}
                        isEditing={currentTabState.isEditing}
                        onEditPet={openPetModal}
                        onDeletePet={deletePet}
                        onAddPet={() => openPetModal()}
                      />
                    );
                  })()
                )}
                
                {activeTab === 'notifications' && (
                  <NotificationsTab 
                    notifications={notifications}
                    setNotifications={setNotifications}
                    isEditing={currentTabState.isEditing}
                  />
                )}
                
                {activeTab === 'security' && (
                  <SecurityTab 
                    passwordData={passwordData}
                    setPasswordData={setPasswordData}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    isEditing={currentTabState.isEditing}
                  />
                )}
                
                {activeTab === 'payment' && (
                  <PaymentTab 
                    paymentMethods={paymentMethods}
                    isEditing={currentTabState.isEditing}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
              <h3 className="text-lg font-semibold text-text-color-dark">
                Alterações não salvas
              </h3>
            </div>
            
            <p className="text-text-color mb-6">
              Você tem alterações não salvas nesta aba. Se continuar, essas alterações serão perdidas.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelTabChange}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmTabChange}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Descartar Alterações
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Pet */}
      {console.log('Checking modal render condition:', { showPetModal, editingPet }) || (showPetModal && (
        <PetModal
          pet={editingPet}
          isOpen={showPetModal}
          isAdding={!editingPet}
          onClose={closePetModal}
          onSave={handleSavePet}
        />
      ))}
    </div>
  );
};

// Componente da Aba de Dados Pessoais
const PersonalDataTab: React.FC<{
  profile: ProfileType | null;
  setProfile: (profile: ProfileType | null) => void;
  isEditing: boolean;
  loadingCep: boolean;
  cepError: string | null;
  onCepChange: (cep: string) => void;
}> = ({ profile, setProfile, isEditing, loadingCep, cepError, onCepChange }) => {
  if (!profile) return null;

  const handleInputChange = (field: keyof ProfileType, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleCepChange = (value: string) => {
    handleInputChange('cep', value);
    onCepChange(value);
  };

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <SimpleAvatarUpload
            currentAvatarUrl={profile.avatar_url}
            onAvatarUpdate={async (url) => {
              const newAvatarUrl = url || '';
              handleInputChange('avatar_url', newAvatarUrl);
              
              // Salvar automaticamente no banco de dados
              try {
                await profileService.updateProfile({
                  ...profile,
                  avatar_url: newAvatarUrl
                });
                toast.success('Foto atualizada com sucesso!');
              } catch (error) {
                console.error('Erro ao salvar foto:', error);
                toast.error('Erro ao salvar a foto. Tente novamente.');
              }
            }}
            disabled={!isEditing}
          />
        </div>
        <div>
          <h3 className="text-lg font-medium text-text-color-dark">
            {profile.full_name || 'Usuário'}
          </h3>
          <p className="text-text-color">{profile.email}</p>
        </div>
      </div>

      {/* Dados Pessoais */}
      <div>
        <h4 className="text-md font-semibold text-text-color-dark mb-4 border-b border-gray-200 pb-2">
          Dados Pessoais
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-color-dark mb-2">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={profile.full_name || ''}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-color-dark mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={profile.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                placeholder="seu@email.com"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">O e-mail não pode ser alterado</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-color-dark mb-2">
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-color-dark mb-2">
              CPF
            </label>
            <input
              type="text"
              value={profile.cpf || ''}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="000.000.000-00"
            />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div>
        <h4 className="text-md font-semibold text-text-color-dark mb-4 border-b border-gray-200 pb-2">
          Endereço
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-color-dark mb-2">
              CEP
            </label>
            <div className="relative">
              <input
                type="text"
                value={profile.cep || ''}
                onChange={(e) => handleCepChange(e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                  cepError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="00000-000"
              />
              {loadingCep && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            {cepError && (
              <p className="text-xs text-red-600 mt-1">{cepError}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-color-dark mb-2">
              Rua
            </label>
            <input
              type="text"
              value={profile.street || ''}
              onChange={(e) => handleInputChange('street', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Nome da rua"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-color-dark mb-2">
              Número
            </label>
            <input
              type="text"
              value={profile.number || ''}
              onChange={(e) => handleInputChange('number', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-color-dark mb-2">
              Bairro
            </label>
            <input
              type="text"
              value={profile.neighborhood || ''}
              onChange={(e) => handleInputChange('neighborhood', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Nome do bairro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-color-dark mb-2">
              Cidade
            </label>
            <input
              type="text"
              value={profile.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Nome da cidade"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-color-dark mb-2">
              Estado
            </label>
            <input
              type="text"
              value={profile.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="SP"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-color-dark mb-2">
              Complemento
            </label>
            <input
              type="text"
              value={profile.complement || ''}
              onChange={(e) => handleInputChange('complement', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Apartamento, bloco, etc. (opcional)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Função para calcular idade baseada na data de nascimento
const calculateAge = (birthDate: string): string => {
  if (!birthDate) return '';
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  if (birth > today) return '';
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (today.getDate() < birth.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  
  if (years > 0) {
    return years === 1 ? '1 ano' : `${years} anos`;
  } else if (months > 0) {
    return months === 1 ? '1 mês' : `${months} meses`;
  } else {
    const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return days === 1 ? '1 dia' : `${days} dias`;
  }
};

// Componente da Aba de Pets
const PetsTab: React.FC<{
  pets: Pet[];
  setPets: (pets: Pet[]) => void;
  isEditing: boolean;
  onEditPet: (pet: Pet) => void;
  onDeletePet: (petId: string) => void;
  onAddPet: () => void;
}> = ({ pets, isEditing, onEditPet, onDeletePet }) => {
  console.log('PetsTab renderizado - isEditing:', isEditing, 'pets:', pets.length);
  return (
    <div className="space-y-6">
      {/* Lista de Pets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <div key={pet.id} className="bg-gray-50 rounded-lg p-4">
            {/* Foto do Pet */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {pet.avatar_url ? (
                  <img 
                    src={pet.avatar_url} 
                    alt={`Foto de ${pet.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Erro ao carregar imagem do pet:', pet.name);
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-xs font-medium">
                      {pet.species === 'Cachorro' ? '🐕' : '🐱'}
                    </span>
                  </div>
                )}
                {pet.avatar_url && (
                  <div className="w-full h-full bg-gray-300 items-center justify-center" style={{display: 'none'}}>
                    <span className="text-gray-500 text-xs font-medium">
                      {pet.species === 'Cachorro' ? '🐕' : '🐱'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-text-color-dark">{pet.name}</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    console.log('Botão editar clicado para pet:', pet.name);
                    onEditPet(pet);
                  }}
                  className="text-primary hover:text-primary-dark"
                  title="Editar pet"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => {
                    console.log('Botão excluir clicado para pet:', pet.name);
                    onDeletePet(pet.id);
                  }}
                  className="text-red-600 hover:text-red-700"
                  title="Excluir pet"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-text-color">
              <p><span className="font-medium">Espécie:</span> {pet.species}</p>
              <p><span className="font-medium">Raça:</span> {pet.breed}</p>
              <p><span className="font-medium">Gênero:</span> {pet.gender}</p>
              <p><span className="font-medium">Peso:</span> {pet.weight}kg</p>
              {pet.birth_date && (
                <>
                  <p><span className="font-medium">Idade:</span> {calculateAge(pet.birth_date)}</p>
                  <p><span className="font-medium">Nascimento:</span> {new Date(pet.birth_date).toLocaleDateString()}</p>
                </>
              )}
            </div>
            
            <div className="mt-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                pet.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {pet.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

// Componente da Aba de Notificações
interface NotificationItem {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const NotificationsTab: React.FC<{
  notifications: NotificationItem[];
  setNotifications: (notifications: NotificationItem[]) => void;
  isEditing: boolean;
}> = ({ notifications, setNotifications, isEditing }) => {
  const toggleNotification = (id: string) => {
    if (!isEditing) return;
    
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
    ));
  };

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div key={notification.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h3 className="font-medium text-text-color-dark">{notification.name}</h3>
            <p className="text-sm text-text-color">{notification.description}</p>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notification.enabled}
              onChange={() => toggleNotification(notification.id)}
              disabled={!isEditing}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${
              notification.enabled ? 'bg-primary' : 'bg-gray-300'
            } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                notification.enabled ? 'translate-x-5' : 'translate-x-0'
              } mt-0.5 ml-0.5`} />
            </div>
          </label>
        </div>
      ))}
    </div>
  );
};

// Componente da Aba de Segurança
const SecurityTab: React.FC<{
  passwordData: { current: string; new: string; confirm: string };
  setPasswordData: (data: { current: string; new: string; confirm: string }) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isEditing: boolean;
}> = ({ passwordData, setPasswordData, showPassword, setShowPassword, isEditing }) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-600 mr-3" />
          <div>
            <h3 className="font-medium text-blue-800">Segurança da Conta</h3>
            <p className="text-sm text-blue-700">Mantenha sua conta segura alterando sua senha regularmente</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-color-dark mb-2">
            Senha Atual *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordData.current}
              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Digite sua senha atual"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={!isEditing}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-color-dark mb-2">
            Nova Senha *
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={passwordData.new}
            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Digite sua nova senha"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-color-dark mb-2">
            Confirmar Nova Senha *
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={passwordData.confirm}
            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Confirme sua nova senha"
          />
        </div>
      </div>

      {/* Dicas de Segurança */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-text-color-dark mb-2">Dicas de Segurança</h4>
        <ul className="text-sm text-text-color space-y-1">
          <li>• Use pelo menos 8 caracteres</li>
          <li>• Inclua letras maiúsculas e minúsculas</li>
          <li>• Adicione números e símbolos</li>
          <li>• Evite informações pessoais óbvias</li>
        </ul>
      </div>
    </div>
  );
};

// Componente da Aba de Pagamento
interface PaymentMethod {
  id: string;
  type: string;
  number: string;
  brand: string;
  isDefault: boolean;
}

const PaymentTab: React.FC<{
  paymentMethods: PaymentMethod[];
  isEditing: boolean;
}> = ({ paymentMethods, isEditing }) => {
  return (
    <div className="space-y-6">
      {/* Métodos de Pagamento */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-text-color-dark">Cartões Salvos</h3>
          {isEditing && (
            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
              Adicionar Cartão
            </button>
          )}
        </div>

        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-4 border-2 rounded-lg transition-colors ${
                method.isDefault
                  ? 'border-primary/50 bg-primary-light/30'
                  : 'border-accent/20 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-surface-dark p-3 rounded-lg">
                    <CreditCard className="h-6 w-6 text-text-color" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-color-dark">
                      {method.brand} {method.number}
                    </h3>
                    <p className="text-sm text-text-color">
                      {method.isDefault ? 'Cartão principal' : 'Cartão adicional'}
                    </p>
                  </div>
                </div>
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <button className="text-primary hover:text-primary-dark text-sm font-medium">
                        Tornar Principal
                      </button>
                    )}
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outras Formas de Pagamento */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-text-color-dark mb-4">
          Outras Formas de Pagamento
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-accent/20">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">PIX</span>
            </div>
            <span className="font-medium text-text-color-dark">PIX</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-accent/20">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">$</span>
            </div>
            <span className="font-medium text-text-color-dark">Dinheiro</span>
          </div>
        </div>
      </div>

    </div>
  );
};

// Componente Modal de Pet
interface PetModalProps {
  pet: Pet | null;
  isOpen: boolean;
  isAdding: boolean;
  onClose: () => void;
  onSave: (pet: Pet) => void;
}

const PetModal: React.FC<PetModalProps> = ({ pet, isOpen, isAdding, onClose, onSave }) => {
  console.log('PetModal renderizado - isOpen:', isOpen, 'pet:', pet?.name || 'novo pet');
  
  const [formData, setFormData] = useState<Pet>({
    id: '',
    name: '',
    species: '',
    breed: '',
    birth_date: '',
    death_date: '',
    gender: '',
    weight: '',
    height: '',
    color: '',
    microchip_id: '',
    notes: '',
    avatar_url: '',
    is_active: true,
    age: '',
    personality: [],
    allergies: [],
    medications: [],
    breed_id: undefined
  });

  useEffect(() => {
    if (pet) {
      setFormData(pet);
    }
  }, [pet]);

  // Calcular idade automaticamente quando birth_date muda
  useEffect(() => {
    if (formData.birth_date) {
      const calculatedAge = calculateAge(formData.birth_date);
      setFormData(prev => ({ ...prev, age: calculatedAge }));
    } else {
      setFormData(prev => ({ ...prev, age: '' }));
    }
  }, [formData.birth_date]);

  const handleInputChange = (field: keyof Pet, value: string | boolean | string[] | undefined) => {
    console.log('📝 PetModal: handleInputChange chamado - campo:', field, 'valor:', value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'personality' | 'allergies' | 'medications', value: string) => {
    // Para personalidade, permitir entrada livre de texto
    if (field === 'personality') {
      handleInputChange(field, [value]); // Armazenar como string única temporariamente
      return;
    }
    
    // Para outros campos, manter o comportamento original
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    handleInputChange(field, items);
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log('🚀 PetModal: handleSubmit iniciado');
    console.log('📋 PetModal: formData atual:', formData);
    
    e.preventDefault();
    
    if (!formData.name.trim()) {
      console.log('❌ PetModal: Nome do pet é obrigatório');
      toast.error('Nome do pet é obrigatório');
      return;
    }
    
    console.log('✅ PetModal: Validação do nome passou');
    
    // Processar personalidade antes de salvar
    const processedData = {
      ...formData,
      personality: Array.isArray(formData.personality) && formData.personality.length === 1 
        ? formData.personality[0].split(',').map(item => item.trim()).filter(item => item.length > 0)
        : formData.personality
    };
    
    console.log('📤 PetModal: Dados processados para envio:', processedData);
    console.log('🔄 PetModal: Chamando onSave...');
    
    try {
      onSave(processedData);
      console.log('✅ PetModal: onSave chamado com sucesso');
    } catch (error) {
      console.error('❌ PetModal: Erro ao chamar onSave:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-color-dark">
              {isAdding ? 'Adicionar Pet' : 'Editar Pet'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto do Pet */}
            <div>
              <h3 className="text-lg font-medium text-text-color-dark mb-4 border-b border-gray-200 pb-2">
                Foto do Pet
              </h3>
              <div className="flex justify-center">
                <PetAvatarUpload
                  currentAvatarUrl={formData.avatar_url}
                  onAvatarUpdate={(url) => {
                    console.log('🔄 PetModal: onAvatarUpdate chamado com URL:', url);
                    handleInputChange('avatar_url', url);
                    console.log('✅ PetModal: avatar_url atualizado no formData');
                  }}
                />
              </div>
            </div>

            {/* Informações Básicas */}
            <div>
              <h3 className="text-lg font-medium text-text-color-dark mb-4 border-b border-gray-200 pb-2">
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nome do pet"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Espécie
                  </label>
                  <select
                    value={formData.species}
                    onChange={(e) => handleInputChange('species', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Selecione a espécie</option>
                    <option value="Cachorro">Cachorro</option>
                    <option value="Gato">Gato</option>
                    <option value="Pássaro">Pássaro</option>
                    <option value="Peixe">Peixe</option>
                    <option value="Roedor">Roedor</option>
                    <option value="Réptil">Réptil</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Raça
                  </label>
                  <BreedSelector
                    value={formData.breed_id || ''}
                    onChange={(breedId, breed) => {
                      handleInputChange('breed_id', breedId || undefined);
                      handleInputChange('breed', breed?.name || '');
                    }}
                    species={formData.species === 'Cachorro' ? 'dog' : formData.species === 'Gato' ? 'cat' : undefined}
                    placeholder="Selecione a raça do pet"
                    className=""
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Gênero
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Selecione o gênero</option>
                    <option value="Macho">Macho</option>
                    <option value="Fêmea">Fêmea</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Idade
                    <span className="text-xs text-gray-500 ml-1">(calculada automaticamente)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.age}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    placeholder="Será calculada com base na data de nascimento"
                  />
                </div>
              </div>
            </div>

            {/* Características Físicas */}
            <div>
              <h3 className="text-lg font-medium text-text-color-dark mb-4 border-b border-gray-200 pb-2">
                Características Físicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: 25.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Altura
                  </label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: 60cm ou médio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Cor
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: Dourado"
                  />
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div>
              <h3 className="text-lg font-medium text-text-color-dark mb-4 border-b border-gray-200 pb-2">
                Informações Adicionais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Microchip ID
                  </label>
                  <input
                    type="text"
                    value={formData.microchip_id}
                    onChange={(e) => handleInputChange('microchip_id', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="ID do microchip"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Data de Óbito
                    <span className="text-xs text-gray-500 ml-1">(opcional)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.death_date || ''}
                    onChange={(e) => handleInputChange('death_date', e.target.value || undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {formData.death_date && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Pet será automaticamente inativado quando a data de óbito for salva
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      disabled={!!formData.death_date}  // Desabilitar se houver data de óbito
                    />
                    <span className="text-sm font-medium text-text-color-dark">
                      Pet ativo
                      {formData.death_date && (
                        <span className="text-xs text-gray-500 ml-1">(controlado automaticamente pela data de óbito)</span>
                      )}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Personalidade, Alergias e Medicamentos */}
            <div>
              <h3 className="text-lg font-medium text-text-color-dark mb-4 border-b border-gray-200 pb-2">
                Saúde e Comportamento
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Personalidade
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(formData.personality) ? formData.personality.join(', ') : formData.personality || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      // Permitir entrada livre de texto com espaços e vírgulas
                      handleInputChange('personality', [e.target.value]);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: Brincalhão, Carinhoso, Calmo (separar por vírgula)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Alergias
                  </label>
                  <input
                    type="text"
                    value={formData.allergies.join(', ')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleArrayChange('allergies', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: Pólen, Frango (separar por vírgula)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Medicamentos
                  </label>
                  <input
                    type="text"
                    value={formData.medications.join(', ')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleArrayChange('medications', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: Antibiótico, Vitamina (separar por vírgula)"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Observações adicionais sobre o pet"
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                {isAdding ? 'Adicionar Pet' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Profile;
