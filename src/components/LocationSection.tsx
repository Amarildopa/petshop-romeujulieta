import React from 'react';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '../constants/app';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';

const LocationSection: React.FC = () => {
  return (
    <section className="py-20 bg-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-text-color-dark font-serif">Onde Estamos</h2>
          <p className="mt-4 text-lg text-text-color max-w-2xl mx-auto">
            Venha nos visitar! Estamos localizados em um ambiente acolhedor e de fácil acesso para você e seu pet.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Informações de Contato */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-primary-light p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-primary-dark" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-color-dark">Endereço</h3>
                  <p className="text-text-color mt-1">
                    Rua das Flores, 123<br />
                    Centro - São Paulo, SP<br />
                    CEP: 01234-567
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-secondary-light p-3 rounded-full">
                  <Clock className="h-6 w-6 text-secondary-dark" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-color-dark">Horário de Funcionamento</h3>
                  <div className="text-text-color mt-1 space-y-1">
                    <p>Segunda a Sexta: 8h às 18h</p>
                    <p>Sábado: 8h às 16h</p>
                    <p>Domingo: 9h às 14h</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-accent-light p-2 rounded-full">
                    <Phone className="h-5 w-5 text-accent-dark" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-color-dark">Telefone</h4>
                    <p className="text-text-color">(11) 9999-9999</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-accent-light p-2 rounded-full">
                    <Mail className="h-5 w-5 text-accent-dark" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-color-dark">E-mail</h4>
                    <p className="text-text-color">contato@{APP_CONFIG.shortName.toLowerCase()}.com</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mapa */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">Mapa Interativo</p>
                <p className="text-sm text-gray-400 mt-1">
                  Clique para abrir no Google Maps
                </p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <a
                href="https://maps.google.com/?q=Rua+das+Flores+123+Centro+São+Paulo+SP"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all duration-300"
              >
                <MapPin className="w-4 h-4" />
                Ver no Google Maps
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;