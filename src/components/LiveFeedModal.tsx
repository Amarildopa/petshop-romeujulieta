import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Maximize2, Volume2, VolumeX, RotateCcw, AlertCircle, Shield, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  lastUpdate: string;
}

interface LiveFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  petName?: string;
}

const cameras: Camera[] = [
  {
    id: 'bath-1',
    name: 'Área do Banho - Câmera 1',
    location: 'Sala de Banho Principal',
    status: 'online',
    lastUpdate: '2024-01-15 14:30:25'
  },
  {
    id: 'bath-2',
    name: 'Área do Banho - Câmera 2',
    location: 'Sala de Banho Secundária',
    status: 'online',
    lastUpdate: '2024-01-15 14:30:22'
  },
  {
    id: 'spa-1',
    name: 'Spa Relaxante',
    location: 'Área de Relaxamento',
    status: 'online',
    lastUpdate: '2024-01-15 14:30:18'
  },
  {
    id: 'waiting-1',
    name: 'Sala de Espera',
    location: 'Recepção',
    status: 'online',
    lastUpdate: '2024-01-15 14:30:15'
  }
];

const LiveFeedModal: React.FC<LiveFeedModalProps> = ({ isOpen, onClose, petName }) => {
  const { user } = useAuth();
  const [selectedCamera, setSelectedCamera] = useState<Camera>(cameras[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simular verificação de check-in
  useEffect(() => {
    if (isOpen && user) {
      const checkUserCheckin = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Para demonstração, vamos assumir que o usuário fez check-in
        setHasCheckedIn(true);
        setIsLoading(false);
      };
      
      checkUserCheckin();
    }
  }, [isOpen, user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'maintenance': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100';
      case 'offline': return 'bg-red-100';
      case 'maintenance': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${
            isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl max-h-[90vh]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">
                  {petName ? `Acompanhando ${petName} ao Vivo` : 'Câmeras ao Vivo'}
                </h2>
                <p className="text-sm opacity-90">Acompanhe seu pet em tempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-600">Verificando acesso às câmeras...</p>
              </div>
            </div>
          ) : !hasCheckedIn ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-6 max-w-md">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-10 h-10 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Acesso Restrito</h3>
                  <p className="text-gray-600 mb-4">
                    Para acessar as câmeras ao vivo, seu pet precisa estar no petshop. 
                    Faça o check-in na recepção para liberar o acesso.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Como funciona:</span>
                    </div>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Traga seu pet para o serviço agendado</li>
                      <li>• Faça o check-in na recepção</li>
                      <li>• Acesse as câmeras pelo dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-[600px]">
              {/* Camera List */}
              <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Câmeras Disponíveis</h3>
                </div>
                <div className="space-y-2 p-4">
                  {cameras.map((camera) => (
                    <button
                      key={camera.id}
                      onClick={() => setSelectedCamera(camera)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedCamera.id === camera.id
                          ? 'bg-primary text-white'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{camera.name}</span>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(camera.status).replace('text-', 'bg-')}`}></div>
                      </div>
                      <p className={`text-xs ${
                        selectedCamera.id === camera.id ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {camera.location}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        <span className={`text-xs ${
                          selectedCamera.id === camera.id ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          {camera.lastUpdate}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Feed */}
              <div className="flex-1 bg-black relative">
                <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                  <div className="text-center text-white space-y-4">
                    <Camera className="w-16 h-16 mx-auto opacity-50" />
                    <div>
                      <h4 className="text-lg font-semibold">{selectedCamera.name}</h4>
                      <p className="text-sm opacity-75">{selectedCamera.location}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-sm">Feed ao vivo será exibido aqui</p>
                      <p className="text-xs opacity-75 mt-1">Implementação da câmera em desenvolvimento</p>
                    </div>
                  </div>

                  {/* Live indicator */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    AO VIVO
                  </div>

                  {/* Status indicator */}
                  <div className={`absolute top-4 right-4 flex items-center gap-2 ${getStatusBg(selectedCamera.status)} px-3 py-1 rounded-full text-sm font-semibold`}>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedCamera.status).replace('text-', 'bg-')}`}></div>
                    <span className={getStatusColor(selectedCamera.status)}>
                      {selectedCamera.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Controls */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <button className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors">
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LiveFeedModal;
export { LiveFeedModal };
