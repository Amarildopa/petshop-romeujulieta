import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lightbulb, Loader2, LogIn, UserPlus } from 'lucide-react';
import { helpService } from '../services/helpService';
import { useAuth } from '../hooks/useAuth';
import type { HelpArticle } from '../services/helpService';

const WeeklyTip: React.FC = () => {
  const { user } = useAuth();
  const [tip, setTip] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandomTip = async () => {
      try {
        setLoading(true);
        setError(null);
        const randomTip = await helpService.getRandomTip();
        setTip(randomTip);
      } catch (err) {
        console.error('Erro ao buscar dica aleatória:', err);
        setError('Não foi possível carregar a dica da semana.');
      } finally {
        setLoading(false);
      }
    };

    fetchRandomTip();
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg text-text-color">Carregando dica...</span>
        </div>
      </div>
    );
  }

  if (error || !tip) {
    return null; // Não exibe a seção se houver erro ou não houver dica
  }

  // Função para truncar o conteúdo da dica
  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-xl p-8 h-full"
    >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-light rounded-full mb-4">
              <Lightbulb className="h-8 w-8 text-primary-dark" />
            </div>
            <h2 className="text-4xl font-bold text-text-color-dark">
          Dica da Semana
        </h2>
            <p className="mt-2 text-text-color">
              Aprenda algo novo para cuidar melhor do seu pet
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-text-color-dark mb-4">
              {tip.title}
            </h3>
            <p className="text-text-color text-lg leading-relaxed mb-6">
              {truncateContent(tip.content)}
            </p>
            
            {tip.category && (
              <div className="mb-6">
                <span className="inline-block bg-secondary-light text-secondary-dark px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {tip.category}
                </span>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Botão para cadastro - sempre visível para não cadastrados */}
              {!user && (
                <Link
                  to="/register?redirect=/help-center"
                  className="inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{
                    backgroundColor: '#e05389',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c44576'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e05389'}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Cadastre-se para Mais Dicas
                </Link>
              )}
              
              {/* Botão para login - sempre visível */}
              <Link
                to={user ? "/help-center" : "/login?redirect=/help-center"}
                className="inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{
                  backgroundColor: '#e05389',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c44576'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e05389'}
              >
                <LogIn className="mr-2 h-5 w-5" />
                {user ? "Ver Todas as Dicas" : "Entrar para Ver Dicas"}
              </Link>
            </div>
          </div>
    </motion.div>
  );
};

export default WeeklyTip;
