import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp,
  ThumbsUp,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { helpService, type FAQ, type HelpArticle } from '../services/helpService';

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  useAuth();

  // Estados para dados
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [popularContent, setPopularContent] = useState<{
    popularFAQs: FAQ[];
    popularArticles: HelpArticle[];
  } | null>(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [faqsData, articlesData, faqCategories, articleCategories, popularData] = await Promise.all([
          helpService.getFAQs(),
          helpService.getHelpArticles(),
          helpService.getFAQCategories(),
          helpService.getHelpArticleCategories(),
          helpService.getPopularContent()
        ]);

        setFaqs(faqsData);
        setArticles(articlesData);
        setCategories([...new Set([...faqCategories, ...articleCategories])]);
        setPopularContent(popularData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Reset to all content
      const [faqsData, articlesData] = await Promise.all([
        helpService.getFAQs(selectedCategory === 'all' ? undefined : selectedCategory),
        helpService.getHelpArticles(selectedCategory === 'all' ? undefined : selectedCategory)
      ]);
      setFaqs(faqsData);
      setArticles(articlesData);
      return;
    }

    try {
      setLoading(true);
      const searchResults = await helpService.searchAll(searchQuery);
      setFaqs(searchResults.faqs);
      setArticles(searchResults.articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar');
    } finally {
      setLoading(false);
    }
  };

  // Filter by category
  const handleCategoryFilter = async (category: string) => {
    setSelectedCategory(category);
    try {
      setLoading(true);
      const [faqsData, articlesData] = await Promise.all([
        helpService.getFAQs(category === 'all' ? undefined : category),
        helpService.getHelpArticles(category === 'all' ? undefined : category)
      ]);
      setFaqs(faqsData);
      setArticles(articlesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao filtrar');
    } finally {
      setLoading(false);
    }
  };

  const handleFAQClick = async (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
    await helpService.incrementFAQViewCount(faqId);
  };

  const handleArticleClick = async (articleId: string) => {
    await helpService.incrementArticleViewCount(articleId);
  };

  const handleMarkHelpful = async (id: string, type: 'faq' | 'article') => {
    try {
      if (type === 'faq') {
        await helpService.markFAQAsHelpful(id);
      } else {
        await helpService.markArticleAsHelpful(id);
      }
    } catch (err) {
      console.error('Erro ao marcar como útil:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-color">Carregando centro de ajuda...</p>
        </div>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-extrabold text-text-color-dark mb-4">
            Centro de Ajuda
          </h1>
          <p className="text-text-color text-lg max-w-3xl mx-auto">
            Encontre respostas para suas dúvidas e aprenda mais sobre nossos serviços
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-color" />
            <input
              type="text"
              placeholder="Digite sua pergunta ou palavra-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-accent/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Buscar
            </button>
          </div>
        </motion.div>

        {/* Categories Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handleCategoryFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-color hover:bg-primary-light/20'
              }`}
            >
              Todas as Categorias
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-color hover:bg-primary-light/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Popular Content */}
        {popularContent && !searchQuery && selectedCategory === 'all' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-text-color-dark mb-6">
              Conteúdo Popular
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Popular FAQs */}
              <div className="bg-white rounded-xl shadow-sm border border-accent/20 p-6">
                <h3 className="text-lg font-semibold text-text-color-dark mb-4 flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                  Perguntas Frequentes
                </h3>
                <div className="space-y-3">
                  {popularContent.popularFAQs.map((faq) => (
                    <div key={faq.id} className="flex items-center justify-between p-3 bg-surface-dark rounded-lg">
                      <span className="text-text-color text-sm">{faq.question}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-text-color">{faq.helpful_count} úteis</span>
                        <ThumbsUp className="h-4 w-4 text-accent" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Articles */}
              <div className="bg-white rounded-xl shadow-sm border border-accent/20 p-6">
                <h3 className="text-lg font-semibold text-text-color-dark mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Artigos Populares
                </h3>
                <div className="space-y-3">
                  {popularContent.popularArticles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-3 bg-surface-dark rounded-lg">
                      <span className="text-text-color text-sm">{article.title}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-text-color">{article.helpful_count} úteis</span>
                        <ThumbsUp className="h-4 w-4 text-accent" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* FAQs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-text-color-dark mb-6 flex items-center">
            <HelpCircle className="h-6 w-6 mr-2 text-primary" />
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-accent/20 overflow-hidden">
                <button
                  onClick={() => handleFAQClick(faq.id)}
                  className="w-full p-6 text-left hover:bg-surface-dark transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-text-color-dark pr-4">
                      {faq.question}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-sm text-text-color">
                        <Eye className="h-4 w-4" />
                        <span>{faq.view_count}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-text-color">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{faq.helpful_count}</span>
                      </div>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="h-5 w-5 text-primary" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-text-color" />
                      )}
                    </div>
                  </div>
                </button>
                {expandedFAQ === faq.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                  >
                    <div className="pt-4 border-t border-accent/20">
                      <p className="text-text-color mb-4">{faq.answer}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-color">
                          Categoria: {faq.category}
                        </span>
                        <button
                          onClick={() => handleMarkHelpful(faq.id, 'faq')}
                          className="flex items-center space-x-1 text-sm text-primary hover:text-primary-dark transition-colors"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>Útil</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Articles Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-text-color-dark mb-6 flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-primary" />
            Artigos de Ajuda
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <motion.div
                key={article.id}
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl shadow-sm border border-accent/20 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="font-semibold text-text-color-dark mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-text-color text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-text-color mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{article.view_count}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{article.helpful_count}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-accent/20 px-2 py-1 rounded-full">
                      {article.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleArticleClick(article.id)}
                      className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                    >
                      Ler mais
                    </button>
                    <button
                      onClick={() => handleMarkHelpful(article.id, 'article')}
                      className="flex items-center space-x-1 text-sm text-accent hover:text-accent-dark transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>Útil</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-primary rounded-2xl p-8 text-white text-center"
        >
          <h2 className="text-2xl font-bold mb-4">
            Não encontrou o que procurava?
          </h2>
          <p className="text-primary-light mb-6">
            Nossa equipe de suporte está pronta para ajudar você
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary-light/20 transition-colors">
              <MessageCircle className="h-5 w-5 inline mr-2" />
              Chat ao Vivo
            </button>
            <button className="bg-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors">
              <HelpCircle className="h-5 w-5 inline mr-2" />
              Enviar Feedback
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpCenter;