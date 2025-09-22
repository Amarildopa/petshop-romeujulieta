import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Shield, 
  ArrowLeft, 
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { subscriptionPlansService, type SubscriptionPlan } from '../services/subscriptionPlansService';
import { userSubscriptionsService } from '../services/userSubscriptionsService';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para cartão de crédito
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    const loadPlan = async () => {
      const planId = searchParams.get('planId');
      const cycle = searchParams.get('cycle') as 'monthly' | 'yearly';
      
      if (!planId) {
        navigate('/subscription');
        return;
      }

      if (!user) {
        navigate('/login?redirect=/checkout');
        return;
      }

      try {
        const planData = await subscriptionPlansService.getPlanById(planId);
        if (!planData) {
          setError('Plano não encontrado');
          return;
        }
        
        setPlan(planData);
        setBillingCycle(cycle || 'monthly');
      } catch {
        setError('Erro ao carregar dados do plano');
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [searchParams, user, navigate]);

  const handlePayment = async () => {
    if (!plan || !user) return;

    setProcessing(true);
    setError(null);

    try {
      if (paymentMethod === 'pix') {
        // Simular processamento PIX
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Criar assinatura com status pending
        await userSubscriptionsService.createSubscription({
          user_id: user.id,
          plan_id: plan.id,
          billing_cycle: billingCycle,
          price: plan.price,
          status: 'pending',
          payment_method: 'pix',
          auto_renew: true
        });

        // Redirecionar para página de confirmação PIX
        navigate('/payment-confirmation?method=pix&status=pending');
        
      } else {
        // Validar dados do cartão
        if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
          setError('Preencha todos os dados do cartão');
          return;
        }

        // Simular processamento do cartão
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Criar assinatura ativa (cartão processado imediatamente)
        await userSubscriptionsService.createSubscription({
          user_id: user.id,
          plan_id: plan.id,
          billing_cycle: billingCycle,
          price: plan.price,
          status: 'active',
          payment_method: 'credit_card',
          auto_renew: true
        });

        // Redirecionar para confirmação de sucesso
        navigate('/payment-confirmation?method=card&status=success');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-color">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/subscription')} 
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            Voltar aos Planos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/subscription')}
            className="flex items-center text-text-color hover:text-primary mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar aos planos
          </button>
          <h1 className="text-3xl font-bold text-text-color-dark">
            Finalizar Assinatura
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumo do Plano */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-text-color-dark mb-4">
              Resumo do Pedido
            </h2>
            
            {plan && (
              <div className="space-y-4">
                <div className="border-b border-accent/20 pb-4">
                  <h3 className="font-semibold text-text-color-dark">
                    {plan.name}
                  </h3>
                  <p className="text-text-color text-sm">
                    {plan.description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-color">Plano:</span>
                    <span className="font-medium text-text-color-dark">
                      {plan.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-color">Ciclo:</span>
                    <span className="font-medium text-text-color-dark">
                      {billingCycle === 'monthly' ? 'Mensal' : 'Anual'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-color">Valor:</span>
                    <span className="font-medium text-text-color-dark">
                      R$ {plan.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-accent/20 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-text-color-dark">Total:</span>
                    <span className="text-primary">
                      R$ {plan.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Método de Pagamento */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-text-color-dark mb-4">
              Método de Pagamento
            </h2>
            
            {/* Seleção do método */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setPaymentMethod('pix')}
                className={`w-full p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'pix'
                    ? 'border-primary bg-primary/5'
                    : 'border-accent/20 hover:border-accent/40'
                }`}
              >
                <div className="flex items-center">
                  <Smartphone className="h-6 w-6 text-primary mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-text-color-dark">PIX</div>
                    <div className="text-sm text-text-color">
                      Aprovação instantânea
                    </div>
                  </div>
                  {paymentMethod === 'pix' && (
                    <Check className="h-5 w-5 text-primary ml-auto" />
                  )}
                </div>
              </button>
              
              <button
                onClick={() => setPaymentMethod('credit_card')}
                className={`w-full p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'credit_card'
                    ? 'border-primary bg-primary/5'
                    : 'border-accent/20 hover:border-accent/40'
                }`}
              >
                <div className="flex items-center">
                  <CreditCard className="h-6 w-6 text-primary mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-text-color-dark">
                      Cartão de Crédito
                    </div>
                    <div className="text-sm text-text-color">
                      Ativação imediata
                    </div>
                  </div>
                  {paymentMethod === 'credit_card' && (
                    <Check className="h-5 w-5 text-primary ml-auto" />
                  )}
                </div>
              </button>
            </div>

            {/* Formulário do cartão */}
            {paymentMethod === 'credit_card' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Número do Cartão
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.number}
                    onChange={(e) => setCardData({...cardData, number: e.target.value})}
                    className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Nome no Cartão
                  </label>
                  <input
                    type="text"
                    placeholder="João Silva"
                    value={cardData.name}
                    onChange={(e) => setCardData({...cardData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      Validade
                    </label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                      className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color-dark mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                      className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Informações de segurança */}
            <div className="bg-surface rounded-lg p-4 mb-6">
              <div className="flex items-center text-sm text-text-color">
                <Shield className="h-4 w-4 text-primary mr-2" />
                Seus dados estão protegidos com criptografia SSL
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              </div>
            )}

            {/* Botão de pagamento */}
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processando...
                </div>
              ) : (
                `Pagar R$ ${plan?.price.toFixed(2) || '0,00'}`
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;