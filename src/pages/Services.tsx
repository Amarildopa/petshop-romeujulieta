import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Shield, 
  Star, 
  Clock,
  Heart,
  Stethoscope,
  Scissors,
  Home,
  GraduationCap,
  Truck,
  Award
} from 'lucide-react';

export const Services: React.FC = () => {
  const mainServices = [
    {
      icon: Scissors,
      title: 'Banho & Tosa',
      subtitle: 'Cuidado completo e estética',
      description: 'Banho com produtos premium, tosa higiênica e estética personalizada para cada raça.',
      features: ['Produtos hipoalergênicos', 'Tosa profissional', 'Perfume especial', 'Acompanhamento em tempo real'],
      price: 'A partir de R$ 45',
      duration: '2-3 horas',
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop',
      color: 'bg-secondary'
    },
    {
      icon: Stethoscope,
      title: 'Check-up Veterinário',
      subtitle: 'Saúde em primeiro lugar',
      description: 'Consulta completa com veterinário especializado, exames e orientações preventivas.',
      features: ['Exame físico completo', 'Orientação nutricional', 'Cartão de vacinação', 'Relatório detalhado'],
      price: 'A partir de R$ 120',
      duration: '45 minutos',
      image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&h=300&fit=crop',
      color: 'bg-status-info'
    },
    {
      icon: Home,
      title: 'Daycare/Hotelzinho',
      subtitle: 'Diversão e cuidado o dia todo',
      description: 'Ambiente seguro e divertido para seu pet passar o dia ou ficar durante viagens.',
      features: ['Monitoramento 24h', 'Atividades recreativas', 'Alimentação incluída', 'Câmeras ao vivo'],
      price: 'A partir de R$ 80/dia',
      duration: 'Flexível',
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
      color: 'bg-accent-dark'
    },
    {
      icon: GraduationCap,
      title: 'Adestramento',
      subtitle: 'Educação e comportamento',
      description: 'Sessões de adestramento com profissionais certificados para melhorar o comportamento.',
      features: ['Métodos positivos', 'Treinador certificado', 'Plano personalizado', 'Acompanhamento domiciliar'],
      price: 'A partir de R$ 200',
      duration: '1 hora',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
      color: 'bg-primary-dark'
    }
  ];

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
            {mainServices.map((service, index) => (
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
                      src={service.image}
                      alt={service.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:col-span-3 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`${service.color} p-3 rounded-lg`}>
                        <service.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-text-color-dark">
                          {service.title}
                        </h3>
                        <p className="text-text-color text-sm">
                          {service.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-text-color mb-4">
                      {service.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-sm text-text-color">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary-dark">
                          {service.price}
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
                <service.icon className="h-10 w-10 text-primary mb-4" />
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
