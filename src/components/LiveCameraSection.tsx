import React, { useState } from 'react';
import { Camera, Play, Eye, Heart, Shield, ArrowRight } from 'lucide-react';
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

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-color-dark mb-2">
                    Câmeras em Tempo Real
                  </h3>
                  <p className="text-text-color">
                    Monitore seu pet durante todo o processo de banho e tosa com nossas câmeras HD.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-color-dark mb-2">
                    Acesso Seguro
                  </h3>
                  <p className="text-text-color">
                    Apenas tutores com agendamento ativo podem acessar as câmeras do seu pet.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-color-dark mb-2">
                    Tranquilidade Total
                  </h3>
                  <p className="text-text-color">
                    Veja que seu pet está sendo tratado com todo carinho e profissionalismo.
                  </p>
                </div>
              </div>
            </div>

            {/* Camera locations */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-2">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Área do Banho</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Spa Relaxante</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Sala de Espera</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleCameraAccess}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-dark hover:to-secondary-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Eye className="w-5 h-5" />
                {user ? 'Ver Câmeras Agora' : 'Fazer Login para Ver Câmeras'}
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

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-primary" />
                <span>Acesso seguro</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-primary" />
                <span>Apenas durante o serviço</span>
              </div>
            </div>
          </div>

          {/* Right side - TV/Monitor with video */}
          <div className="relative">
            {/* TV Frame */}
            <div className="relative bg-gray-900 rounded-3xl p-6 shadow-2xl">
              {/* TV Screen */}
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
                {/* Static video placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    {/* Simulated video content */}
                    <div className="relative w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
                      {/* Play button overlay */}
                      <div className="relative z-10 bg-white/20 backdrop-blur-sm rounded-full p-6 border border-white/30">
                        <Play className="w-12 h-12 text-white fill-white" />
                      </div>
                      
                      {/* Live indicator */}
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        AO VIVO
                      </div>
                      
                      {/* Camera info */}
                      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs">
                        📹 Área do Banho - Câmera 1
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Screen reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
              </div>
              
              {/* TV Stand */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-gray-800 rounded-b-lg"></div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-gray-700 rounded-full"></div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 bg-gradient-to-r from-primary to-secondary text-white p-3 rounded-full shadow-lg">
              <Camera className="w-6 h-6" />
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-secondary to-accent text-white p-3 rounded-full shadow-lg">
              <Heart className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveCameraSection;