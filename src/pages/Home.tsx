import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { settingsService } from '../services/settingsService';
import Testimonials from '../components/Testimonials';
import WeeklyBaths from '../components/WeeklyBaths';

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
  Scissors,
  ShoppingBag,
  Home as HomeIcon,
  Car,
} from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import InstagramIcon from '../components/icons/InstagramIcon';

const Home: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('5511999999999'); // Valor padrão

  // Buscar número do WhatsApp do banco de dados
  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        console.log('🔍 Carregando número do WhatsApp...');
        const number = await settingsService.getWhatsAppNumber();
        console.log('📱 Número carregado:', number);
        setWhatsappNumber(number);
      } catch (error) {
        console.error('❌ Erro ao carregar número do WhatsApp:', error);
        // Mantém o valor padrão em caso de erro
      }
    };

    fetchWhatsAppNumber();
  }, []);

  const services = [
    {
      icon: Scissors,
      name: 'Banho, Tosa & Spa',
      description: 'Nossa equipe é treinada para acolher, entender e respeitar a personalidade única do seu amigo – porque cada pet merece um cuidado só dele! Aromaterapia e Cromoterapia fazem parte de todos os serviços do Spa Romeu e Julieta. Seja bem vindo!',
    },
    {
      icon: HomeIcon,
      name: 'Nossa Loja',
      description: 'Somos apaixonados por detalhes! Aqui você encontra acessórios, caminhas, roupinhas, mimos lindos, petiscos naturais e brinquedos para todos os estilos de pet. Tudo escolhido com carinho para encantar, trazer conforto e valorizar cada momento ao lado do seu melhor amigo. Porque aqui, cada produto é tão especial quanto o seu pet! Venha nos visitar e traga seu Pet para conhecer nosso espaço e comer um biscoitinho.',
    },
    {
      icon: ShoppingBag,
      name: 'E-commerce',
      description: 'Mesmo à distância, você pode aproveitar tudo que preparamos para o seu pet: compre online, de onde estiver, com facilidade e tranquilidade. (acesso ao e-commerce)',
    },
    {
      icon: Car,
      name: 'Delivery',
      description: 'Tudo o que você escolher chega rapidinho até você e seu pet – em até 5km. Clique no botão Whatsapp e agende seu serviço.',
    },
  ];



  return (
    <div className="bg-surface text-text-color">
      {/* Hero Section - Amarelo muito claro */}
      <section id="hero" className="relative min-h-screen bg-yellow-50 flex items-center justify-center overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-3xl md:text-5xl font-bold text-text-color-dark mb-6"
              >
                Cuidado e Amor para seu <span className="text-primary">Pet</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-2xl text-text-color mb-8 max-w-3xl"
              >
                No Romeu & Julieta Pet&Spa, temos atenção e amor de verdade, carinho em cada detalhe e total transparência em tudo o que fazemos. Seu pet seguro, você tranquilo e todo mundo feliz! Seja muito bem vindo. Traga seu pet para comer um biscotinho com a gente!
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  to="/booking"
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  Agende seu Horário
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=Olá! Gostaria de saber mais sobre os serviços do Romeu & Julieta Pet&Spa`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  WhatsApp
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/romeuejulieta_petspa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  Instagram
                  <InstagramIcon className="w-4 h-4" />
                </a>
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location Section - Verde muito claro */}
      <LocationSection />

      {/* About Section - Verde muito claro */}
      <AboutSection />

      {/* Services Section - Amarelo muito claro */}
      <section id="services" className="py-20 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-color-dark">Nossos Serviços</h2>
            <p className="mt-4 text-lg text-text-color max-w-2xl mx-auto">
              Aqui, seu pet encontra tudo para ser feliz e saudável
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
                <p className="text-text-color mb-4">{service.description}</p>
                {service.name === 'Banho, Tosa & Spa' && (
                  <Link
                    to="/banho-tosa-spa"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors duration-200"
                  >
                    Saiba mais
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nossos Diferenciais Section - Amarelo muito claro */}
      <section id="diferenciais" className="py-20 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-color-dark">Nossos Diferenciais</h2>
            <p className="mt-4 text-lg text-text-color max-w-2xl mx-auto">
              Conheça o que torna a Romeu e Julieta única e especial para o cuidado do seu pet.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-text-color-dark mb-4 text-center">Sistema LOWSTRESS</h3>
              <p className="text-text-color mb-6">
                Somos o único pet shop em Itapema com sistema que elimina o uso de gaiolas. Seu pet fica em áreas de espera individuais e confortáveis, reduzindo o estresse durante o banho e tosa.
              </p>
              <div className="text-center">
                <Link
                  to="/banho-tosa-spa"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors duration-200"
                >
                  SAIBA MAIS CLICANDO AQUI
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-text-color-dark mb-4 text-center">Atendimento Humanizado</h3>
              <p className="text-text-color mb-6">
                Nossa equipe é treinada para lidar com pets de forma gentil e respeitosa, com atenção individualizada para cada animal, reconhecendo as necessidades específicas de cada raça e temperamento.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-text-color-dark mb-4 text-center">Cromoterapia</h3>
              <p className="text-text-color mb-6">
                Exclusividade na região! Utilizamos cromoterapia durante o banho e nas salas de espera, proporcionando benefícios terapêuticos através das cores e criando um ambiente mais relaxante para seu pet.
              </p>
              <div className="text-center">
                <Link
                  to="/banho-tosa-spa"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors duration-200"
                >
                  SAIBA MAIS CLICANDO AQUI
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-text-color-dark mb-4 text-center">Produtos Premium</h3>
              <p className="text-text-color mb-6">
                Utilizamos apenas shampoos e condicionadores de alta qualidade, incluindo opções hipoalergênicas para pets sensíveis, garantindo resultados visíveis e duradouros.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-text-color-dark mb-4 text-center">Ozonioterapia</h3>
              <p className="text-text-color mb-6">
                Tecnologia avançada que elimina bactérias, fungos e parasitas durante o banho, proporcionando benefícios para a saúde da pele e pelo do seu animal, com resultados superiores em limpeza e brilho.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Camera Section - Amarelo muito claro */}
      <section className="bg-yellow-50">
        <LiveCameraSection />
      </section>

      {/* VIP Packages Section - Amarelo muito claro */}
      <section className="bg-yellow-50">
        <VIPPackages />
      </section>

      {/* Weekly Content Section - Amarelo muito claro */}
      <section className="py-20 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-color-dark">Dicas da Semana e Super Ofertas</h2>
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

      {/* Weekly Baths Section - Amarelo muito claro */}
      <section className="bg-yellow-50">
        <WeeklyBaths />
      </section>

      {/* Testimonials Section - Amarelo muito claro */}
      <section className="bg-yellow-50">
        <Testimonials />
      </section>

      {/* CTA Section - Amarelo muito claro */}
      <section className="py-20 bg-yellow-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-text-color-dark mb-6">
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

      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center group overflow-hidden hover:rounded-full hover:px-6"
          aria-label="Falar no WhatsApp"
        >
          <WhatsAppIcon size={24} className="flex-shrink-0" />
          <span className="max-w-0 group-hover:max-w-xs group-hover:ml-3 overflow-hidden transition-all duration-300 whitespace-nowrap text-sm font-medium">
            Falar no WhatsApp
          </span>
        </a>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
