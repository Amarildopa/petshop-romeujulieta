import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Check, 
  Star, 
  Calendar,
  Heart,
  ShoppingBag,
  Camera,
  Crown,
  Gift,
  CreditCard,
  TrendingUp
} from 'lucide-react';

export const Subscription: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      icon: Heart,
      color: 'secondary',
      monthlyPrice: 89,
      yearlyPrice: 890,
      description: 'Perfeito para quem quer experimentar nossos serviços premium',
      features: [
        '2 banhos por mês',
        '1 tosa por mês', 
        'Fotos durante os serviços',
        'Agendamento prioritário',
        '10% desconto na loja',
        'Suporte por WhatsApp'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: Crown,
      color: 'primary',
      monthlyPrice: 149,
      yearlyPrice: 1490,
      description: 'Plano mais popular! Cuidado completo para seu pet',
      features: [
        '4 banhos por mês',
        '2 tosas por mês',
        '1 check-up veterinário',
        'Fotos e vídeos em tempo real',
        'Entrega grátis de ração',
        '20% desconto na loja',
        'Suporte prioritário 24/7',
        'Daycare: 2 dias grátis/mês'
      ],
      popular: true
    },
    {
      id: 'vip',
      name: 'VIP',
      icon: Award,
      color: 'accent',
      monthlyPrice: 249,
      yearlyPrice: 2490,
      description: 'Experiência exclusiva e luxuosa para pets especiais',
      features: [
        'Serviços ilimitados',
        'Check-ups mensais',
        'Adestramento personalizado',
        'Câmeras ao vivo dedicadas',
        'Delivery premium diário',
        '30% desconto na loja',
        'Concierge pessoal',
        'Spa e tratamentos especiais',
        'Transporte premium',
        'Ensaio fotográfico mensal'
      ],
      popular: false
    }
  ];

  const currentSubscription = {
    plan: 'premium',
    status: 'active',
    nextBilling: '2025-02-15',
    servicesUsed: 3,
    servicesLimit: 7,
    cashback: 45.20,
    totalSaved: 234.50
  };

  const benefits = [
    {
      icon: Camera,
      title: 'Acompanhamento Visual',
      description: 'Fotos e vídeos em tempo real de todos os serviços'
    },
    {
      icon: Calendar,
      title: 'Agendamento Prioritário',
      description: 'Acesso exclusivo a horários premium'
    },
    {
      icon: ShoppingBag,
      title: 'Descontos Exclusivos',
      description: 'Economia garantida em produtos e serviços'
    },
    {
      icon: Gift,
      title: 'Benefícios Especiais',
      description: 'Surpresas e mimos mensais para seu pet'
    }
  ];

  const getColorClasses = (color: string, selected: boolean = false) => {
    const colorMap = {
      secondary: {
        bg: selected ? 'bg-secondary-light/50' : 'bg-white',
        border: selected ? 'border-secondary' : 'border-accent/20',
        accent: 'text-secondary-dark',
        button: 'bg-secondary text-white'
      },
      primary: {
        bg: selected ? 'bg-primary-light/50' : 'bg-white',
        border: selected ? 'border-primary' : 'border-accent/20',
        accent: 'text-primary-dark',
        button: 'bg-primary text-white'
      },
      accent: {
        bg: selected ? 'bg-accent-light/50' : 'bg-white',
        border: selected ? 'border-accent-dark' : 'border-accent/20',
        accent: 'text-accent-dark',
        button: 'bg-accent-dark text-white'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.primary;
  };

  const getPrice = (plan: any) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12);
  };

  const getSavings = (plan: any) => {
    return billingCycle === 'yearly' ? Math.round(((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="text-center pt-16 pb-12">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center justify-center space-x-2">
              <Crown className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-text-color-dark">
                Planos Premium
              </h1>
            </div>
            <p className="text-xl text-text-color max-w-3xl mx-auto mt-4">
              Escolha o plano ideal para garantir o melhor cuidado para seu pet.
            </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-accent/20 p-6 mb-12"
        >
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-status-success-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-8 w-8 text-status-success" />
              </div>
              <h3 className="font-semibold text-text-color-dark">Plano Atual</h3>
              <p className="text-status-success font-medium">Premium Ativo</p>
            </div>

            <div className="text-center">
              <div className="bg-status-info-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-8 w-8 text-status-info" />
              </div>
              <h3 className="font-semibold text-text-color-dark">Próxima Cobrança</h3>
              <p className="text-text-color">{new Date(currentSubscription.nextBilling).toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="text-center">
              <div className="bg-accent-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-accent-dark" />
              </div>
              <h3 className="font-semibold text-text-color-dark">Serviços Utilizados</h3>
              <p className="text-text-color">{currentSubscription.servicesUsed}/{currentSubscription.servicesLimit} este mês</p>
            </div>

            <div className="text-center">
              <div className="bg-status-warning-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="h-8 w-8 text-status-warning" />
              </div>
              <h3 className="font-semibold text-text-color-dark">Cashback Acumulado</h3>
              <p className="text-status-success font-medium">R$ {currentSubscription.cashback.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="inline-flex bg-surface-dark rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-text-color-dark shadow-sm'
                  : 'text-text-color'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-white text-text-color-dark shadow-sm'
                  : 'text-text-color'
              }`}
            >
              Anual
              <span className="ml-2 bg-status-success text-white text-xs px-2 py-1 rounded-full">
                Economize até 25%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const colors = getColorClasses(plan.color, selectedPlan === plan.id);
            const savings = getSavings(plan);
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className={`relative rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-lg ${colors.bg} ${colors.border}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span>Mais Popular</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <plan.icon className={`h-12 w-12 mx-auto mb-4 ${colors.accent}`} />
                  <h3 className="text-2xl font-bold text-text-color-dark">{plan.name}</h3>
                  <p className="text-text-color mt-2">{plan.description}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-text-color-dark">
                      R$ {getPrice(plan)}
                    </span>
                    <span className="text-text-color ml-1">/mês</span>
                  </div>
                  {billingCycle === 'yearly' && savings > 0 && (
                    <div className="mt-2">
                      <span className="text-status-success font-medium text-sm">
                        Economize {savings}% pagando anualmente
                      </span>
                      <p className="text-text-color text-sm">
                        R$ {plan.yearlyPrice} cobrado anualmente
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-status-success flex-shrink-0 mt-0.5" />
                      <span className="text-text-color text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    selectedPlan === plan.id
                      ? `${colors.button}`
                      : 'bg-surface-dark text-text-color-dark hover:bg-accent/20'
                  }`}
                >
                  {currentSubscription.plan === plan.id ? 'Plano Atual' : 'Escolher Plano'}
                </button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-accent/20 p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-text-color-dark text-center mb-8">
            Benefícios Inclusos em Todos os Planos
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-light/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-text-color-dark mb-2">{benefit.title}</h3>
                <p className="text-text-color text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {selectedPlan !== currentSubscription.plan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-accent/20 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-color-dark">
                Alterar Plano
              </h2>
              <CreditCard className="h-6 w-6 text-text-color" />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-text-color-dark mb-4">Resumo da Mudança</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-color">Plano atual:</span>
                    <span className="font-medium">Premium</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-color">Novo plano:</span>
                    <span className="font-medium">{plans.find(p => p.id === selectedPlan)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-color">Ciclo de cobrança:</span>
                    <span className="font-medium">{billingCycle === 'monthly' ? 'Mensal' : 'Anual'}</span>
                  </div>
                  <div className="border-t border-accent/20 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-text-color-dark">Novo valor:</span>
                      <span className="font-bold text-primary-dark">
                        R$ {getPrice(plans.find(p => p.id === selectedPlan)!)}/mês
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-text-color-dark mb-4">Próximos Passos</h3>
                <div className="space-y-3 text-sm text-text-color">
                  <p>• A mudança será efetivada na próxima cobrança</p>
                  <p>• Você manterá os benefícios atuais até lá</p>
                  <p>• Cashback será creditado automaticamente</p>
                  <p>• Confirmação será enviada por e-mail</p>
                </div>

                <button className="w-full mt-6 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                  Confirmar Mudança de Plano
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
