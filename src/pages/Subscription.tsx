import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  Check, 
  Calendar,
  Heart,
  Crown,
  Gift,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { subscriptionPlansService, type SubscriptionPlan } from '../services/subscriptionPlansService';
import { userSubscriptionsService, type UserSubscription } from '../services/userSubscriptionsService';

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Estados para dados reais
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalSpent: number;
    averageMonthlySpend: number;
  } | null>(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [plansData, currentSub, stats] = await Promise.all([
          subscriptionPlansService.getActivePlans(),
          userSubscriptionsService.getActiveSubscription(user.id),
          userSubscriptionsService.getSubscriptionStats(user.id)
        ]);

        setPlans(plansData);
        setCurrentSubscription(currentSub);
        setSubscriptionStats(stats);

        // Set selected plan to current subscription or first plan
        if (currentSub) {
          setSelectedPlan(currentSub.plan_id);
        } else if (plansData.length > 0) {
          setSelectedPlan(plansData[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filter plans by billing cycle
  const filteredPlans = plans.filter(plan => plan.billing_cycle === billingCycle);

  // Get plan icon based on name
  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'básico':
        return Heart;
      case 'premium':
        return Crown;
      case 'família':
        return Gift;
      default:
        return Award;
    }
  };

  // Get plan color based on name
  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'básico':
        return 'secondary';
      case 'premium':
        return 'primary';
      case 'família':
        return 'accent';
      default:
        return 'primary';
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      setError('Você precisa estar logado para assinar um plano');
      return;
    }

    // Redirecionar para a página de checkout com os dados do plano via query parameters
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      navigate(`/checkout?planId=${planId}&cycle=${billingCycle}`);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    try {
      await userSubscriptionsService.cancelSubscription(currentSubscription.id, 'Cancelado pelo usuário');
      
      // Reload data
      const [currentSub, stats] = await Promise.all([
        userSubscriptionsService.getActiveSubscription(user!.id),
        userSubscriptionsService.getSubscriptionStats(user!.id)
      ]);

      setCurrentSubscription(currentSub);
      setSubscriptionStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar assinatura');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Carregando planos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold text-text-color-dark mb-4">
            Planos de Assinatura
          </h1>
          <p className="text-text-color text-lg max-w-3xl mx-auto">
            Escolha o plano perfeito para dar o melhor cuidado ao seu pet. 
            Todos os planos incluem acesso completo aos nossos serviços.
          </p>
        </motion.div>

        {/* Billing Cycle Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-xl p-1 shadow-sm border border-accent/20">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-white'
                  : 'text-text-color hover:bg-surface-dark'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-white'
                  : 'text-text-color hover:bg-surface-dark'
              }`}
            >
              Anual
              <span className="ml-2 text-xs bg-status-success text-white px-2 py-1 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Current Subscription */}
        {currentSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-primary rounded-2xl p-6 mb-8 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Assinatura Ativa: {(currentSubscription as UserSubscription & { subscription_plans_pet?: { name: string } }).subscription_plans_pet?.name || 'Plano Ativo'}
                </h3>
                <p className="text-primary-light">
                  Próxima cobrança: {currentSubscription.next_billing_date 
                    ? new Date(currentSubscription.next_billing_date).toLocaleDateString('pt-BR')
                    : 'N/A'
                  }
                </p>
              </div>
              <button
                onClick={handleCancelSubscription}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {/* Subscription Stats */}
        {subscriptionStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white rounded-xl p-4 shadow-sm border border-accent/20">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm text-text-color">Total Gasto</p>
                  <p className="text-xl font-bold text-text-color-dark">
                    R$ {subscriptionStats.totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-accent/20">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-accent mr-3" />
                <div>
                  <p className="text-sm text-text-color">Assinaturas Ativas</p>
                  <p className="text-xl font-bold text-text-color-dark">
                    {subscriptionStats.activeSubscriptions}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-accent/20">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-status-success mr-3" />
                <div>
                  <p className="text-sm text-text-color">Gasto Médio Mensal</p>
                  <p className="text-xl font-bold text-text-color-dark">
                    R$ {subscriptionStats.averageMonthlySpend.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-accent/20">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-status-warning mr-3" />
                <div>
                  <p className="text-sm text-text-color">Total de Assinaturas</p>
                  <p className="text-xl font-bold text-text-color-dark">
                    {subscriptionStats.totalSubscriptions}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Plans Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {filteredPlans.map((plan, index) => {
            const Icon = getPlanIcon(plan.name);
            const color = getPlanColor(plan.name);
            const isSelected = selectedPlan === plan.id;
            const isCurrentPlan = currentSubscription?.plan_id === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-primary shadow-primary/20'
                    : 'border-accent/20 hover:border-primary/50'
                } ${isCurrentPlan ? 'ring-2 ring-primary/20' : ''}`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                      Plano Atual
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-xl ${
                      color === 'primary' ? 'bg-primary/10' :
                      color === 'secondary' ? 'bg-secondary/10' :
                      'bg-accent/10'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        color === 'primary' ? 'text-primary' :
                        color === 'secondary' ? 'text-secondary' :
                        'text-accent'
                      }`} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-text-color-dark">
                        {plan.name}
                      </h3>
                      <p className="text-text-color text-sm">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-text-color-dark">
                        R$ {plan.price.toFixed(2)}
                      </span>
                      <span className="text-text-color ml-2">
                        /{plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}
                      </span>
                    </div>
                    {plan.billing_cycle === 'yearly' && (
                      <p className="text-sm text-status-success mt-1">
                        Economize 20% comparado ao plano mensal
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    {Array.isArray(plan.features) && plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-status-success mr-3 flex-shrink-0" />
                        <span className="text-text-color">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-6 text-sm text-text-color">
                    <div className="flex justify-between">
                      <span>Máximo de pets:</span>
                      <span className="font-medium">{plan.max_pets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Agendamentos:</span>
                      <span className="font-medium">
                        {plan.max_appointments === 999 ? 'Ilimitados' : plan.max_appointments}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Desconto em produtos:</span>
                      <span className="font-medium">{plan.max_products_discount}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frete grátis:</span>
                      <span className="font-medium">
                        {plan.free_delivery ? 'Sim' : 'Não'}
                      </span>
                    </div>
                  </div>

                  {!isCurrentPlan && (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        color === 'primary'
                          ? 'bg-primary text-white hover:bg-primary-dark'
                          : color === 'secondary'
                          ? 'bg-secondary text-white hover:bg-secondary-dark'
                          : 'bg-accent text-white hover:bg-accent-dark'
                      }`}
                    >
                      {currentSubscription ? 'Trocar Plano' : 'Assinar Agora'}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-text-color-dark mb-6 text-center">
            Comparação de Recursos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-accent/20">
                  <th className="text-left py-3 px-4 font-medium text-text-color-dark">
                    Recursos
                  </th>
                  {filteredPlans.map(plan => (
                    <th key={plan.id} className="text-center py-3 px-4 font-medium text-text-color-dark">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-accent/10">
                  <td className="py-3 px-4 text-text-color">Máximo de pets</td>
                  {filteredPlans.map(plan => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.max_pets}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-accent/10">
                  <td className="py-3 px-4 text-text-color">Agendamentos</td>
                  {filteredPlans.map(plan => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.max_appointments === 999 ? 'Ilimitados' : plan.max_appointments}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-accent/10">
                  <td className="py-3 px-4 text-text-color">Desconto em produtos</td>
                  {filteredPlans.map(plan => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.max_products_discount}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-accent/10">
                  <td className="py-3 px-4 text-text-color">Frete grátis</td>
                  {filteredPlans.map(plan => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.free_delivery ? '✓' : '✗'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-color">Suporte prioritário</td>
                  {filteredPlans.map(plan => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.priority_support ? '✓' : '✗'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Subscription;
