import React from 'react';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '../constants/app';
import { IMAGE_CONFIG } from '../config/images';
import { Heart, Sparkles } from 'lucide-react';

const AboutSection: React.FC = () => {
  return (
    <section className="py-20 bg-blue-50">
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
          <h2 className="text-4xl font-bold text-text-color-dark font-serif">Sobre Nós - A Experiência {APP_CONFIG.shortName}</h2>
          <p className="mt-4 text-lg text-text-color">
            Nossa missão é criar um ambiente seguro, confortável e feliz para seu pet. Somos uma família dedicada ao bem-estar animal, oferecendo serviços de alta qualidade com muito amor e carinho.
          </p>
          <div className="mt-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary-light p-3 rounded-full">
                <Heart className="h-6 w-6 text-primary-dark" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Profissionais Apaixonados</h3>
                <p className="text-text-color">Nossa equipe é treinada e ama o que faz, garantindo um tratamento carinhoso e paciente para cada pet.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-secondary-light p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-secondary-dark" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Ambiente Impecável</h3>
                <p className="text-text-color">Higiene e segurança são nossa prioridade. Nossas instalações são sempre limpas e desinfetadas para o conforto do seu pet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;