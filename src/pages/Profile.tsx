import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Camera
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { petsService } from '../services/petsService';
import { cepService } from '../services/cepService';
import { getImageUrl } from '../config/images';
import PhotoUpload from '../components/PhotoUpload';

type Profile = {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  cep: string;
  cpf: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
  avatar_url: string | null;
};

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { id: 'personal', name: 'Dados Pessoais', icon: User },
    { id: 'pets', name: 'Meus Pets', icon: Heart },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'payment', name: 'Pagamento', icon: CreditCard }
  ];

  // Mock data for notifications
  const notifications = [
    { id: 'appointments', name: 'Lembretes de Consulta', description: 'Receber notificações sobre consultas agendadas', enabled: true },
    { id: 'promotions', name: 'Promoções e Ofertas', description: 'Receber ofertas especiais e promoções', enabled: false },
    { id: 'health_reminders', name: 'Lembretes de Saúde', description: 'Alertas sobre vacinação e check-ups', enabled: true },
    { id: 'whatsapp', name: 'WhatsApp', description: 'Receber notificações via WhatsApp', enabled: true },
    { id: 'email', name: 'E-mail', description: 'Receber notificações por e-mail', enabled: true },
    { id: 'push', name: 'Push Notifications', description: 'Notificações no aplicativo', enabled: true }
  ];

  const paymentMethods = [
    { id: '1', type: 'credit', number: '**** **** **** 1234', brand: 'Visa', isDefault: true },
    { id: '2', type: 'credit', number: '**** **** **** 5678', brand: 'Mastercard', isDefault: false }
  ];

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        const profileData = await profileService.getProfile();
        
        if (profileData) {
          setProfile(profileData);
        } else {
          // Se não há perfil, criar um básico com dados do usuário
          setProfile({
            id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            full_name: user.user_metadata?.full_name || 'Usuário',
            email: user.email || '',
            phone: user.user_metadata?.phone || '',
            address: '',
            cep: '',
            cpf: '',
            street: '',
            neighborhood: '',
            city: '',
            state: '',
            complement: '',
            avatar_url: user.user_metadata?.avatar_url || null
          });
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        setError('Erro ao carregar dados do perfil');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else {
        loadProfile();
      }
    }
  }, [user, authLoading, navigate]);

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      setError(null);
      
      await profileService.updateProfile(profile);
      setIsEditing(false);
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      setError('Erro ao salvar dados do perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleInputChange = (field: keyof Profile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleCepChange = async (cep: string) => {
    handleInputChange('cep', cep);
    
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length === 8) {
      try {
        setLoadingCep(true);
        setCepError(null);
        
        const addressData = await cepService.getCepData(cleanCep);
        
        if (addressData) {
          setProfile(prev => prev ? {
            ...prev,
            street: addressData.logradouro || '',
            neighborhood: addressData.bairro || '',
            city: addressData.localidade || '',
            state: addressData.uf || ''
          } : null);
        } else {
          setCepError('CEP não encontrado');
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
        setCepError('Erro ao buscar CEP. Verifique se o CEP está correto.');
      } finally {
        setLoadingCep(false);
      }
    } else if (cleanCep.length > 0 && cleanCep.length < 8) {
      setCepError('CEP deve ter 8 dígitos');
    } else {
      setCepError(null);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho do arquivo (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    try {
      setUploadingAvatar(true);
      setError(null);
      
      const avatarUrl = await profileService.uploadAvatar(file);
      
      if (avatarUrl && profile) {
        const updatedProfile = { ...profile, avatar_url: avatarUrl };
        setProfile(updatedProfile);
        await profileService.updateProfile(updatedProfile);
      }
    } catch (err: unknown) {
      console.error('Erro ao fazer upload da foto:', err);
      
      // Mensagens de erro mais específicas
      const errorMessage = err instanceof Error ? err.message : ''
      if (errorMessage.includes('User not authenticated')) {
        setError('Você precisa estar logado para fazer upload da foto.');
      } else {
        // Para qualquer outro erro, a foto ainda será salva localmente
        setError(null); // Não mostrar erro se a foto foi salva localmente
        console.log('Foto salva localmente com sucesso');
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAddPet = () => {
    // Implementar lógica para adicionar pet
    console.log('Adicionar pet');
  };

  // Estados para edição de pets
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [editPetData, setEditPetData] = useState({
    name: '',
    species: 'Cachorro',
    breed: '',
    birth_date: '',
    gender: 'Macho',
    weight: '',
    height: '',
    color: '',
    microchip_id: '',
    notes: '',
    avatar_url: '',
    is_active: true,
    personality: [] as string[],
    allergies: [] as string[],
    medications: [] as string[]
  });
  const [editPetLoading, setEditPetLoading] = useState(false);
  const [editPetError, setEditPetError] = useState<string | null>(null);

  // Debug: Log do estado editingPet
  console.log('🔄 Estado atual editingPet:', editingPet);

  const handleEditPet = (petId: string) => {
    console.log('🐕 Clicou para editar pet:', petId);
    alert(`Clicou para editar pet: ${petId}`);
    const pet = mockPets.find(p => p.id === petId);
    console.log('🔍 Pet encontrado:', pet);
    if (pet) {
      setEditingPet(pet);
      setEditPetData({
        name: pet.name || '',
        species: pet.species || 'Cachorro',
        breed: pet.breed || '',
        birth_date: pet.birth_date || '',
        gender: pet.gender || 'Macho',
        weight: pet.weight?.toString() || '',
        height: pet.height || '',
        color: pet.color || '',
        microchip_id: pet.microchip_id || '',
        notes: pet.notes || '',
        avatar_url: pet.avatar_url || '',
        is_active: pet.is_active !== false,
        personality: pet.personality || [],
        allergies: pet.allergies || [],
        medications: pet.medications || []
      });
      console.log('✅ Estado do modal definido, editingPet:', pet);
    } else {
      console.log('❌ Pet não encontrado com ID:', petId);
    }
  };

  const handleSaveEditPet = async () => {
    if (!editingPet || !editPetData.name || !editPetData.species) {
      setEditPetError('Por favor, preencha os campos obrigatórios (nome e espécie)');
      return;
    }

    try {
      setEditPetLoading(true);
      setEditPetError(null);
      
      // Integrar com o petsService.updatePet
      await petsService.updatePet(editingPet.id, {
        name: editPetData.name,
        species: editPetData.species,
        breed: editPetData.breed || null,
        birth_date: editPetData.birth_date || null,
        gender: editPetData.gender || null,
        weight: editPetData.weight ? parseFloat(editPetData.weight) : null,
        height: editPetData.height || null,
        color: editPetData.color || null,
        microchip_id: editPetData.microchip_id || null,
        notes: editPetData.notes || null,
        avatar_url: editPetData.avatar_url || null,
        is_active: editPetData.is_active,
        personality: editPetData.personality,
        allergies: editPetData.allergies,
        medications: editPetData.medications
      });
      
      console.log('✅ Pet atualizado com sucesso:', editingPet.id);
      
      // Fechar modal
      setEditingPet(null);
      
      // Recarregar lista de pets (implementar quando integrar com backend real)
      // await loadUserPets();
      
    } catch (err) {
      setEditPetError(err instanceof Error ? err.message : 'Erro ao atualizar pet');
    } finally {
      setEditPetLoading(false);
    }
  };

  const handleCancelEditPet = () => {
    setEditingPet(null);
    setEditPetError(null);
  };

  const handleDeletePet = (petId: string) => {
    // Implementar lógica para deletar pet
    console.log('Deletar pet:', petId);
  };

  const mockPets = [
    {
      id: '1',
      name: 'Rex',
      species: 'Cão',
      breed: 'Golden Retriever',
      age: '3 anos',
      weight: '25kg',
      avatar_url: null,
      birth_date: '2021-01-15',
      gender: 'Macho',
      height: '60cm',
      color: 'Dourado',
      microchip_id: '123456789',
      notes: 'Pet muito dócil e brincalhão',
      is_active: true,
      personality: ['Brincalhão', 'Dócil'],
      allergies: [],
      medications: []
    },
    {
      id: '2',
      name: 'Mimi',
      species: 'Gato',
      breed: 'Persa',
      age: '2 anos',
      weight: '4kg',
      avatar_url: null,
      birth_date: '2022-03-10',
      gender: 'Fêmea',
      height: '25cm',
      color: 'Branco',
      microchip_id: '987654321',
      notes: 'Gata independente, gosta de carinho',
      is_active: true,
      personality: ['Independente', 'Carinhosa'],
      allergies: ['Frango'],
      medications: []
    }
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-color">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-color mb-4">Você precisa estar logado para acessar esta página.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-color mb-4">Erro ao carregar dados do perfil.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Tentar Novamente
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
          <div className="relative inline-block">
            <div className="relative">
              <img
                src={getImageUrl.userAvatar(profile?.avatar_url, 'large')}
                alt="Perfil"
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-lg object-cover"
                onError={(e) => {
                   const target = e.target as HTMLImageElement;
                   console.log('Erro ao carregar imagem do perfil, usando fallback');
                   target.src = getImageUrl.userAvatar(null, 'large');
                   target.onerror = null; // Previne loop infinito
                 }}
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
              <div className="absolute bottom-4 right-0">
                <label 
                  className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-dark transition-all duration-200 cursor-pointer transform hover:scale-105"
                  title="Alterar foto do perfil"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                    aria-label="Selecionar foto do perfil"
                  />
                  <Camera className="h-5 w-5" />
                </label>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-text-color-dark">
            {profile?.full_name || 'Usuário'}
          </h1>
          <p className="text-text-color">
            {profile?.email || 'email@exemplo.com'}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar com abas */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-accent/20 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-color-dark">Menu</h2>
                {!isEditing && activeTab === 'personal' && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary hover:text-primary-dark transition-colors"
                    title="Editar perfil"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              {saving && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">Salvando...</p>
                </div>
              )}
              
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-start space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 min-h-[48px] ${
                        activeTab === tab.id
                          ? 'bg-primary text-white shadow-md'
                          : 'text-text-color hover:bg-gray-50 hover:text-text-color-dark'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium text-sm truncate">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            {/* Aba Dados Pessoais */}
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-accent/20 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-text-color-dark">
                    Dados Pessoais
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                          !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                        }`}
                        placeholder="Digite seu nome completo"
                      />
                      <User className="absolute right-3 top-3 h-5 w-5 text-text-color" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      E-mail
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                          !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                        }`}
                        placeholder="Digite seu e-mail"
                      />
                      <Mail className="absolute right-3 top-3 h-5 w-5 text-text-color" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Telefone
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                          !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                        }`}
                        placeholder="(11) 99999-9999"
                      />
                      <Phone className="absolute right-3 top-3 h-5 w-5 text-text-color" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      CPF
                    </label>
                    <input
                      type="text"
                      value={profile.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      }`}
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      CEP
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profile.cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                          !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                        }`}
                        placeholder="00000-000"
                      />
                      {loadingCep && (
                        <Loader2 className="absolute right-3 top-3 h-5 w-5 text-primary animate-spin" />
                      )}
                      {cepError && (
                        <p className="text-red-500 text-xs mt-1">{cepError}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Rua
                    </label>
                    <input
                      type="text"
                      value={profile.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      }`}
                      placeholder="Nome da rua"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={profile.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      }`}
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      }`}
                      placeholder="Nome da cidade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={profile.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      }`}
                      placeholder="Estado"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={profile.complement}
                      onChange={(e) => handleInputChange('complement', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      }`}
                      placeholder="Apartamento, bloco, etc."
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-6 py-2 border border-accent/30 text-text-color rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>{saving ? 'Salvando...' : 'Salvar'}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Aba Meus Pets */}
            {activeTab === 'pets' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-accent/20 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-text-color-dark">
                    Meus Pets
                  </h2>
                  <button
                    onClick={handleAddPet}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Pet</span>
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                
                {saving && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 text-sm">Salvando...</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-red-100 p-4 rounded">
                    <p>Debug: mockPets.length = {mockPets.length}</p>
                    <p>Debug: mockPets = {JSON.stringify(mockPets.slice(0, 1), null, 2)}</p>
                  </div>
                  {mockPets.map((pet) => (
                    <div key={pet.id} className="bg-surface-dark rounded-lg p-6 border border-accent/20">
                      <div className="flex items-start space-x-4">
                        <img
                          src={getImageUrl.petImage(pet.avatar_url, 'medium')}
                          alt={pet.name}
                          className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-text-color-dark">{pet.name}</h3>
                            <div className="flex items-center space-x-2">
                              {/* Botão de teste simples */}
                              <button
                                onClick={() => alert(`Teste clique: ${pet.name}`)}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                              >
                                TESTE
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEditPet(pet.id);
                                }}
                                className="text-primary hover:text-primary-dark transition-colors p-1 rounded hover:bg-primary/10"
                                title="Editar pet"
                                type="button"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeletePet(pet.id);
                                }}
                                className="text-red-600 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-100"
                                title="Remover pet"
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-text-color">
                            <p><span className="font-medium">Espécie:</span> {pet.species}</p>
                            <p><span className="font-medium">Raça:</span> {pet.breed}</p>
                            <p><span className="font-medium">Idade:</span> {pet.age}</p>
                            <p><span className="font-medium">Peso:</span> {pet.weight}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formulário para adicionar novo pet */}
                <div className="bg-surface-dark rounded-lg p-6 border border-accent/20">
                  <h3 className="text-lg font-semibold text-text-color-dark mb-4">Adicionar Novo Pet</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Nome do Pet
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Digite o nome do pet"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Espécie
                      </label>
                      <select className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="">Selecione a espécie</option>
                        <option value="dog">Cão</option>
                        <option value="cat">Gato</option>
                        <option value="bird">Pássaro</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Raça
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Digite a raça"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Data de nascimento
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Idade (calculada automaticamente)
                      </label>
                      <input
                        type="text"
                        readOnly
                        className="w-full px-4 py-3 border border-accent/30 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        placeholder="Selecione a data de nascimento para calcular a idade"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Peso
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Ex: 5kg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Foto do pet
                      </label>
                      <PhotoUpload
                        onUploadComplete={(imageUrl) => {
                          console.log('Foto do pet carregada:', imageUrl);
                          // Aqui você pode salvar a URL da foto no estado do formulário
                        }}
                        onUploadError={(error) => {
                          console.error('Erro no upload da foto do pet:', error);
                        }}
                        maxSizeMB={5}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color-dark mb-2">
                        Observações
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Observações especiais"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-6">
                    <button className="px-6 py-2 border border-accent/30 text-text-color rounded-lg hover:bg-gray-50 transition-colors">
                      Cancelar
                    </button>
                    <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                      Adicionar Pet
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Aba Notificações */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-accent/20 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-text-color-dark">
                    Configurações de Notificação
                  </h2>
                </div>

                {mockPets.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-text-color mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text-color-dark mb-2">
                      Configure suas notificações
                    </h3>
                    <p className="text-text-color">
                      Personalize como você quer receber atualizações sobre seus pets.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between p-4 bg-surface-dark rounded-lg">
                        <div>
                          <h3 className="font-medium text-text-color-dark">{notification.name}</h3>
                          <p className="text-sm text-text-color">{notification.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked={notification.enabled}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Aba Segurança */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-accent/20 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-text-color-dark">
                    Segurança
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Senha Atual
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                        placeholder="Digite sua senha atual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-text-color hover:text-text-color-dark transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Digite sua nova senha"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Confirme sua nova senha"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Dicas de Segurança</h4>
                        <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                          <li>• Use pelo menos 8 caracteres</li>
                          <li>• Inclua letras maiúsculas e minúsculas</li>
                          <li>• Adicione números e símbolos</li>
                          <li>• Evite informações pessoais</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                      Alterar Senha
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Aba Pagamento */}
            {activeTab === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-accent/20 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-text-color-dark">
                    Formas de Pagamento
                  </h2>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    Adicionar Cartão
                  </button>
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
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-surface-dark rounded-lg p-6">
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
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição de Pet */}
      {editingPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-text-color-dark">
                Editar Pet: {editingPet.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Debug: editingPet = {editingPet ? 'true' : 'false'}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {editPetError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{editPetError}</p>
                </div>
              )}

              {/* Foto do Pet */}
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={editPetData.avatar_url || getImageUrl.petImage(null, 'medium')}
                    alt={editPetData.name}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  />
                  <PhotoUpload
                    onUploadComplete={(url) => setEditPetData(prev => ({ ...prev, avatar_url: url }))}
                    folder="pets"
                    className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-2 hover:bg-primary-dark transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </PhotoUpload>
                </div>
                <p className="text-sm text-text-color mt-2">Clique no ícone da câmera para alterar a foto</p>
              </div>

              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Nome do Pet *
                  </label>
                  <input
                    type="text"
                    value={editPetData.name}
                    onChange={(e) => setEditPetData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nome do seu pet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Espécie *
                  </label>
                  <select
                    value={editPetData.species}
                    onChange={(e) => setEditPetData(prev => ({ ...prev, species: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Cachorro">Cachorro</option>
                    <option value="Gato">Gato</option>
                    <option value="Pássaro">Pássaro</option>
                    <option value="Peixe">Peixe</option>
                    <option value="Hamster">Hamster</option>
                    <option value="Coelho">Coelho</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Raça
                  </label>
                  <input
                    type="text"
                    value={editPetData.breed}
                    onChange={(e) => setEditPetData(prev => ({ ...prev, breed: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Raça do pet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Gênero
                  </label>
                  <select
                    value={editPetData.gender}
                    onChange={(e) => setEditPetData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
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
                    value={editPetData.birth_date}
                    onChange={(e) => setEditPetData(prev => ({ ...prev, birth_date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editPetData.weight}
                    onChange={(e) => setEditPetData(prev => ({ ...prev, weight: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Peso em kg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Altura
                  </label>
                  <input
                    type="text"
                    value={editPetData.height}
                    onChange={(e) => setEditPetData(prev => ({ ...prev, height: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: 50cm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Cor
                  </label>
                  <input
                    type="text"
                    value={editPetData.color}
                    onChange={(e) => setEditPetData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Cor do pet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Microchip ID
                  </label>
                  <input
                    type="text"
                    value={editPetData.microchip_id}
                    onChange={(e) => setEditPetData(prev => ({ ...prev, microchip_id: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="ID do microchip"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Status do Pet
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_active"
                        checked={editPetData.is_active}
                        onChange={() => setEditPetData(prev => ({ ...prev, is_active: true }))}
                        className="mr-2"
                      />
                      <span className="text-green-600 font-medium">Ativo</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_active"
                        checked={!editPetData.is_active}
                        onChange={() => setEditPetData(prev => ({ ...prev, is_active: false }))}
                        className="mr-2"
                      />
                      <span className="text-red-600 font-medium">Inativo</span>
                    </label>
                  </div>
                  <p className="text-sm text-text-color mt-1">
                    Pets inativos não aparecerão nas opções de agendamento
                  </p>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-text-color-dark mb-2">
                  Observações
                </label>
                <textarea
                  value={editPetData.notes}
                  onChange={(e) => setEditPetData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Informações adicionais sobre o pet..."
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={handleCancelEditPet}
                disabled={editPetLoading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditPet}
                disabled={editPetLoading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center"
              >
                {editPetLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar Alterações
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
