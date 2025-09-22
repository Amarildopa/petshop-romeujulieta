import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, PawPrint, Star, ArrowLeft, Cake, Award } from 'lucide-react';
import { IMAGE_CONFIG } from '../config/images';
import { getPlaceholderImageByCategory } from '../utils/placeholderImages';

// Mock data for pets, assuming we don't fetch it
const pets = [
  {
    id: 'luna',
    name: 'Luna',
    image: IMAGE_CONFIG.growthJourney.pet1,
  },
  {
    id: 'thor',
    name: 'Thor',
    image: IMAGE_CONFIG.growthJourney.pet2,
  }
];

const generateJourneyEvents = () => {
    return [
        {
            date: '2023-03-10',
            title: 'Primeiro dia em casa!',
            description: 'Luna chegou e encheu nossa casa de alegria. Pequenina e curiosa!',
            icon: PawPrint,
            image: getPlaceholderImageByCategory({ category: 'puppy', width: 400, height: 300 }),
        },
        {
            date: '2023-05-20',
            title: 'Primeira Visita ao Vet',
            description: 'Check-up completo e primeira vacina. Foi muito corajosa!',
            icon: Star,
            image: getPlaceholderImageByCategory({ category: 'veterinarian', width: 400, height: 300 }),
        },
        {
            date: '2024-01-15',
            title: 'Primeiro Aniversário',
            description: 'Festa com bolo especial para cachorros e muitos presentes.',
            icon: Cake,
            image: getPlaceholderImageByCategory({ category: 'dog birthday', width: 400, height: 300 }),
        },
        {
            date: '2024-07-22',
            title: 'Primeiro Banho & Tosa',
            description: 'Ficou ainda mais linda e cheirosa depois do dia no spa.',
            icon: Camera,
            image: getPlaceholderImageByCategory({ category: 'dog bath', width: 400, height: 300 }),
        },
        {
            date: '2025-01-05',
            title: 'Campeã do Concurso de Agilidade',
            description: 'Mostrou todo o seu talento e ganhou o primeiro lugar!',
            icon: Award,
            image: getPlaceholderImageByCategory({ category: 'dog agility', width: 400, height: 300 }),
        },
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const GrowthJourney: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const pet = pets.find(p => p.id === petId);
  const journeyEvents = generateJourneyEvents();

  if (!pet) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-text-color-dark">Pet não encontrado</h1>
        <Link to="/dashboard" className="text-primary mt-4 inline-block">Voltar ao Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-dark pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/dashboard" className="flex items-center text-primary hover:text-primary-dark mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <img src={pet.image} alt={pet.name} className="w-24 h-24 rounded-full object-cover border-4 border-primary-light shadow-lg" />
            <div>
              <h1 className="text-4xl font-bold text-text-color-dark text-center sm:text-left">
                Jornada de Crescimento de {pet.name}
              </h1>
              <p className="text-text-color mt-2 text-center sm:text-left">
                Um álbum de memórias com os momentos mais especiais.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 sm:left-1/2 w-0.5 h-full bg-accent -translate-x-1/2"></div>

          {journeyEvents.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative mb-12"
            >
              {/* Dot */}
              <div className="absolute left-4 sm:left-1/2 top-4 w-4 h-4 bg-primary rounded-full -translate-x-1/2 border-4 border-surface-dark z-10"></div>
              
              <div className="sm:grid sm:grid-cols-2 sm:gap-x-8">
                {/* Left side (text) */}
                <div className="sm:text-right pl-12 sm:pl-0">
                  <div className="p-6 bg-white rounded-2xl shadow-md border border-accent/20">
                      <div className="flex items-center sm:justify-end mb-4">
                          <div className="flex items-center space-x-3 sm:flex-row-reverse sm:space-x-reverse">
                              <div className="bg-secondary-light p-2 rounded-full">
                                  <event.icon className="h-5 w-5 text-secondary-dark" />
                              </div>
                              <span className="font-semibold text-text-color-dark">
                                  {new Date(event.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                          </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-text-color-dark mb-2">{event.title}</h3>
                      <p className="text-text-color">{event.description}</p>
                      
                      {/* Image for mobile view */}
                      {event.image && (
                          <img src={event.image} alt={event.title} className="rounded-lg w-full h-48 object-cover mt-4 sm:hidden" />
                      )}
                  </div>
                </div>

                {/* Right side (image for desktop) */}
                <div className="hidden sm:block">
                  {event.image && (
                    <img src={event.image} alt={event.title} className="rounded-2xl w-full h-auto object-cover shadow-md" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GrowthJourney;
