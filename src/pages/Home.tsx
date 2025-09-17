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
import AboutSection from '../components/AboutSection';
import LocationSection from '../components/LocationSection';
import Footer from '../components/Footer';
import { IMAGE_CONFIG } from '../config/images';
import { 
  ArrowRight,
  Dog,
  Heart,
  Scissors,
  ShoppingBag,
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
      {/* Hero Section - Verde muito claro */}
      <section className="relative min-h-screen bg-green-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl font-bold text-text-color-dark mb-6 font-serif"
              >
                Cuidado e Amor para seu <span className="text-primary">Pet</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-2xl text-text-color mb-8 max-w-3xl"
              >
                No {APP_CONFIG.name}, oferecemos serviços completos de cuidado pet com profissionais qualificados e muito amor.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  to="/booking"
                  className="bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-dark transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Agendar Serviço
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/services"
                  className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Ver Serviços
                </Link>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={IMAGE_CONFIG.home.hero}
                  alt="Cachorro feliz"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-color-dark">+1000</p>
                    <p className="text-sm text-text-color">Pets Felizes</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section - Verde muito claro */}
      <AboutSection />

      {/* Services Section - Amarelo muito claro */}
      <section className="py-20 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-color-dark font-serif">Nossos Serviços</h2>
            <p className="mt-4 text-lg text-text-color max-w-2xl mx-auto">
              Oferecemos uma gama completa de serviços para manter seu pet feliz e saudável
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
              >
                <div className="bg-primary-light p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-primary transition-colors duration-300">
                  <service.icon className="w-8 h-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-color-dark mb-2">{service.name}</h3>
                <p className="text-text-color">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Camera Section - Rosa muito claro */}
      <section className="bg-pink-50">
        <LiveCameraSection />
      </section>

      {/* VIP Packages Section - Amarelo muito claro */}
      <section className="bg-yellow-50">
        <VIPPackages />
      </section>

      {/* Weekly Content Section - Azul muito claro */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-color-dark font-serif">Dicas da Semana e Super Ofertas</h2>
            <p className="mt-4 text-lg text-text-color max-w-2xl mx-auto">
              Fique por dentro das melhores dicas de cuidado pet e aproveite nossas ofertas especiais
            </p>
          </div>
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

      {/* Weekly Baths Section - Rosa muito claro */}
      <section className="bg-pink-50">
        <WeeklyBaths />
      </section>

      {/* Weekly Poll Section - Amarelo muito claro */}
      <section className="bg-yellow-50">
        <WeeklyPoll />
      </section>

      {/* Location Section - Verde muito claro */}
      <LocationSection />

      {/* Testimonials Section - Azul muito claro */}
      <section className="bg-blue-50">
        <Testimonials />
      </section>

      {/* CTA Section - Rosa muito claro */}
      <section className="py-20 bg-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-text-color-dark mb-6 font-serif">
              Pronto para Cuidar do seu Pet?
            </h2>
            <p className="text-xl text-text-color mb-8 max-w-2xl mx-auto">
              Agende agora mesmo e proporcione o melhor cuidado para seu companheiro de quatro patas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/agendamento"
                className="bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-dark transition-all duration-300 flex items-center justify-center gap-2"
              >
                Agendar Agora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="bg-secondary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-secondary-dark transition-all duration-300 flex items-center justify-center gap-2"
              >
                Criar Conta
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
