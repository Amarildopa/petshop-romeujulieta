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
              Clube Bem Vindo Romeu & Julieta
            </h3>
            <p className="text-text-color mb-4 flex-grow">
              Com o Clube Bem Vindo, você adquire 4 sessões do serviço escolhido para ser utilizado em até 2 meses. Assim, garante os benefícios da recorrência, descontos especiais e flexibilidade para cuidar do seu pet com tranquilidade e planejamento. Ideal para quem ama personalizar o cuidado, com liberdade para investir exatamente no tratamento que seu pet mais precisa!
            </p>
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
              Clube Parceiros Romeu & Julieta
            </h3>
            <p className="text-text-color mb-4 flex-grow">
              No Clube Parceiros Romeu e Julieta, você adquire 8 sessões do serviço escolhido para serem utilizadas em até 6 meses. Além de praticidade e flexibilidade, você aproveita um desconto ainda maior tornando o cuidado do seu pet ainda mais vantajoso!
            </p>
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
              Clube VIP Romeu & Julieta
            </h3>
            <p className="text-text-color mb-4 flex-grow">
              O Clube VIP foi pensado para quem valoriza o máximo de benefícios e economia! 
              Ao contratar 12 sessões do serviço especial de sua escolha, você garante o maior desconto entre todos os pacotes, aproveitando ainda mais praticidade, flexibilidade e cuidado contínuo para seu pet e pode usar em até 12 meses. 
              Aqui você desfruta do atendimento exclusivo do Romeu & Julieta Pet&Spa!
            </p>
          </div>
        </motion.div>
      </div>

      {/* Card Cross/Banner de Benefícios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        className="mt-16 mb-12"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center border-2 border-primary/10"
          >
            <div className="bg-primary-light p-4 rounded-full w-16 h-16 mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xl font-semibold leading-relaxed" style={{ color: '#e05389' }}>
              Além de descontos progressivos, clientes do clube ganham banho de ozônio,  e ainda concorrem todo mês a um DaySpa exclusivo para pets! Venha viver experiências premium com benefícios especiais. (Válido para associados, não cumulativo com outros pacotes
            </p>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="text-center mt-12"
      >
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
