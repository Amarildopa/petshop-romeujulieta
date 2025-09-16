import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Package {
  id: string;
  name: string;
  icon: React.ReactNode;
  popular?: boolean;
  benefits: string[];
  exclusiveBenefits: string[];
  comparison: {
    feature: string;
    avulso: boolean;
    package: boolean;
  }[];
}

const packages: Package[] = [
  {
    id: 'standard',
    name: 'Standard',
    icon: <Star className="w-6 h-6" />,
    benefits: [
      '4 banhos por mês',
      '10% desconto em produtos',
      'Agendamento prioritário',
      'Lembrete automático'
    ],
    exclusiveBenefits: [
      'Desconto progressivo',
      'Sem taxa de cancelamento'
    ],
    comparison: [
      { feature: 'Desconto em produtos', avulso: false, package: true },
      { feature: 'Agendamento prioritário', avulso: false, package: true },
      { feature: 'Flexibilidade de horários', avulso: true, package: true }
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: <Sparkles className="w-6 h-6" />,
    popular: true,
    benefits: [
      '6 banhos por mês',
      '15% desconto em produtos',
      'Agendamento prioritário',
      'Lembrete automático',
      'Unha e orelha inclusos',
      'Perfume premium'
    ],
    exclusiveBenefits: [
      'Banho de hidratação grátis',
      'Consulta veterinária mensal',
      'Transporte gratuito'
    ],
    comparison: [
      { feature: 'Desconto em produtos', avulso: false, package: true },
      { feature: 'Serviços extras inclusos', avulso: false, package: true },
      { feature: 'Consulta veterinária', avulso: false, package: true }
    ]
  },
  {
    id: 'vip',
    name: 'VIP',
    icon: <Crown className="w-6 h-6" />,
    benefits: [
      'Banhos ilimitados',
      '20% desconto em produtos',
      'Agendamento prioritário VIP',
      'Lembrete automático',
      'Todos os serviços inclusos',
      'Perfume premium',
      'Tosa higiênica mensal'
    ],
    exclusiveBenefits: [
      'Atendimento domiciliar',
      'Consulta veterinária semanal',
      'Kit de produtos mensais',
      'Acesso a eventos exclusivos'
    ],
    comparison: [
      { feature: 'Banhos ilimitados', avulso: false, package: true },
      { feature: 'Atendimento domiciliar', avulso: false, package: true },
      { feature: 'Kit produtos mensais', avulso: false, package: true }
    ]
  }
];

const VIPPackages: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full text-sm font-semibold mb-4"
        >
          <Crown className="w-4 h-4" />
          Cliente VIP
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Assine seu Pacote de Banhos
        </h2>
        <p className="text-gray-600 text-sm">
          Seja nosso cliente VIP com acesso a descontos exclusivos
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className={`relative bg-white rounded-xl p-4 shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
              pkg.popular 
                ? 'border-primary/30 ring-2 ring-primary/20' 
                : 'border-gray-100 hover:border-primary/30'
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Mais Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-4">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                pkg.id === 'vip' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                pkg.id === 'premium' ? 'bg-gradient-to-r from-primary to-secondary text-white' :
                'bg-gradient-to-r from-secondary to-accent text-white'
              }`}>
                {pkg.icon}
              </div>
              <h3 className="font-bold text-lg text-gray-800">{pkg.name}</h3>
            </div>

            <div className="space-y-2 mb-4">
              {pkg.benefits.slice(0, 4).map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
              {pkg.benefits.length > 4 && (
                <div className="text-xs text-gray-500 text-center pt-1">
                  +{pkg.benefits.length - 4} benefícios
                </div>
              )}
            </div>

            <div className="border-t pt-3 mb-4">
              <p className="text-xs font-semibold text-primary mb-2">Exclusivo da assinatura:</p>
              {pkg.exclusiveBenefits.slice(0, 2).map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-xs mb-1">
                  <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-gray-600">{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3 text-center">Assinatura vs Pagamento Avulso</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="font-semibold text-gray-600">Benefício</div>
          <div className="font-semibold text-gray-600 text-center">Avulso</div>
          <div className="font-semibold text-primary text-center">Assinatura</div>
          
          <div className="col-span-3 border-t my-2"></div>
          
          <div className="text-gray-700">Descontos em produtos</div>
          <div className="text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></div>
          <div className="text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></div>
          
          <div className="text-gray-700">Agendamento prioritário</div>
          <div className="text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></div>
          <div className="text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></div>
          
          <div className="text-gray-700">Serviços extras inclusos</div>
          <div className="text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></div>
          <div className="text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></div>
          
          <div className="text-gray-700">Flexibilidade total</div>
          <div className="text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></div>
          <div className="text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-center"
      >
        <p className="text-sm text-gray-600 mb-4">
          Quer conhecer os valores e condições especiais?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-dark hover:to-secondary-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Cadastre-se Grátis
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary/5 transition-all duration-300"
          >
            Já sou cliente
          </Link>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Cadastre-se para ver preços exclusivos e condições especiais
        </p>
      </motion.div>
    </motion.div>
  );
};

export default VIPPackages;