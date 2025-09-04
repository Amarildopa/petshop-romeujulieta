import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { faker } from '@faker-js/faker';
import { 
  Calendar,
  Camera,
  Heart,
  ShoppingBag,
  Clock,
  Star,
  Bell,
  Plus,
  ArrowRight,
  Award,
  Activity,
  Video,
  BookOpen,
  Sparkles,
  Expand
} from 'lucide-react';
import { LiveFeedModal } from '../components/LiveFeedModal';
import { ServiceProgressBar } from '../components/ServiceProgressBar';

export const Dashboard: React.FC = () => {
  const [isLiveFeedOpen, setIsLiveFeedOpen] = useState(false);
  const [serviceProgress, setServiceProgress] = useState(0);
  const [checkedInPet, setCheckedInPet] = useState<string | null>(null);

  const upcomingAppointments = [
    {
      id: 1,
      service: 'Banho & Tosa',
      pet: 'Luna',
      date: '2025-01-15',
      time: '14:30',
      status: 'confirmado',
      isToday: true
    },
    {
      id: 2,
      service: 'Check-up Veterinário',
      pet: 'Thor',
      date: '2025-01-18',
      time: '10:00',
      status: 'pendente',
      isToday: false
    }
  ];

  const pets = [
    {
      id: 1,
      name: 'Luna',
      breed: 'Golden Retriever',
      age: '2 anos',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop&crop=face',
      lastService: 'Banho & Tosa',
      lastServiceDate: '2025-01-10',
      inService: true,
    },
    {
      id: 2,
      name: 'Thor',
      breed: 'Bulldog Francês',
      age: '3 anos',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop&crop=face',
      lastService: 'Check-up',
      lastServiceDate: '2025-01-08',
      inService: false,
    }
  ];

  const petInService = pets.find(p => p.inService);

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


  const quickActions = [
    {
      icon: Calendar,
      title: 'Agendar Serviço',
      description: 'Banho, tosa, veterinário...',
      color: 'bg-status-info',
      link: '/booking'
    },
    {
      icon: ShoppingBag,
      title: 'Loja Premium',
      description: 'Produtos naturais e acessórios',
      color: 'bg-accent-dark',
      link: '/store'
    }
  ];

  const growthJourneyPhotos = Array.from({ length: 4 }, () => faker.image.urlLoremFlickr({ category: 'animals', width: 128, height: 128 }));

  return (
    <div className="min-h-screen bg-surface-dark pt-8 pb-12">
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
              <button className="relative p-2 text-text-color hover:text-primary transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-status-danger rounded-full"></span>
              </button>
              <Link
                to="/profile"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white transition-colors"
              >
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b169a1b5?w=40&h=40&fit=crop&crop=face"
                  alt="Perfil"
                  className="w-8 h-8 rounded-full"
                />
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {checkedInPet && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-accent/20 p-6"
              >
                <h2 className="text-xl font-semibold text-text-color-dark mb-4">
                  Jornada do dia de {checkedInPet}
                </h2>
                <ServiceProgressBar currentStep={serviceProgress} />
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Live Camera Feed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-accent/20 p-6"
              >
                <h2 className="text-xl font-semibold text-text-color-dark flex items-center mb-4">
                  <Video className="h-6 w-6 mr-3 text-primary" />
                  Acompanhe seu Pet
                </h2>
                
                <div 
                  onClick={() => petInService && setIsLiveFeedOpen(true)}
                  className={`aspect-video bg-black rounded-lg flex items-center justify-center text-white relative group ${petInService ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {petInService ? (
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
                        <span className="text-xs font-medium">{petInService.name}</span>
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
                className="bg-gradient-to-br from-accent to-accent-light rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-accent/20 p-6 h-full flex flex-col"
              >
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-text-color-dark flex items-center">
                      <BookOpen className="h-6 w-6 mr-3 text-primary-dark" />
                      Jornada de Crescimento
                    </h2>
                    <span className="flex items-center text-xs font-bold text-status-warning bg-status-warning-light px-3 py-1 rounded-full">
                      <Sparkles className="h-4 w-4 mr-1" />
                      VIP
                    </span>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-text-color-dark">Álbum de Memórias da Luna</h3>
                      <p className="text-text-color mt-2 mb-4">
                        Reviva os melhores momentos, desde o primeiro dia até hoje.
                      </p>
                    </div>
                    <div className="relative h-24 w-32 flex-shrink-0">
                      {growthJourneyPhotos.slice(0, 3).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Memória ${index + 1}`}
                          className="absolute w-20 h-20 object-cover rounded-lg border-2 border-white shadow-lg"
                          style={{
                            transform: `rotate(${index * 10 - 10}deg) translate(${index * 15}px, ${index * 5}px)`,
                            zIndex: index,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Link
                  to="/journey/luna"
                  className="inline-flex items-center justify-center bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-shadow shadow-md mt-4"
                >
                  Ver Jornada Completa <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </motion.div>
            </div>
            
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-text-color-dark mb-4">
                Ações Rápidas
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-accent/20"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`${action.color} p-3 rounded-lg`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-color-dark mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-text-color">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-color-dark">
                  Próximos Agendamentos
                </h2>
                <Link
                  to="/booking"
                  className="text-primary hover:text-primary-dark font-medium text-sm"
                >
                  Ver todos
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-xl p-6 shadow-sm border border-accent/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary-light/50 p-3 rounded-lg">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-color-dark">
                            {appointment.service}
                          </h3>
                          <p className="text-sm text-text-color">
                            {appointment.pet} • {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                          </p>
                        </div>
                      </div>
                      {appointment.isToday ? (
                        <Link
                          to={`/check-in/${appointment.id}`}
                          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                        >
                          Fazer Check-in
                        </Link>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmado'
                            ? 'bg-status-success-light text-status-success'
                            : 'bg-status-warning-light text-status-warning'
                        }`}>
                          {appointment.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* My Pets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-color-dark">
                  Meus Pets
                </h2>
                <Link
                  to="/pet-profile"
                  className="flex items-center text-primary hover:text-primary-dark text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Link>
              </div>
              <div className="space-y-4">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-accent/20"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-color-dark">{pet.name}</h3>
                        <p className="text-sm text-text-color">{pet.breed} • {pet.age}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Último: {pet.lastService} ({new Date(pet.lastServiceDate).toLocaleDateString('pt-BR')})
                        </p>
                      </div>
                      <Heart className="h-5 w-5 text-status-danger fill-current" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Subscription Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Plano Premium</h3>
                <Award className="h-6 w-6" />
              </div>
              <p className="text-sm text-primary-light mb-4">
                Aproveite todos os benefícios do seu plano mensal
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Serviços restantes:</span>
                  <span className="font-semibold">3 de 5</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashback acumulado:</span>
                  <span className="font-semibold">R$ 45,20</span>
                </div>
              </div>
              <Link
                to="/subscription"
                className="block w-full bg-white text-primary text-center py-2 rounded-lg font-medium mt-4 hover:bg-gray-50 transition-colors"
              >
                Gerenciar Plano
              </Link>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-accent/20"
            >
              <h3 className="font-semibold text-text-color-dark mb-4">Estatísticas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-status-info" />
                    <span className="text-sm text-text-color">Serviços este mês</span>
                  </div>
                  <span className="font-semibold text-text-color-dark">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-status-warning" />
                    <span className="text-sm text-text-color">Avaliação Média</span>
                  </div>
                  <span className="font-semibold text-text-color-dark">4.9</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-status-success" />
                    <span className="text-sm text-text-color">Tempo médio</span>
                  </div>
                  <span className="font-semibold text-text-color-dark">1h 30min</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <LiveFeedModal 
        isOpen={isLiveFeedOpen} 
        onClose={() => setIsLiveFeedOpen(false)} 
        petName={petInService?.name || 'seu pet'}
      />
    </div>
  );
};
