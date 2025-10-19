import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const VIPPackages: React.FC = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-yellow-50 rounded-2xl p-6"
    >
      <div className="text-center mb-8">
        <h2 id="vip-packages" className="text-4xl font-bold text-gray-800 mb-2">
          Entre para o Clube Romeu e Julieta
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Garanta já o melhor cuidado para seu pet com nossos pacotes de banho.
        </p>
      </div>

      {/* Container dos Cards em Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Card do Primeiro Tier - Clube Bem Vindo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex"
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group flex-1 flex flex-col">
            <div className="bg-primary-light p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-primary transition-colors duration-300">
              <Star className="w-8 h-8 text-primary group-hover:text-white" />
            </div>
            <h3 className="text-xl font-semibold text-text-color-dark mb-2">
              Pacote Essencial 4 Banhos
            </h3>
            <p className="text-text-color mb-4 flex-grow">
              O cuidado básico que seu pet merece com qualidade premium e flexibilidade total.
            </p>

            {/* Lista de serviços inclusos */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
                <span>✨</span>
                Serviços Inclusos
              </h4>
              <div className="space-y-2">
                {[
                  'Banho',
                  'Banho de Ozônio',
                  'Hidratação',
                  'Banho de Ofurô',
                  'Desembolo',
                  'Remoção de Subpelo',
                  'Tosa Higiênica'
                ].map((service, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefícios adicionais */}
            <div className="flex flex-wrap justify-center gap-1 mt-auto">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                ✨ Flexibilidade
              </span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                💰 Descontos
              </span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                🎯 Personalizado
              </span>
            </div>
          </div>
        </motion.div>

        {/* Card do Segundo Tier - Pacote Fidelidade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex"
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group flex-1 flex flex-col">
            <div className="bg-primary-light p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-primary transition-colors duration-300">
              <Sparkles className="w-8 h-8 text-primary group-hover:text-white" />
            </div>
            <h3 className="text-xl font-semibold text-text-color-dark mb-2">
              Pacote Fidelidade
            </h3>
            <p className="text-text-color mb-4 flex-grow">
              8 sessões do serviço escolhido para usar em até 6 meses. Desconto maior e participação no sorteio mensal de prêmios exclusivos.
            </p>

            {/* Lista de serviços inclusos */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
                <span>✨</span>
                Serviços Inclusos
              </h4>
              <div className="space-y-2">
                {[
                  'Banho',
                  'Banho de Ozônio',
                  'Hidratação',
                  'Banho de Ofurô',
                  'Desembolo',
                  'Remoção de Subpelo',
                  'Tosa Higiênica'
                ].map((service, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefícios adicionais */}
            <div className="flex flex-wrap justify-center gap-1 mt-auto">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                🎁 Sorteio Mensal
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                💰 Maior Desconto
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                ⏰ 6 Meses
              </span>
            </div>
          </div>
        </motion.div>

        {/* Card do Terceiro Tier - Pacote VIP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex md:col-span-2 lg:col-span-1"
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group flex-1 flex flex-col">
            <div className="bg-primary-light p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-primary transition-colors duration-300">
              <Crown className="w-8 h-8 text-primary group-hover:text-white" />
            </div>
            <h3 className="text-xl font-semibold text-text-color-dark mb-2">
              Pacote VIP
            </h3>
            <p className="text-text-color mb-4 flex-grow">
              12 sessões do serviço especial para usar em até 12 meses. Maior desconto entre todos os pacotes + todos os benefícios do Plano Fidelidade.
            </p>

            {/* Lista de serviços inclusos */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
                <span>✨</span>
                Serviços Inclusos
              </h4>
              <div className="space-y-2">
                {[
                  'Banho',
                  'Banho de Ozônio',
                  'Hidratação',
                  'Banho de Ofurô',
                  'Desembolo',
                  'Remoção de Subpelo',
                  'Tosa Higiênica'
                ].map((service, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefícios adicionais */}
            <div className="flex flex-wrap justify-center gap-1 mt-auto">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                👑 Máximo Desconto
              </span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                🎁 Sorteio + Exclusivo
              </span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                📅 12 Meses
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="text-center mt-12"
      >
        <p className="text-sm text-gray-600 mb-4">
          Contratando 2 ou + pacotes de serviços você ainda tem 5% de desconto nos produtos da loja
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {user ? (
            // Usuário logado - mostrar botão "Seus Planos"
            <Link
              to="/subscription"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              style={{
                backgroundColor: '#e05389',
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c44576'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e05389'}
            >
              Seus Planos
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            // Usuário não logado - mostrar botões "Cadastre-se" e "Já sou cliente"
            <>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: '#e05389',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c44576'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e05389'}
              >
                Cadastre-se
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary/5 transition-all duration-300"
              >
                Já sou cliente
              </Link>
            </>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Cadastre-se para ver preços exclusivos e condições especiais
        </p>
      </motion.div>
    </motion.div>
  );
};

export default VIPPackages;
