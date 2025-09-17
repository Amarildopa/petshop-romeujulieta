import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Informações da Empresa */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-2xl font-bold font-serif text-primary mb-4">
              Romeu e Julieta Pet&Spa
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Há mais de 10 anos cuidando do seu pet com amor, carinho e profissionalismo. 
              Oferecemos serviços completos de banho, tosa, veterinária e hospedagem em um 
              ambiente seguro e acolhedor.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-dark p-2 rounded-full transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-dark p-2 rounded-full transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-dark p-2 rounded-full transition-colors duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-semibold font-serif mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-gray-300">
                  Rua das Flores, 123<br />
                  Centro - São Paulo, SP<br />
                  CEP: 01234-567
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-gray-300">(11) 9999-8888</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-gray-300">contato@romeujulietapet.com.br</span>
              </div>
            </div>
          </div>

          {/* Horário de Funcionamento */}
          <div>
            <h4 className="text-lg font-semibold font-serif mb-4">Funcionamento</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="text-gray-300">
                  <p className="font-medium">Segunda a Sexta</p>
                  <p className="text-sm">8h às 18h</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-8">
                <div className="text-gray-300">
                  <p className="font-medium">Sábados</p>
                  <p className="text-sm">8h às 16h</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-8">
                <div className="text-gray-300">
                  <p className="font-medium">Domingos</p>
                  <p className="text-sm">9h às 14h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linha divisória e copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Romeu e Julieta Pet&Spa. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/termos" className="text-gray-400 hover:text-primary text-sm transition-colors duration-300">
                Termos de Uso
              </a>
              <a href="/privacidade" className="text-gray-400 hover:text-primary text-sm transition-colors duration-300">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;