import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Copy,
  QrCode,
  ArrowRight,
  Home
} from 'lucide-react';

const PaymentConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  
  const method = searchParams.get('method');
  const status = searchParams.get('status');
  
  // Simular código PIX
  const pixCode = "00020126580014BR.GOV.BCB.PIX013636c4b8c4-4c4c-4c4c-4c4c-4c4c4c4c4c4c5204000053039865802BR5925PETSHOP ROMEO E JULIETA6009SAO PAULO62070503***6304";

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Se for PIX pendente, simular confirmação após 30 segundos
    if (method === 'pix' && status === 'pending') {
      const timer = setTimeout(() => {
        // Redirecionar para confirmação de sucesso
        navigate('/payment-confirmation?method=pix&status=success');
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [method, status, navigate]);

  const getStatusConfig = () => {
    if (status === 'success') {
      return {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        title: 'Pagamento Confirmado!',
        message: method === 'pix' 
          ? 'Seu PIX foi processado com sucesso e sua assinatura está ativa.'
          : 'Seu cartão foi processado com sucesso e sua assinatura está ativa.'
      };
    } else if (status === 'pending') {
      return {
        icon: Clock,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        title: 'Aguardando Pagamento',
        message: 'Escaneie o QR Code ou copie o código PIX para finalizar o pagamento.'
      };
    } else {
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: 'Erro no Pagamento',
        message: 'Houve um problema ao processar seu pagamento. Tente novamente.'
      };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Status Icon */}
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border-2 mb-6`}>
            <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-text-color-dark mb-4">
            {statusConfig.title}
          </h1>

          {/* Message */}
          <p className="text-text-color text-lg mb-8">
            {statusConfig.message}
          </p>
        </motion.div>

        {/* PIX Payment Details */}
        {method === 'pix' && status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-text-color-dark mb-4 text-center">
              Finalize seu pagamento
            </h2>

            {/* QR Code Placeholder */}
            <div className="bg-surface rounded-lg p-8 mb-6 text-center">
              <QrCode className="h-32 w-32 text-text-color mx-auto mb-4" />
              <p className="text-text-color text-sm">
                Escaneie este QR Code com o app do seu banco
              </p>
            </div>

            {/* PIX Code */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-color-dark mb-2">
                  Ou copie o código PIX:
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={pixCode}
                    readOnly
                    className="flex-1 px-3 py-2 border border-accent/20 rounded-l-lg bg-surface text-sm"
                  />
                  <button
                    onClick={copyPixCode}
                    className="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary-dark transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-green-600 text-sm mt-1">
                    Código copiado!
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  Como pagar com PIX:
                </h3>
                <ol className="text-blue-800 text-sm space-y-1">
                  <li>1. Abra o app do seu banco</li>
                  <li>2. Escolha a opção PIX</li>
                  <li>3. Escaneie o QR Code ou cole o código</li>
                  <li>4. Confirme o pagamento</li>
                </ol>
              </div>

              {/* Timer */}
              <div className="text-center">
                <p className="text-text-color text-sm">
                  Aguardando confirmação do pagamento...
                </p>
                <div className="flex items-center justify-center mt-2">
                  <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                  <span className="text-yellow-600 text-sm">
                    Este código expira em 15 minutos
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Actions */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-text-color-dark mb-4 text-center">
              Próximos Passos
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                <div>
                  <div className="font-medium text-green-900">
                    Assinatura Ativada
                  </div>
                  <div className="text-green-700 text-sm">
                    Você já pode aproveitar todos os benefícios do seu plano
                  </div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-500 mr-3" />
                <div>
                  <div className="font-medium text-blue-900">
                    Email de Confirmação
                  </div>
                  <div className="text-blue-700 text-sm">
                    Enviamos os detalhes da sua assinatura por email
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {status === 'success' ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center"
              >
                Ir para Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
              <button
                onClick={() => navigate('/subscription')}
                className="flex-1 bg-white text-primary border-2 border-primary py-3 px-6 rounded-lg font-medium hover:bg-primary/5 transition-colors"
              >
                Ver Assinatura
              </button>
            </>
          ) : status === 'pending' ? (
            <>
              <button
                onClick={() => navigate('/subscription')}
                className="flex-1 bg-white text-primary border-2 border-primary py-3 px-6 rounded-lg font-medium hover:bg-primary/5 transition-colors"
              >
                Voltar aos Planos
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-surface text-text-color py-3 px-6 rounded-lg font-medium hover:bg-surface-dark transition-colors flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Início
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/subscription')}
                className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-white text-primary border-2 border-primary py-3 px-6 rounded-lg font-medium hover:bg-primary/5 transition-colors flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Início
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;