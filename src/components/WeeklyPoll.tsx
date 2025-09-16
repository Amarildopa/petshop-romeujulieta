import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Trophy,
  Calendar,
  Users,
  Star,
  Crown,
  Award,
  Vote,
  CheckCircle
} from 'lucide-react';

interface PollPet {
  id: string;
  pet_name: string;
  image_url: string;
  owner_name: string;
  votes: number;
  bath_date: string;
}

interface WeeklyWinner {
  id: string;
  pet_name: string;
  image_url: string;
  owner_name: string;
  total_votes: number;
  week_start: string;
  week_end: string;
}

const WeeklyPoll: React.FC = () => {
  const [currentPets, setCurrentPets] = useState<PollPet[]>([]);
  const [lastWinner, setLastWinner] = useState<WeeklyWinner | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  // Mock data para demonstração - usando useMemo para evitar recriação
  const mockCurrentPets = useMemo<PollPet[]>(() => [
    {
      id: '1',
      pet_name: 'Luna',
      image_url: '/images/pets/luna.jpg',
      owner_name: 'Maria Silva',
      votes: 45,
      bath_date: '2024-01-15'
    },
    {
      id: '2',
      pet_name: 'Thor',
      image_url: '/images/pets/thor.jpg',
      owner_name: 'João Santos',
      votes: 38,
      bath_date: '2024-01-16'
    },
    {
      id: '3',
      pet_name: 'Bella',
      image_url: '/images/pets/bella.jpg',
      owner_name: 'Ana Costa',
      votes: 52,
      bath_date: '2024-01-17'
    },
    {
      id: '4',
      pet_name: 'Max',
      image_url: '/images/pets/max.jpg',
      owner_name: 'Carlos Lima',
      votes: 29,
      bath_date: '2024-01-18'
    }
  ], []);

  const mockLastWinner = useMemo<WeeklyWinner>(() => ({
    id: 'winner-1',
    pet_name: 'Mel',
    image_url: '/images/pets/mel.jpg',
    owner_name: 'Fernanda Oliveira',
    total_votes: 87,
    week_start: '2024-01-08',
    week_end: '2024-01-14'
  }), []);

  const loadPollData = useCallback(async () => {
    setLoading(true);
    try {
      // Simula carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentPets(mockCurrentPets);
      setLastWinner(mockLastWinner);
    } catch (error) {
      console.error('Erro ao carregar dados da enquete:', error);
    } finally {
      setLoading(false);
    }
  }, [mockCurrentPets, mockLastWinner]);

  useEffect(() => {
    loadPollData();
  }, [loadPollData]);

  const handleVote = async (petId: string) => {
    if (userVotes.has(petId) || voting) return;

    setVoting(petId);
    try {
      // Simula votação
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentPets(prev => 
        prev.map(pet => 
          pet.id === petId 
            ? { ...pet, votes: pet.votes + 1 }
            : pet
        )
      );
      
      setUserVotes(prev => new Set([...prev, petId]));
    } catch (error) {
      console.error('Erro ao votar:', error);
    } finally {
      setVoting(null);
    }
  };



  const getWeekRange = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      end: sunday.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    };
  };

  const sortedPets = [...currentPets].sort((a, b) => b.votes - a.votes);
  const weekRange = getWeekRange();

  if (loading) {
    return (
      <section className="py-16 bg-accent-light/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-color-dark font-serif">
              Pet Mais Fofinho da Semana
            </h2>
            <p className="mt-4 text-lg text-text-color">
              Carregando enquete...
            </p>
          </div>
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full"></div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-accent-light/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-primary-dark mr-3" />
              <h2 className="text-3xl font-bold text-text-color-dark font-serif">
                Pet Mais Fofinho da Semana
              </h2>
            </div>
            <p className="mt-4 text-lg text-text-color">
              Vote no seu favorito e concorra a brindes especiais!
            </p>
            <div className="flex items-center justify-center mt-2 text-sm text-text-color/70">
              <Calendar className="h-4 w-4 mr-1" />
              Enquete da semana: {weekRange.start} - {weekRange.end}
            </div>
          </motion.div>
        </div>

        {/* Último Vencedor - Destaque Horizontal */}
        {lastWinner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-accent-light rounded-2xl p-6 border-2 border-accent mb-8 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <Crown className="h-6 w-6 text-yellow-500" />
            </div>
            
            <div className="flex items-center justify-center space-x-6">
              <div className="relative">
                <img
                  src={lastWinner.image_url}
                  alt={`${lastWinner.pet_name} - Vencedor`}
                  className="w-20 h-20 rounded-full object-cover border-4 border-yellow-300 shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/hero-petshop.jpg';
                  }}
                />
                <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full p-1">
                  <Star className="h-3 w-3 fill-current" />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-bold text-yellow-800 mb-1 flex items-center justify-center">
                  <Award className="h-5 w-5 mr-2" />
                  Vencedor da Semana Passada
                </h3>
                <h4 className="text-xl font-bold text-yellow-800">{lastWinner.pet_name}</h4>
                <p className="text-yellow-700 text-sm">Tutor: {lastWinner.owner_name}</p>
                <p className="text-yellow-600 text-xs mt-1">
                  {lastWinner.total_votes} votos • 🎁 Ganhou kit de brindes!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enquete Atual - Lista Compacta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-text-color-dark mb-2 flex items-center justify-center">
              <Vote className="h-5 w-5 mr-2 text-primary-dark" />
              Vote no seu favorito!
            </h3>
            <p className="text-text-color text-sm mb-2">
              Clique no coração para votar
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-text-color/70">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Encerra domingo 23:59h
              </span>
              <span>🏆 Vencedor ganha brindes!</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedPets.map((pet, index) => {
              const hasVoted = userVotes.has(pet.id);
              const isVoting = voting === pet.id;
              const isLeading = index === 0 && pet.votes > 0;
              
              return (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-surface rounded-xl p-4 border-2 transition-all duration-300 text-center ${
                    isLeading 
                      ? 'border-primary bg-primary-light/20' 
                      : hasVoted 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  {isLeading && (
                    <div className="absolute -top-2 -right-2 bg-primary-dark text-white rounded-full p-1">
                      <Crown className="h-3 w-3" />
                    </div>
                  )}
                  
                  <div className="relative mb-3">
                    <img
                      src={pet.image_url}
                      alt={pet.pet_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 mx-auto"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/hero-petshop.jpg';
                      }}
                    />
                    {hasVoted && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  
                  <h4 className="font-bold text-text-color-dark text-sm mb-1">{pet.pet_name}</h4>
                  <p className="text-text-color text-xs mb-2">{pet.owner_name}</p>
                  
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center text-primary-dark font-bold text-sm">
                      <Users className="h-3 w-3 mr-1" />
                      {pet.votes}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleVote(pet.id)}
                    disabled={hasVoted || isVoting}
                    className={`w-full p-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                      hasVoted
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : isVoting
                        ? 'bg-accent/50 text-white cursor-wait'
                        : 'bg-primary/20 text-primary-dark hover:bg-primary hover:text-white'
                    }`}
                  >
                    {isVoting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="flex items-center justify-center"
                      >
                        <Heart className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Heart className={`h-4 w-4 mr-1 ${hasVoted ? 'fill-current' : ''}`} />
                        {hasVoted ? 'Votado!' : 'Votar'}
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WeeklyPoll;