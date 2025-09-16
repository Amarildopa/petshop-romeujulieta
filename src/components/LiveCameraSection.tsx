import React, { useState } from 'react';
import { Camera, Eye, Heart, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LiveCameraSection: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCameraAccess = () => {
    if (user) {
      setIsModalOpen(true);
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-surface to-surface-dark relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text-color-dark font-serif mb-6">
            Veja seu Pet no Banho
          </h2>
          <p className="text-xl text-text-color max-w-3xl mx-auto leading-relaxed">
            Acompanhe seu melhor amigo em tempo real através das nossas câmeras de segurança.
            Transparência total para sua tranquilidade.
          </p>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-color-dark">
                  Câmeras em Tempo Real
                </h3>
                <p className="text-text-color">
                  Monitore seu pet durante todo o processo de banho e tosa.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-color-dark">
                  Acesso Seguro
                </h3>
                <p className="text-text-color">
                  Apenas tutores com agendamento ativo podem acessar as câmeras.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-color-dark">
                  Tranquilidade Total
                </h3>
                <p className="text-text-color">
                  Veja que seu pet está sendo tratado com todo carinho.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleCameraAccess}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-dark hover:to-secondary-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Eye className="w-5 h-5" />
                {user ? 'Acessar Dashboard' : 'Fazer Login'}
                <ArrowRight className="w-4 h-4" />
              </button>
              
              {!user && (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary/5 transition-all duration-300"
                >
                  Criar Conta Grátis
                </Link>
              )}
            </div>

            {/* Security Info */}
            <div className="flex justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Acesso seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span>Apenas durante o serviço</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveCameraSection;