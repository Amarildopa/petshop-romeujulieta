import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Shield, 
  Star, 
  Clock,
  Heart,
  Stethoscope,
  Truck,
  Award
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { servicesService, type Service } from '../services/servicesService';
import { getImageUrl } from '../config/images';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load services data
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const servicesData = await servicesService.getServices();
        setServices(servicesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);


  const additionalServices = [
    {
      icon: Truck,
      title: 'Delivery de Produtos',
      description: 'Receba ração e produtos premium em casa'
    },
    {
      icon: Camera,
      title: 'Ensaio Fotográfico',
      description: 'Fotos profissionais do seu pet'
    },
    {
      icon: Heart,
      title: 'Spa Relaxante',
      description: 'Tratamentos especiais de relaxamento'
    },
    {
      icon: Award,
      title: 'Concursos de Beleza',
      description: 'Preparação para competições'
    }
  ];

  const benefits = [
    {
      icon: Camera,
      title: 'Acompanhamento Visual',
      description: 'Receba fotos e vídeos durante todos os serviços'
    },
    {
      icon: Shield,
      title: 'Segurança Garantida',
      description: 'Protocolos rigorosos de higiene e segurança'
    },
    {
      icon: Clock,
      title: 'Horários Flexíveis',
      description: 'Agendamento que se adapta à sua rotina'
    },
    {
      icon: Star,
      title: 'Qualidade Premium',
      description: 'Produtos e serviços de alta qualidade'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Carregando serviços..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
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
    <div className="min-h-screen bg-surface">
      <div className="text-center pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-color-dark">
            Serviços Premium para seu Pet
          </h1>
          <p className="text-xl text-text-color max-w-3xl mx-auto mt-4">
            Cuidado especializado, produtos de qualidade e acompanhamento em tempo real. Tudo que seu melhor amigo merece.
          </p>
        </motion.div>
      </div>

      <section className="py-16 bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-text-color-dark mb-4">
              Nossos Serviços Principais
            </h2>
            <p className="text-text-color text-lg max-w-2xl mx-auto">
              Serviços completos e personalizados para garantir a saúde, bem-estar e felicidade do seu pet.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="grid md:grid-cols-5">
                  <div className="md:col-span-2">
                    <img
                      src={getImageUrl.serviceImage(service.image_url)}
                      alt={service.name}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:col-span-3 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-primary p-3 rounded-lg">
                        <Stethoscope className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-text-color-dark">
                          {service.name}
                        </h3>
                        <p className="text-text-color text-sm">
                          {service.category}
                        </p>
                      </div>
                    </div>

                    <p className="text-text-color mb-4">
                      {service.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span className="text-sm text-text-color">Duração: {service.duration || '60 min'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span className="text-sm text-text-color">Avaliação: 4.8/5</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span className="text-sm text-text-color">Categoria: {service.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary-dark">
                          R$ {service.price}
                        </span>
                        <p className="text-sm text-text-color">
                          Duração: {service.duration}
                        </p>
                      </div>
                      <Link to="/booking" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                        Agendar
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-text-color-dark mb-4">
              Por que escolher nossos serviços?
            </h2>
            <p className="text-text-color text-lg">
              Diferenciais que fazem toda a diferença no cuidado com seu pet
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-surface-dark rounded-xl"
              >
                <div className="bg-primary-light/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-text-color-dark mb-2">
                  {benefit.title}
                </h3>
                <p className="text-text-color text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-text-color-dark mb-4">
              Serviços Adicionais
            </h2>
            <p className="text-text-color text-lg">
              Extras especiais para tornar a experiência ainda melhor
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <Truck className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-text-color-dark mb-2">
                  {service.title}
                </h3>
                <p className="text-text-color text-sm">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
