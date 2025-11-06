import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera,
  Heart,
  Star,
  Bell,
  Plus,
  ArrowRight,
  Award,
  Activity,
  Video,
  BookOpen,
  Expand
} from 'lucide-react';
import { LiveFeedModal } from '../components/LiveFeedModal';
// ServiceProgressBar não é usado neste componente
// import { ServiceProgressBar } from '../components/ServiceProgressBar';
import { PetSelectorInline } from '../components/PetSelector';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { petsService, type Pet as ServicePet } from '../services/petsService';
import { appointmentsService, type Appointment } from '../services/appointmentsService';
import { userSubscriptionsService } from '../services/userSubscriptionsService';
import { getImageUrl } from '../config/images';
import { generatePlaceholderImages } from '../utils/placeholderImages';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Pet as IntegrationPet } from '../types/integration';

const Dashboard: React.FC = () => {
  const [isLiveFeedOpen, setIsLiveFeedOpen] = useState(false);
  const [serviceProgress, setServiceProgress] = useState(0);
  const [checkedInPet, setCheckedInPet] = useState<string | null>(null);
  const [pets, setPets] = useState<ServicePet[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const { user, loading: authLoading } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  // Mapeia pets do serviço para o tipo usado no seletor
  const integrationPets: IntegrationPet[] = useMemo(() => {
    return pets.map(p => ({
      id: p.id,
      name: p.name,
      breed: p.breed,
      avatar_url: p.avatar_url || null,
      owner_name: '',
      owner_email: undefined
    }));
  }, [pets]);

  // Pet selecionado como objeto para o seletor inline
  const selectedPetObj: IntegrationPet | null = useMemo(() => {
    return integrationPets.find(p => p.id === selectedPetId) || null;
  }, [integrationPets, selectedPetId]);

  // Check authentication and redirect if needed
  useEffect(() => {
    console.log('Dashboard - authLoading:', authLoading);
    console.log('Dashboard - user:', user);
    
    if (!authLoading && !user) {
      console.log('Dashboard - No user found, redirecting to login');
      navigate('/login');
    } else if (user) {
      console.log('Dashboard - User found, loading dashboard');
    }
  }, [user, authLoading, navigate]);

  // Load data on component mount
  const loadData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('🔍 Dashboard - Carregando dados para usuário:', user.id);
      const [petsData, appointmentsData, activeSubscription] = await Promise.all([
        petsService.getPets(),
        appointmentsService.getUpcomingAppointments(),
        userSubscriptionsService.getActiveSubscription(user.id)
      ]);
      
      console.log('🐕 Dashboard - Pets carregados:', petsData);
      console.log('📊 Dashboard - Total de pets:', petsData.length);
      console.info('🔍 Dashboard - IDs dos pets:', JSON.stringify(petsData.map(p => ({ id: p.id, name: p.name })), null, 2));
      setPets(petsData);
      setUpcomingAppointments(appointmentsData);
      setHasActiveSubscription(!!activeSubscription);
      
      // Set default selected pet to first pet
      if (petsData.length > 0 && !selectedPetId) {
        setSelectedPetId(petsData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      // Em caso de erro na verificação de assinatura, assumir que não tem
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  }, [user, selectedPetId]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // Simula o check-in e o progresso do serviço
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checked_in')) {
      setCheckedInPet('Luna');
      setServiceProgress(1); // Inicia o progresso
    }
  }, []);

  useEffect(() => {
    if (serviceProgress > 0 && serviceProgress < 6) {
      const timer = setInterval(() => {
        setServiceProgress(prev => (prev < 6 ? prev + 1 : prev));
      }, 5000); // Avança a cada 5 segundos
      return () => clearInterval(timer);
    }
  }, [serviceProgress]);


  // quickActions é utilizado abaixo na renderização das ações rápidas.
  // const quickActions = [
  //   {
  //     icon: Calendar,
  //     title: 'Agendar Serviço',
  //     description: 'Banho, tosa, veterinário...',
  //     color: 'bg-status-info',
  //     link: '/booking'
  //   },
  //   {
  //     icon: ShoppingBag,
  //     title: 'Loja Premium',
  //     description: 'Produtos naturais e acessórios',
  //     color: 'bg-accent-dark',
  //     link: '/store'
  //   }
  // ];


  const growthJourneyPhotos = generatePlaceholderImages('animals', 4);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-yellow-50 pt-8 pb-12 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Verificando autenticação..." />
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 pt-8 pb-12 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Carregando dados..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-dark pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-color-dark">
                Seu Dashboard 👋
              </h1>
              <p className="text-text-color mt-1">
                Acompanhe tudo sobre seus pets em um só lugar
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button 
                className="relative p-2 text-text-color hover:text-primary transition-colors"
                title="Notificações"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-status-danger rounded-full"></span>
              </button>
              <Link
                to="/profile"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white transition-colors"
              >
                <img
                  src={getImageUrl.userAvatar(profile?.avatar_url, 'medium')}
                  alt="Perfil"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Subscription Banner for users without active subscription */}
        {hasActiveSubscription === false && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white rounded-xl p-4 shadow-sm border border-primary/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-color-dark">Assine o Clube Premium</h3>
                <p className="text-text-color">Acompanhe a jornada com exclusividade e benefícios</p>
              </div>
              <Link to="/subscription" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">Assinar</Link>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Live Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-accent/20 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-color-dark">
                  <Video className="h-6 w-6 mr-3 text-primary" />
                  Acompanhe seu Pet
                </h2>
              </div>
              <div 
                onClick={() => checkedInPet && setIsLiveFeedOpen(true)}
                className={`aspect-video bg-black rounded-lg flex items-center justify-center text-white relative group ${checkedInPet ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {checkedInPet ? (
                  <>
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <Camera className="h-10 w-10 text-gray-500" />
                    </div>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                      <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        <Expand className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 flex items-center space-x-2 bg-black/50 px-2 py-1 rounded-md">
                      <div className="w-2.5 h-2.5 rounded-full bg-status-danger animate-pulse"></div>
                      <span className="text-xs font-medium">LIVE</span>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md">
                      <span className="text-xs font-medium">{checkedInPet}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Camera className="h-8 w-8 text-gray-500 mx-auto" />
                    <p className="mt-2 text-sm text-gray-400">Nenhum pet em serviço no momento.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Growth Journey */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-accent rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-accent/20 p-6"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-text-color-dark flex items-center">
                    <BookOpen className="h-6 w-6 mr-3 text-primary-dark" />
                    Jornada de Crescimento
                  </h2>
                  {integrationPets.length >= 1 && (
                    <div className="w-64">
                      <PetSelectorInline
                        pets={integrationPets}
                        selectedPet={selectedPetObj}
                        onSelectPet={(pet) => {
                          console.log('Dashboard - Pet selecionado:', pet?.id, pet?.name);
                          setSelectedPetId(pet?.id || '');
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text-color-dark">
                      Álbum de Memórias dos seus Pets
                    </h3>
                    <p className="text-text-color mt-2 mb-4">
                      {pets.length > 0 
                        ? 'Reviva os melhores momentos, desde o primeiro dia até hoje.'
                        : 'Adicione um pet para começar a documentar sua jornada de crescimento.'
                      }
                    </p>
                  </div>
                  <div className="relative h-24 w-32 flex-shrink-0">
                    {growthJourneyPhotos.slice(0, 3).map((photo, index) => (
                      <div
                        key={index}
                        className={`absolute w-20 h-20 rounded-lg border-2 border-white shadow-lg overflow-hidden ${
                          index === 0 ? 'rotate-[-10deg] translate-x-0 translate-y-0' :
                          index === 1 ? 'rotate-[0deg] translate-x-[15px] translate-y-[5px]' :
                          'rotate-[10deg] translate-x-[30px] translate-y-[10px]'
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`Memória ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {pets.length > 0 ? (
                <Link
                  to={`/journey/${selectedPetId || pets[0].id}`}
                  className="inline-flex items-center justify-center bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-shadow shadow-md mt-4"
                >
                  Ver Jornada Completa <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <Link
                  to="/pet-profile"
                  className="inline-flex items-center justify-center bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-shadow shadow-md mt-4"
                >
                  Adicionar Pet
                </Link>
              )}
            </motion.div>

            {/* Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-accent/20 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-color-dark">Próximos Agendamentos</h2>
                <Link to="/booking" className="text-primary hover:text-primary-dark text-sm font-medium">Ver mais</Link>
              </div>
              {upcomingAppointments.length === 0 ? (
                <p className="text-text-color">Nenhum agendamento encontrado</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 3).map((appt) => (
                    <div key={appt.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="text-text-color-dark font-medium">{appt.service?.name || 'Serviço'}</p>
                        <p className="text-sm text-text-color">{appt.pet?.name} • {appt.appointment_date} {appt.appointment_time}</p>
                      </div>
                      <span className="text-sm text-text-color">{appt.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar - My Pets, Subscription, etc. */}
          <div className="space-y-6">
            {/* My Pets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-accent/20 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-color-dark">Meus Pets</h2>
                <Link to="/pet-profile" className="flex items-center text-primary hover:text-primary-dark text-sm font-medium">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Link>
              </div>
              <div className="space-y-4">
                {pets.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-text-color mb-4">Nenhum pet cadastrado</p>
                    <Link
                      to="/pet-profile"
                      className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Adicionar Pet
                    </Link>
                  </div>
                ) : (
                  pets.map((pet) => (
                    <div key={pet.id} className="bg-white rounded-xl p-4 shadow-sm border border-accent/20">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getImageUrl.petImage(pet.avatar_url, 'small')}
                          alt={pet.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-color-dark">{pet.name}</h3>
                          <p className="text-sm text-text-color">{pet.breed} • {pet.age}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {pet.species} • {pet.gender}
                          </p>
                        </div>
                        <Heart className="h-5 w-5 text-status-danger fill-current" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Subscription Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-accent/20 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-color-dark">Plano Premium</h2>
                {hasActiveSubscription ? (
                  <span className="text-green-600">Ativo</span>
                ) : (
                  <span className="text-red-600">Inativo</span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-color">Descontos exclusivos</span>
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-color">Conteúdos especiais</span>
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-color">Relatórios de saúde</span>
                  <Activity className="h-5 w-5 text-primary" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <LiveFeedModal 
        isOpen={isLiveFeedOpen} 
        onClose={() => setIsLiveFeedOpen(false)} 
        petName={checkedInPet || 'seu pet'}
      />
    </div>
  );
};

export default Dashboard;
