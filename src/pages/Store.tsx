import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Star,
  Heart,
  Truck,
  Shield,
  Award,
  Package,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { productsService, type Product } from '../services/productsService';
import { cartService } from '../services/cartService';
import { getImageUrl } from '../config/images';

const Store: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Estados para dados reais
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const productsData = await productsService.getProducts();
        setProducts(productsData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productsData.map(product => product.category))];
        setCategories(['all', ...uniqueCategories]);

        // Load cart item count if user is logged in
        if (user) {
          const count = await cartService.getCartItemCount(user.id);
          setCartItemCount(count);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesCategory;
  });

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      setError('Você precisa estar logado para adicionar itens ao carrinho');
      return;
    }

    try {
      await cartService.addToCart(user.id, productId, 1);
      const count = await cartService.getCartItemCount(user.id);
      setCartItemCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar ao carrinho');
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-color">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-color">Carregando produtos...</p>
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

  const benefits = [
    {
      icon: Truck,
      title: 'Frete Grátis',
      description: 'Acima de R$ 99'
    },
    {
      icon: Shield,
      title: 'Compra Segura',
      description: '100% protegida'
    },
    {
      icon: Award,
      title: 'Produtos Premium',
      description: 'Qualidade garantida'
    },
    {
      icon: Package,
      title: 'Entrega Rápida',
      description: 'Em até 2 dias úteis'
    }
  ];

  return (
    <div className="min-h-screen bg-surface">
      <div className="text-center pt-16 pb-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-text-color-dark flex items-center justify-center space-x-3">
          <span>Loja Premium</span>
          <ShoppingBag className="h-8 w-8 text-primary" />
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-text-color mt-2">
          Produtos naturais e acessórios de qualidade para seu pet
        </motion.p>
      </div>

      <section className="bg-surface-dark border-y border-accent/20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <benefit.icon className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold text-text-color-dark text-sm">
                    {benefit.title}
                  </p>
                  <p className="text-text-color text-xs">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-accent/20"
            >
              <div className="relative">
                <Search className="h-5 w-5 text-text-color absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  className="w-full pl-10 pr-4 py-3 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-accent/20"
            >
              <h3 className="font-semibold text-text-color-dark mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Categorias
              </h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const count = category === 'all' 
                    ? products.length 
                    : products.filter(p => p.category === category).length;
                  
                  return (
                  <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedCategory === category
                        ? 'bg-primary-light/50 text-primary-dark border border-primary/20'
                        : 'hover:bg-surface-dark text-text-color'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {category === 'all' ? 'Todos os Produtos' : category}
                        </span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                          selectedCategory === category
                          ? 'bg-primary/20 text-primary-dark'
                          : 'bg-surface-dark text-text-color'
                      }`}>
                          {count}
                      </span>
                    </div>
                  </button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-accent/20"
            >
              <h3 className="font-semibold text-text-color-dark mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Carrinho ({cartItemCount})
              </h3>
              {cartItemCount > 0 ? (
                <div className="space-y-2">
                  <p className="text-text-color text-sm">
                    {cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'} adicionados
                  </p>
                  <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    Ver Carrinho
                  </button>
                </div>
              ) : (
                <p className="text-text-color text-sm">
                  Seu carrinho está vazio
                </p>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-6"
            >
              <h2 className="text-xl font-semibold text-text-color-dark">
                {selectedCategory === 'all' ? 'Todos os Produtos' : selectedCategory} ({filteredProducts.length})
              </h2>
              <select 
                className="border border-accent rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary"
                title="Ordenar produtos"
                aria-label="Ordenar produtos"
              >
                <option>Mais Relevantes</option>
                <option>Menor Preço</option>
                <option>Maior Preço</option>
                <option>Mais Vendidos</option>
              </select>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-accent/20"
                >
                  <div className="relative">
                    <img
                      src={getImageUrl.productImage(product.image_url)}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {product.badge && (
                      <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                        product.badge === 'Bestseller' 
                          ? 'bg-status-success text-white' 
                          : 'bg-status-danger text-white'
                      }`}>
                        {product.badge}
                      </div>
                    )}
                    <button 
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                      title="Adicionar aos favoritos"
                    >
                      <Heart className="h-4 w-4 text-text-color" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-text-color-dark mb-2 line-clamp-2 h-12">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center space-x-1 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-text-color-dark">
                        {product.rating}
                      </span>
                      <span className="text-sm text-text-color">
                        (Disponível)
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-primary-dark">
                            R$ {product.price.toFixed(2)}
                          </span>
                          {!product.in_stock && (
                            <span className="text-sm text-red-500 font-medium">
                              Fora de estoque
                            </span>
                          )}
                        </div>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-xs text-status-success font-medium">
                            {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={!product.in_stock}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        product.in_stock
                          ? 'bg-primary text-white hover:bg-primary-dark'
                          : 'bg-gray-200 text-text-color cursor-not-allowed'
                      }`}
                    >
                      {product.in_stock ? 'Adicionar ao Carrinho' : 'Indisponível'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-text-color text-lg">
                  Nenhum produto encontrado nesta categoria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;