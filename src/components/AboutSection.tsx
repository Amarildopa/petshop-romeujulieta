import React from 'react';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '../constants/app';
import { IMAGE_CONFIG } from '../config/images';

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl font-bold text-text-color-dark">A Experiência {APP_CONFIG.shortName}</h2>
          <p className="mt-4 text-lg text-text-color">
            Somos uma família apaixonada por animais, que acredita em cuidado com carinho, respeito e transparência. No Romeu e Julieta Pet&Spa, acolhemos cada tutor e seu(s) Pet(s) como parte da nossa família, compartilhando experiências, novas descobertas e muita confiança.
          </p>
          <p className="mt-4 text-lg text-text-color">
            Nossa missão é criar um espaço seguro, aberto e acolhedor, onde você sempre sabe como seu pet está sendo tratado: com amor, atenção e qualidade – como se fosse nosso também.
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
