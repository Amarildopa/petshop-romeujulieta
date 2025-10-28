import React from 'react';
import { motion } from 'framer-motion';
import { IMAGE_CONFIG } from '../config/images';

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl font-bold text-text-color-dark">Mais do que um banho e tosa — uma experiência completa de cuidado e carinho.</h2>
          <p className="mt-4 text-lg text-text-color">
            Aqui, cada detalhe foi pensado para transformar o momento do seu pet em um verdadeiro ritual de bem-estar.
          </p>
          <p className="mt-4 text-lg text-text-color">
            💎 Produtos de marcas premium<br />
            🧴 Profissionais treinados em estética e comportamento animal<br />
            🛁 Estrutura moderna, confortável e 100% transparente<br />
            📱 E o grande diferencial: acompanhe o banho e a tosa ao vivo, pelo aplicativo, de onde estiver!
          </p>
        </div>
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
      </div>
    </section>
  );
};

export default AboutSection;
