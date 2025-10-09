import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Flower, Music, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const BemEstarSensorial: React.FC = () => {
  const terapias = [
    {
      icon: Palette,
      title: 'Cromoterapia',
      description: 'Utilizamos luzes coloridas para criar um ambiente calmo e acolhedor, ajudando a reduzir o estresse, equilibrar as emoções e proporcionar relaxamento durante o banho e cuidados.',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: Flower,
      title: 'Aromaterapia',
      description: 'Cuidamos do ambiente com essências naturais suaves, promovendo relaxamento, conforto e sensação de segurança, tornando cada experiência mais agradável para o pet.',
      color: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      icon: Music,
      title: 'Musicoterapia',
      description: 'Selecionamos músicas tranquilas e específicas para pets, contribuindo para acalmar, aliviar a ansiedade e tornar cada momento ainda mais positivo e harmonioso.',
      color: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/10 to-secondary-light/10">
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold mb-6 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao início
              </Link>
              
              <h1 className="text-5xl font-bold text-text-color-dark mb-6">
                Bem-estar Sensorial
              </h1>
              
              <p className="text-xl text-text-color max-w-3xl mx-auto leading-relaxed">
                Descubra como nossas terapias sensoriais proporcionam uma experiência única de cuidado e bem-estar para seu pet, criando um ambiente de tranquilidade e harmonia.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Terapias Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {terapias.map((terapia, index) => (
              <motion.div
                key={terapia.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
              >
                <div className={`${terapia.color} p-4 rounded-full w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <terapia.icon className={`w-12 h-12 ${terapia.iconColor}`} />
                </div>
                
                <h3 className="text-2xl font-bold text-text-color-dark mb-4">
                  {terapia.title}
                </h3>
                
                <p className="text-text-color leading-relaxed text-lg">
                  {terapia.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Conclusão Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-text-color-dark mb-6">
              Uma Experiência Única e Diferenciada
            </h2>
            
            <p className="text-xl text-text-color leading-relaxed mb-8">
              Essas terapias elevam o cuidado, oferecendo uma experiência única, sensorial e acolhedora, que diferencia a Romeu & Julieta pelo carinho com o bem-estar físico e emocional dos animais.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/agendamento"
                className="bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-dark transition-all duration-300 flex items-center justify-center gap-2"
              >
                Agendar Agora
              </Link>
              
              <Link
                to="/banho-tosa-spa"
                className="bg-secondary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-secondary-dark transition-all duration-300 flex items-center justify-center gap-2"
              >
                Ver Todos os Serviços
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BemEstarSensorial;