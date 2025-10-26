import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { settingsService } from '../services/settingsService';
// import Testimonials from '../components/Testimonials';
import WeeklyBaths from '../components/WeeklyBaths';

// import WeeklyTip from '../components/WeeklyTip';
// import SpecialOffers from '../components/SpecialOffers';
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
  Heart,
  Palette,
  Award,
} from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import InstagramIcon from '../components/icons/InstagramIcon';

const Home: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('5511999999999'); // Valor padrão
  const [videoError, setVideoError] = useState(false);
  
  // Novos estados para otimização de vídeo
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [videoLoadAttempted, setVideoLoadAttempted] = useState(false);

  // Detectar se é dispositivo mobile com detecção mais robusta e específica para iOS e Android
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as Window & { opera?: string }).opera;
      
      // Detecção mais precisa de dispositivos móveis
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(userAgent.toLowerCase());
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
      const isAndroidDevice = /Android/.test(userAgent);
      const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Verificar conexão de rede se disponível
      const connection = (navigator as Navigator & { 
        connection?: { effectiveType?: string; type?: string; downlink?: number }; 
        mozConnection?: { effectiveType?: string; type?: string; downlink?: number }; 
        webkitConnection?: { effectiveType?: string; type?: string; downlink?: number }; 
      }).connection || (navigator as Navigator & { 
        mozConnection?: { effectiveType?: string; type?: string; downlink?: number }; 
      }).mozConnection || (navigator as Navigator & { 
        webkitConnection?: { effectiveType?: string; type?: string; downlink?: number }; 
      }).webkitConnection;
      let networkType = 'unknown';
      let isSlowConnection = false;
      
      if (connection) {
        networkType = connection.effectiveType || connection.type || 'unknown';
        // Considerar conexões 2g e slow-2g como lentas
        isSlowConnection = ['slow-2g', '2g'].includes(networkType) || 
                          (connection.downlink && connection.downlink < 1.5);
        setConnectionType(networkType);
      }
      
      // Verificar se o dispositivo suporta autoplay de vídeo
      const supportsAutoplay = !isMobileDevice && !isIOSDevice && !isAndroidDevice;
      
      // Lógica específica para iOS e Android - ser mais restritivo para ambos
      const shouldAvoidVideo = isIOSDevice || isAndroidDevice || isSlowConnection || 
                              (isMobileDevice && isSmallScreen) ||
                              (connection && connection.saveData); // Respeitar data saver
      
      // Considerar como mobile se for dispositivo móvel, tela pequena ou não suportar autoplay
      const shouldUseMobile = isMobileDevice || isIOSDevice || isAndroidDevice || isTablet || 
                             isSmallScreen || isTouchDevice || !supportsAutoplay || shouldAvoidVideo;
      
      console.log('📱 Detecção avançada de dispositivo:', {
        userAgent: userAgent.substring(0, 50) + '...',
        isMobileDevice,
        isIOSDevice,
        isAndroidDevice,
        isTablet,
        isSmallScreen,
        isTouchDevice,
        supportsAutoplay,
        shouldUseMobile,
        networkType,
        isSlowConnection,
        shouldAvoidVideo,
        dataSaver: connection?.saveData || false
      });
      
      setIsIOS(isIOSDevice);
      setIsAndroid(isAndroidDevice);
      
      // Para desktop com boa conexão, carregar vídeo automaticamente
      if (!shouldUseMobile && !isSlowConnection && !shouldAvoidVideo) {
        setShouldLoadVideo(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Função para carregar vídeo sob demanda
  const handleLoadVideo = async () => {
    if (videoLoadAttempted) return;
    
    setVideoLoading(true);
    setVideoLoadAttempted(true);
    
    console.log('🎥 Iniciando carregamento do vídeo sob demanda...');
    
    try {
      // Simular verificação de tamanho do arquivo (em produção, isso viria do servidor)
      const videoSizeKB = 2369; // 2.4MB
      const isLargeVideo = videoSizeKB > 2000; // Considerar vídeos > 2MB como grandes
      
      // Verificar tanto iOS quanto Android para vídeos grandes
      if ((isIOS || isAndroid) && isLargeVideo) {
        const deviceType = isIOS ? 'iOS' : 'Android';
        console.log(`⚠️ Vídeo grande detectado no ${deviceType}, perguntando ao usuário...`);
        
        const userConfirm = window.confirm(
          `Este vídeo tem ${(videoSizeKB / 1024).toFixed(1)}MB. Deseja carregá-lo? Pode consumir dados móveis.`
        );
        
        if (!userConfirm) {
          console.log(`❌ Usuário cancelou carregamento do vídeo no ${deviceType}`);
          setVideoLoading(false);
          return;
        }
        
        console.log(`✅ Usuário confirmou carregamento do vídeo no ${deviceType}`);
      }
      
      // Aguardar um pouco para simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShouldLoadVideo(true);
      console.log('✅ Vídeo autorizado para carregamento');
      
    } catch (error) {
      console.error('❌ Erro ao tentar carregar vídeo:', error);
      setVideoError(true);
    } finally {
      setVideoLoading(false);
    }
  };

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
      name: 'Estética e Spa',
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
      description: 'Tudo o que você escolher chega rapidinho até você e seu pet – em até 5km. Clique no botão Whatsapp ou em nossa loja, escolha seus produtos e entregamos para voce.',
    },
  ];



  return (
    <div className="text-landing-primary" style={{
      backgroundColor: 'var(--simple-landing-bg)'
    }}>
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background - Lógica condicional otimizada para mobile, iOS e Android */}
        <div className="absolute inset-0 w-full h-full">
          {shouldLoadVideo && !videoError ? (
            // Vídeo otimizado com configurações específicas para iOS e Android
            <video
              autoPlay
              muted
              loop
              playsInline // Crucial para iOS e Android
              webkit-playsinline="true" // Compatibilidade com versões antigas do iOS
              preload={(isIOS || isAndroid) ? "none" : "metadata"} // Mobile: não precarregar, desktop: só metadados
              className="w-full h-full object-cover transition-opacity duration-500"
              poster={IMAGE_CONFIG.home.hero}
              onError={(e) => {
                console.error('❌ Erro no vídeo:', e);
                const deviceInfo = isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop';
                console.log(`📱 Detalhes do erro no ${deviceInfo}:`, {
                  isIOS,
                  isAndroid,
                  connectionType,
                  userAgent: navigator.userAgent.substring(0, 100)
                });
                setVideoError(true);
                setShouldLoadVideo(false);
              }}
              onLoadStart={() => {
                const deviceInfo = isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop';
                console.log(`🎬 Iniciando carregamento do vídeo no ${deviceInfo}...`);
              }}
              onLoadedData={() => {
                const deviceInfo = isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop';
                console.log(`🎥 Vídeo carregado com sucesso no ${deviceInfo}`);
                setVideoLoading(false);
              }}
              onCanPlay={() => {
                const deviceInfo = isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop';
                console.log(`🎬 Vídeo pronto para reproduzir no ${deviceInfo}`);
              }}
              onPlay={() => {
                const deviceInfo = isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop';
                console.log(`▶️ Vídeo começou a reproduzir no ${deviceInfo}`);
              }}
              onStalled={() => {
                const deviceInfo = isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop';
                console.log(`⏸️ Vídeo travou no ${deviceInfo} - possível problema de conexão`);
              }}
              style={{
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            >
              <source src="/videos/hero-video.mp4" type="video/mp4" />
              {/* Fallback para navegadores que não suportam vídeo */}
              <img
                src={IMAGE_CONFIG.home.hero}
                alt="Cachorro feliz"
                className="w-full h-full object-cover"
              />
            </video>
          ) : (
            // Imagem otimizada para mobile, iOS e fallback
            <div className="relative w-full h-full">
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-500"
                style={{
                  backgroundImage: `url(${IMAGE_CONFIG.home.hero})`,
                  backgroundAttachment: 'scroll', // Melhor performance no mobile
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center'
                }}
                role="img"
                aria-label="Cachorro feliz - Pet Shop Romeo e Julieta"
              />
              
              {/* Botão para carregar vídeo (apenas se não for erro e não estiver carregando) */}
              {!videoError && !shouldLoadVideo && !videoLoadAttempted && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 text-center">
                    <button
                      onClick={handleLoadVideo}
                      disabled={videoLoading}
                      className="px-6 py-3 bg-white/90 hover:bg-white text-gray-800 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 mx-auto"
                    >
                      {videoLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          Carregando...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Carregar Vídeo
                        </>
                      )}
                    </button>
                    {(isIOS || isAndroid) && (
                      <p className="text-white/80 text-sm mt-2">
                        Vídeo de fundo disponível (2.4MB)
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Mensagem de erro se o vídeo falhou */}
              {videoError && (
                <div className="absolute top-4 left-4 bg-red-500/80 text-white px-3 py-1 rounded text-sm">
                  Vídeo indisponível - usando imagem
                </div>
              )}
            </div>
          )}
          {/* Overlay escuro para melhor legibilidade */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg"
              >
                Cuidado e Amor para seu <span className="text-pink-300">Pet</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-2xl mb-8 max-w-3xl text-white/90 drop-shadow-md"
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
                  className="px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl backdrop-blur-sm bg-pink-500/90 hover:bg-pink-600/90 text-white border border-white/20"
                >
                  Agende seu Horário
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=Olá! Gostaria de saber mais sobre os serviços do Romeu & Julieta Pet&Spa`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl backdrop-blur-sm bg-green-500/90 hover:bg-green-600/90 text-white border border-white/20"
                >
                  WhatsApp
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/romeuejulieta_petspa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl backdrop-blur-sm bg-pink-500/90 hover:bg-pink-600/90 text-white border border-white/20"
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
              className="relative lg:flex justify-center items-center hidden"
            >
              {/* Elemento decorativo para desktop - pode ser removido se necessário */}
              <div className="relative">
                <div className="w-96 h-96 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-pink-300" />
                    <p className="text-lg font-semibold">Amor & Cuidado</p>
                    <p className="text-sm opacity-80">Para seu melhor amigo</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location Section - Verde muito claro */}
      <LocationSection />

      {/* About Section - Verde muito claro */}
      <AboutSection />

      {/* Services Section */}
      <section id="services" className="py-20" style={{
        backgroundColor: 'var(--simple-landing-bg)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold" style={{ color: 'var(--landing-title-color)' }}>Nossos Serviços</h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: 'var(--landing-subtitle-color)' }}>
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
                  className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                  style={{ backgroundColor: 'var(--landing-card-bg)' }}
                >
                  <div 
                    className="flex items-center justify-center w-16 h-16 rounded-lg mb-4 mx-auto"
                    style={{ backgroundColor: 'var(--surface-light)' }}
                  >
                    <service.icon className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--landing-title-color)' }}>{service.name}</h3>
                  <p style={{ color: 'var(--landing-subtitle-color)' }}>{service.description}</p>
                {service.name === 'Estética e Spa' && (
                  <Link
                    to="/banho-tosa-spa"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 mt-4"
                    style={{
                      color: 'white',
                      backgroundColor: '#e05389'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c44576'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e05389'}
                  >
                    Saiba Mais
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nossos Diferenciais Section */}
      <section id="diferenciais" className="py-20" style={{
        backgroundColor: 'var(--simple-landing-bg)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold" style={{ color: 'var(--landing-title-color)' }}>Nossos Diferenciais</h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: 'var(--landing-subtitle-color)' }}>
              Descubra o que faz da Romeu & Julieta Pet&Spa um espaço exclusivo, onde cuidado, carinho e transparência transformam cada momento do seu pet em uma experiência única e especial.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">


            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
              style={{
                backgroundColor: 'var(--landing-card-bg)'
              }}
            >
              <div className="p-4 rounded-full w-16 h-16 mx-auto mb-4 transition-colors duration-300" style={{ backgroundColor: 'var(--surface-light)' }}>
                <Heart className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--landing-title-color)' }}>Atendimento humanizado e acolhedor</h3>
              <p className="mb-6" style={{ color: 'var(--landing-subtitle-color)' }}>
                Nossa equipe dedica tempo, carinho e respeito para atender cada pet do jeitinho que ele merece, com cuidado individual e atenção às características de cada raça e personalidade.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
              style={{
                backgroundColor: 'var(--landing-card-bg)'
              }}
            >
              <div className="p-4 rounded-full w-16 h-16 mx-auto mb-4 transition-colors duration-300" style={{ backgroundColor: 'var(--surface-light)' }}>
                <Palette className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--landing-title-color)' }}>Bem-estar Sensorial</h3>
              <p className="mb-6" style={{ color: 'var(--landing-subtitle-color)' }}>
                Cromoterapia, aromaterapia e musicoterapia: carinho sensorial e bem-estar em cada detalhe para o seu pet.
              </p>
              <div className="text-center">
                <Link
                  to="/bem-estar-sensorial"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    color: 'white',
                    backgroundColor: '#e05389'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c44576'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e05389'}
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo(0, 0);
                    }, 100);
                  }}
                >
                  Saiba mais
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
              style={{
                backgroundColor: 'var(--landing-card-bg)'
              }}
            >
              <div className="p-4 rounded-full w-16 h-16 mx-auto mb-4 transition-colors duration-300" style={{ backgroundColor: 'var(--surface-light)' }}>
                <Award className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--landing-title-color)' }}>Produtos Premium</h3>
              <p className="mb-6" style={{ color: 'var(--landing-subtitle-color)' }}>
                Utilizamos apenas shampoos e condicionadores de alta qualidade, incluindo opções hipoalergênicas para pets sensíveis, garantindo resultados visíveis e duradouros.
              </p>
            </motion.div>


          </div>
        </div>
      </section>

      {/* Live Camera Section */}
      <section style={{
        backgroundColor: 'var(--simple-landing-bg)'
      }}>
        <LiveCameraSection />
      </section>

      {/* VIP Packages Section */}
        <section style={{
          backgroundColor: 'var(--simple-landing-bg)'
        }}>
          <VIPPackages />
        </section>

      {/* Weekly Content Section - DESABILITADA */}
      {/* 
      <section className="py-20" style={{
        backgroundColor: 'var(--simple-landing-bg)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold" style={{ color: 'var(--landing-title-color)' }}>Dicas da Semana e Super Ofertas</h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: 'var(--landing-subtitle-color)' }}>
              Fique por dentro das melhores dicas de cuidado pet e aproveite nossas ofertas especiais
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <WeeklyTip />
            </div>
            
            <div>
              <SpecialOffers />
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Weekly Baths Section */}
        <section style={{
          backgroundColor: 'var(--simple-landing-bg)'
        }}>
          <WeeklyBaths />
        </section>

      {/* Testimonials Section - DESABILITADA */}
      {/* 
        <section style={{
          backgroundColor: 'var(--simple-landing-bg)'
        }}>
          <Testimonials />
        </section>
      */}

      {/* CTA Section */}
      <section className="py-20" style={{
        backgroundColor: 'var(--simple-landing-bg)'
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--landing-title-color)' }}>
              Pronto para Cuidar do seu Pet?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--landing-subtitle-color)' }}>
              Agende agora mesmo e proporcione o melhor cuidado para seu companheiro de quatro patas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/agendamento"
                className="px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                style={{
                  color: 'white',
                  backgroundColor: '#e05389'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c44576'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e05389'}
              >
                Agendar Agora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                style={{
                  color: 'white',
                  backgroundColor: '#e05389'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c44576'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e05389'}
              >
                Criar Conta
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Instagram Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <a
          href="https://www.instagram.com/romeuejulieta_petspa/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center group overflow-hidden hover:rounded-full hover:px-6"
          aria-label="Seguir no Instagram"
          style={{ backgroundColor: '#E4405F' }}
        >
          <InstagramIcon size={24} className="flex-shrink-0" />
          <span className="max-w-0 group-hover:max-w-xs group-hover:ml-3 overflow-hidden transition-all duration-300 whitespace-nowrap text-sm font-medium">
            Seguir no Instagram
          </span>
        </a>
      </div>

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
