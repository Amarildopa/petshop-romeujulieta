/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
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
  ShoppingBag,
  GitCompare,
  Share2,
  HeartHandshake
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { productsService, type Product } from '../services/productsService';
import { cartService } from '../services/cartService';
import { wishlistService } from '../services/wishlistService';
import { comparisonService } from '../services/comparisonService';
import { getImageUrl } from '../config/images';
import ProductModal from '../components/ProductModal';

const Store: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Estados para busca e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [discountFilter, setDiscountFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Estados para dados reais
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>(['all']);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  
  // Estados para o modal de produto
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para wishlist e comparação
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [comparisonItems, setComparisonItems] = useState<string[]>([]);

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
        const [productsData, categoriesData] = await Promise.all([
          productsService.getProducts(),
          productsService.getCategories()
        ]);
        
        setProducts(productsData);
        setCategories(['all', ...categoriesData]);
        
        // Extrair marcas únicas dos produtos
        const uniqueBrands = [...new Set(productsData.map(p => p.brand).filter(Boolean))];
        setBrands(['all', ...uniqueBrands]);
        
        // Extrair tags únicas dos produtos
        const allTags = productsData.flatMap(p => p.tags || []);
        const uniqueTags = [...new Set(allTags)];
        setAvailableTags(uniqueTags);

        // Load cart item count and wishlist if user is logged in
        if (user) {
          const count = await cartService.getCartItemCount(user.id);
          setCartItemCount(count);
          
          // Load wishlist items
          const wishlist = await wishlistService.getUserWishlist(user.id);
          setWishlistItems(wishlist.map(item => item.product_id));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filtrar e ordenar produtos
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      // Busca avançada (nome, descrição, marca, tags)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        (product.tags || []).some(tag => tag.toLowerCase().includes(searchLower));
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      const matchesRating = minRating === 0 || product.rating >= minRating;
      
      // Filtro por marca
      const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
      
      // Filtro por disponibilidade
      const matchesAvailability = availabilityFilter === 'all' || 
        (availabilityFilter === 'in_stock' && product.in_stock) ||
        (availabilityFilter === 'out_of_stock' && !product.in_stock);
      
      // Filtro por desconto
      const hasDiscount = product.original_price && product.original_price > product.price;
      const matchesDiscount = !discountFilter || hasDiscount;
      
      // Filtro por data de lançamento
      const now = new Date();
      const productDate = new Date(product.created_at || '');
      const daysDiff = Math.floor((now.getTime() - productDate.getTime()) / (1000 * 60 * 60 * 24));
      const matchesDate = dateFilter === 'all' ||
        (dateFilter === 'last_week' && daysDiff <= 7) ||
        (dateFilter === 'last_month' && daysDiff <= 30) ||
        (dateFilter === 'last_3_months' && daysDiff <= 90);
      
      // Filtro por tags
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => (product.tags || []).includes(tag));
      
      return matchesSearch && matchesCategory && matchesPrice && matchesRating && 
             matchesBrand && matchesAvailability && matchesDiscount && matchesDate && matchesTags;
    });

    // Ordenar produtos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, minRating, sortBy, selectedBrand, availabilityFilter, discountFilter, dateFilter, selectedTags]);

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

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleCartUpdate = async () => {
    if (user) {
      const count = await cartService.getCartItemCount(user.id);
      setCartItemCount(count);
    }
  };

  // Funções para gerenciar wishlist
  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      setError('Você precisa estar logado para gerenciar sua lista de desejos');
      return;
    }

    try {
      const isInWishlist = wishlistItems.includes(productId);
      
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(user.id, productId);
        setWishlistItems(prev => prev.filter(id => id !== productId));
      } else {
        await wishlistService.addToWishlist(user.id, productId);
        setWishlistItems(prev => [...prev, productId]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerenciar lista de desejos');
    }
  };

  // Funções para gerenciar comparação
  const handleToggleComparison = (productId: string) => {
    const isInComparison = comparisonItems.includes(productId);
    
    if (isInComparison) {
      setComparisonItems(prev => prev.filter(id => id !== productId));
    } else {
      if (comparisonItems.length >= 4) {
        setError('Você pode comparar no máximo 4 produtos');
        return;
      }
      setComparisonItems(prev => [...prev, productId]);
    }
  };

  // Função para compartilhar produto
  const handleShareProduct = async (product: Product) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Confira este produto: ${product.name}`,
          url: window.location.href + `?product=${product.id}`
        });
      } catch (err) {
        // Fallback para copiar URL
        copyToClipboard(`${window.location.href}?product=${product.id}`);
      }
    } else {
      // Fallback para copiar URL
      copyToClipboard(`${window.location.href}?product=${product.id}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setError('Link copiado para a área de transferência!');
      setTimeout(() => setError(null), 3000);
    }).catch(() => {
      setError('Erro ao copiar link');
    });
  };

  // Funções auxiliares para filtros avançados
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange({ min: 0, max: 1000 });
    setMinRating(0);
    setSelectedBrand('all');
    setAvailabilityFilter('all');
    setDiscountFilter(false);
    setDateFilter('all');
    setSelectedTags([]);
    setSortBy('name');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory !== 'all') count++;
    if (priceRange.min > 0 || priceRange.max < 1000) count++;
    if (minRating > 0) count++;
    if (selectedBrand !== 'all') count++;
    if (availabilityFilter !== 'all') count++;
    if (discountFilter) count++;
    if (dateFilter !== 'all') count++;
    if (selectedTags.length > 0) count++;
    return count;
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface pt-8 pb-12 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
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
          <LoadingSpinner size="lg" message="Carregando produtos..." />
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Price Filter */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-accent/20"
            >
              <h3 className="font-semibold text-text-color-dark mb-4">Faixa de Preço</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-accent rounded-lg text-sm focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-text-color">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 1000 }))}
                    className="w-full px-3 py-2 border border-accent rounded-lg text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="text-sm text-text-color">
                  R$ {priceRange.min} - R$ {priceRange.max}
                </div>
              </div>
            </motion.div>

            {/* Rating Filter */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-accent/20"
            >
              <h3 className="font-semibold text-text-color-dark mb-4">Avaliação Mínima</h3>
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      minRating === rating
                        ? 'bg-primary-light/50 text-primary-dark'
                        : 'hover:bg-surface-dark text-text-color'
                    }`}
                  >
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rating || rating === 0
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm">
                      {rating === 0 ? 'Todas' : `${rating}+ estrelas`}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Brand Filter */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-accent/20"
            >
              <h3 className="font-semibold text-text-color-dark mb-4">Marca</h3>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      selectedBrand === brand
                        ? 'bg-primary-light/50 text-primary-dark'
                        : 'hover:bg-surface-dark text-text-color'
                    }`}
                  >
                    {brand === 'all' ? 'Todas as Marcas' : brand}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Availability Filter */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-accent/20"
            >
              <h3 className="font-semibold text-text-color-dark mb-4">Disponibilidade</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'in_stock', label: 'Em Estoque' },
                  { value: 'out_of_stock', label: 'Fora de Estoque' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAvailabilityFilter(option.value)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      availabilityFilter === option.value
                        ? 'bg-primary-light/50 text-primary-dark'
                        : 'hover:bg-surface-dark text-text-color'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Special Filters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-accent/20"
            >
              <h3 className="font-semibold text-text-color-dark mb-4">Filtros Especiais</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discountFilter}
                    onChange={(e) => setDiscountFilter(e.target.checked)}
                    className="rounded border-accent text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-text-color">Apenas com desconto</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-text-color-dark mb-2">
                    Lançamento
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full border border-accent rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">Todos os períodos</option>
                    <option value="last_week">Última semana</option>
                    <option value="last_month">Último mês</option>
                    <option value="last_3_months">Últimos 3 meses</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-accent/20"
              >
                <h3 className="font-semibold text-text-color-dark mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-primary text-white'
                          : 'bg-surface-dark text-text-color hover:bg-accent'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-accent/20">
                    <p className="text-xs text-text-color mb-2">
                      Tags selecionadas: {selectedTags.length}
                    </p>
                    <button
                      onClick={() => setSelectedTags([])}
                      className="text-xs text-primary hover:text-primary-dark"
                    >
                      Limpar tags
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Clear Filters */}
            {getActiveFiltersCount() > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-accent/20"
              >
                <button
                  onClick={clearAllFilters}
                  className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Limpar Filtros ({getActiveFiltersCount()})</span>
                </button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
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
                  <button 
                    onClick={() => navigate('/product-checkout')}
                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Finalizar Compra
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
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price-asc' | 'price-desc' | 'rating' | 'newest')}
                className="border border-accent rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary"
                title="Ordenar produtos"
                aria-label="Ordenar produtos"
              >
                <option value="name">Nome (A-Z)</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="rating">Melhor Avaliação</option>
                <option value="newest">Mais Novos</option>
              </select>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-accent/20 cursor-pointer"
                  onClick={() => handleProductClick(product)}
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
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWishlist(product.id);
                        }}
                        className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                        title={wishlistItems.includes(product.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                      >
                        <Heart className={`h-4 w-4 ${
                          wishlistItems.includes(product.id) 
                            ? 'text-red-500 fill-current' 
                            : 'text-text-color'
                        }`} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComparison(product.id);
                        }}
                        className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                        title={comparisonItems.includes(product.id) ? "Remover da comparação" : "Adicionar à comparação"}
                      >
                        <GitCompare className={`h-4 w-4 ${
                          comparisonItems.includes(product.id)
                            ? 'text-blue-500'
                            : 'text-text-color'
                        }`} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareProduct(product);
                        }}
                        className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                        title="Compartilhar produto"
                      >
                        <Share2 className="h-4 w-4 text-text-color" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-text-color-dark mb-2 line-clamp-2 h-12">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center space-x-1 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={`${product.id}-star-${i}`}
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
                        {product.stock > 0 ? `${product.stock} disponíveis` : 'Fora de estoque'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-primary-dark">
                            R$ {product.price.toFixed(2)}
                          </span>
                          {product.stock === 0 && (
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product.id);
                      }}
                      disabled={product.stock === 0}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        product.stock > 0
                          ? 'bg-primary text-white hover:bg-primary-dark'
                          : 'bg-gray-200 text-text-color cursor-not-allowed'
                      }`}
                    >
                      {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
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
      
      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCartUpdate={handleCartUpdate}
      />
    </div>
  );
};

export default Store;
