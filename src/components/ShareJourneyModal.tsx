import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Globe, Lock, Calendar, User } from 'lucide-react';
import { useSharing } from '../hooks/useSharing';
import { ShareJourneyData } from '../services/sharingService';

interface ShareJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
}

const ShareJourneyModal: React.FC<ShareJourneyModalProps> = ({
  isOpen,
  onClose,
  petId,
  petName
}) => {
  const { createShareLink, copyShareUrl, loading } = useSharing();
  const [shareData, setShareData] = useState<ShareJourneyData>({
    pet_id: petId,
    is_public: true,
    expires_at: '',
    shared_with: ''
  });
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [step, setStep] = useState<'configure' | 'success'>('configure');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...shareData,
      expires_at: shareData.expires_at || undefined,
      shared_with: shareData.shared_with || undefined
    };

    const result = await createShareLink(dataToSubmit);
    if (result) {
      setShareToken(result.share_token);
      setStep('success');
    }
  };

  const handleCopyLink = async () => {
    if (shareToken) {
      await copyShareUrl(shareToken);
    }
  };

  const handleClose = () => {
    setStep('configure');
    setShareToken(null);
    setShareData({
      pet_id: petId,
      is_public: true,
      expires_at: '',
      shared_with: ''
    });
    onClose();
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Share2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Compartilhar Jornada
                  </h2>
                  <p className="text-sm text-gray-500">
                    Jornada de {petName}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {step === 'configure' && (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Compartilhamento
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="shareType"
                        checked={shareData.is_public}
                        onChange={() => setShareData(prev => ({ ...prev, is_public: true, shared_with: '' }))}
                        className="text-blue-600"
                      />
                      <Globe className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">Público</div>
                        <div className="text-sm text-gray-500">Qualquer pessoa com o link pode ver</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="shareType"
                        checked={!shareData.is_public}
                        onChange={() => setShareData(prev => ({ ...prev, is_public: false }))}
                        className="text-blue-600"
                      />
                      <Lock className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-medium text-gray-900">Privado</div>
                        <div className="text-sm text-gray-500">Apenas pessoas específicas podem ver</div>
                      </div>
                    </label>
                  </div>
                </div>

                {!shareData.is_public && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Email da pessoa (opcional)
                    </label>
                    <input
                      type="email"
                      value={shareData.shared_with}
                      onChange={(e) => setShareData(prev => ({ ...prev, shared_with: e.target.value }))}
                      placeholder="email@exemplo.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Data de Expiração (opcional)
                  </label>
                  <input
                    type="date"
                    value={shareData.expires_at}
                    onChange={(e) => setShareData(prev => ({ ...prev, expires_at: e.target.value }))}
                    min={getMinDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe em branco para nunca expirar
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Criando...' : 'Criar Link'}
                  </button>
                </div>
              </form>
            )}

            {step === 'success' && shareToken && (
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Link Criado com Sucesso!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Compartilhe este link para que outros possam ver a jornada de {petName}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Copy className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Link de Compartilhamento</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/shared-journey/${shareToken}`}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareJourneyModal;