import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '../constants/app';
import Testimonials from '../components/Testimonials';
import WeeklyBaths from '../components/WeeklyBaths';
import WeeklyPoll from '../components/WeeklyPoll';
import WeeklyTip from '../components/WeeklyTip';
import SpecialOffers from '../components/SpecialOffers';
import VIPPackages from '../components/VIPPackages';
import LiveCameraSection from '../components/LiveCameraSection';
import { IMAGE_CONFIG } from '../config/images';
import { 
  ArrowRight,
  Dog,
  Heart,
  Scissors,
  ShoppingBag,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

const Home: React.FC = () => {
  const services = [
    {
      icon: Scissors,
      name: 'Banho & Tosa',
      description: 'Estética e higiene com produtos premium.',
    },
    {
      icon: Stethoscope,
      name: 'Consultas Vet',
      description: 'Cuidado preventivo e especializado.',
    },
    {
      icon: Dog,
      name: 'Daycare',
      description: 'Diversão e socialização com segurança.',
    },
    {
      icon: ShoppingBag,
      name: 'Loja Premium',
      description: 'Rações, petiscos e acessórios.',
    },
  ];



  return (
    <div className="bg-surface text-text-color">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-secondary-light opacity-50"></div>
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-primary-light/50 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-accent-light/50 rounded-full filter blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-text-color-dark font-serif">
              Carinho e Confiança para o seu Pet
            </h1>
            <p className="mt-6 text-lg text-text-color max-w-xl mx-auto md:mx-0">
              No {APP_CONFIG.name}, oferecemos uma experiência premium com serviços de alta qualidade, acompanhamento em tempo real e um ambiente pensado para o bem-estar do seu melhor amigo.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/booking"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Agendar Serviço
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary-dark px-8 py-4 rounded-xl font-semibold hover:bg-primary/5 transition-all duration-300"
              >
                Nossos Serviços
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <img 
              src={IMAGE_CONFIG.home.hero} 
              alt="Cachorro feliz"
              className="rounded-3xl shadow-2xl w-full h-auto object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Live Camera Section */}
      <LiveCameraSection />

      {/* Weekly Baths Section */}
      <WeeklyBaths />

      {/* Weekly Poll Section */}
      <WeeklyPoll />

      {/* Weekly Content Section - Tip and Offers */}
      <section className="py-16 bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Weekly Tip */}
            <div>
              <WeeklyTip />
            </div>
            
            {/* Special Offers */}
            <div>
              <SpecialOffers />
            </div>
          </div>
        </div>
      </section>

      {/* VIP Packages Section */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <VIPPackages />
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-color-dark font-serif">Nossos Serviços</h2>
            <p className="mt-4 text-lg text-text-color max-w-2xl mx-auto">
              Tudo o que seu pet precisa em um só lugar, com a qualidade e o carinho que ele merece.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-surface p-8 rounded-2xl shadow-lg text-center hover:-translate-y-2 transition-transform"
              >
                <div className="inline-block bg-secondary-light p-4 rounded-full mb-4">
                  <service.icon className="h-8 w-8 text-secondary-dark" />
                </div>
                <h3 className="text-xl font-semibold text-text-color-dark">{service.name}</h3>
                <p className="mt-2 text-text-color">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <img 
              src={IMAGE_CONFIG.home.about}
              alt="Veterinária cuidando de um cachorro"
              className="rounded-3xl shadow-2xl"
            />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold text-text-color-dark font-serif">A Experiência {APP_CONFIG.shortName}</h2>
            <p className="mt-4 text-lg text-text-color">
              Nossa missão é criar um ambiente seguro, confortável e feliz. Veja por que tutores e pets nos amam.
            </p>
            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary-light p-3 rounded-full">
                  <Heart className="h-6 w-6 text-primary-dark" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Profissionais Apaixonados</h3>
                  <p className="text-text-color">Nossa equipe é treinada e ama o que faz, garantindo um tratamento carinhoso e paciente.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-secondary-light p-3 rounded-full">
                  <Sparkles className="h-6 w-6 text-secondary-dark" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Ambiente Impecável</h3>
                  <p className="text-text-color">Higiene e segurança são nossa prioridade. Nossas instalações são sempre limpas e desinfetadas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 bg-accent-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-text-color-dark font-serif">Pronto para dar ao seu pet o cuidado que ele merece?</h2>
          <p className="mt-4 text-lg text-text-color max-w-2xl mx-auto">
            Junte-se à {APP_CONFIG.texts.family} e descubra um novo padrão de cuidado e carinho para seu melhor amigo.
          </p>
          <div className="mt-8">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Crie sua Conta Agora
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
