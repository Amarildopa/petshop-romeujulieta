import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShoppingCart, 
  Heart, 
  Star, 
  Minus, 
  Plus, 
  Package,
  Truck,
  Shield,
  Info
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { type Product } from '../services/productsService';
import { cartService } from '../services/cartService';
import { getImageUrl } from '../config/images';
import ProductReviews from './ProductReviews';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onCartUpdate: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onCartUpdate 
}) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setActiveTab('details');
      setError(null);
    }
  }, [isOpen, product]);

  const handleAddToCart = async () => {
    if (!user || !product) {
      setError('Você precisa estar logado para adicionar itens ao carrinho');
      return;
    }

    try {
      setIsAddingToCart(true);
      setError(null);
      await cartService.addToCart(user.id, product.id, quantity);
      onCartUpdate();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar ao carrinho');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-accent/20">
                <h2 className="text-2xl font-bold text-text-color-dark">
                  Detalhes do Produto
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-text-color" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[80vh] overflow-y-auto">
                <div className="grid lg:grid-cols-2 gap-8 p-6">
                  {/* Product Image */}
                  <div className="space-y-4">
                    <div className="relative aspect-square bg-surface rounded-xl overflow-hidden">
                      <img
                        src={getImageUrl.productImage(product.image_url)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.badge && (
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
                          product.badge === 'Bestseller' 
                            ? 'bg-status-success text-white' 
                            : 'bg-status-danger text-white'
                        }`}>
                          {product.badge}
                        </div>
                      )}
                      <button 
                        className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                        title="Adicionar aos favoritos"
                      >
                        <Heart className="w-5 h-5 text-text-color" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold text-text-color-dark mb-2">
                        {product.name}
                      </h1>
                      <div className="flex items-center space-x-3 mb-4">
                        {renderStars(product.rating)}
                        <span className="text-sm font-medium text-text-color-dark">
                          {product.rating}
                        </span>
                        <span className="text-sm text-text-color">
                          ({product.reviews_count || 0} avaliações)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm text-text-color">Categoria:</span>
                        <span className="px-2 py-1 bg-primary-light/20 text-primary-dark text-sm rounded-full">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl font-bold text-primary-dark">
                          R$ {product.price.toFixed(2)}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <>
                            <span className="text-lg text-text-color line-through">
                              R$ {product.original_price.toFixed(2)}
                            </span>
                            <span className="px-2 py-1 bg-status-success text-white text-sm rounded-full font-medium">
                              {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>
                      {!product.in_stock && (
                        <div className="flex items-center space-x-2 text-red-600">
                          <Package className="w-4 h-4" />
                          <span className="font-medium">Produto fora de estoque</span>
                        </div>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    {product.in_stock && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-text-color-dark">
                          Quantidade
                        </label>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                            className="p-2 border border-accent rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium">{quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(1)}
                            className="p-2 border border-accent rounded-lg hover:bg-surface"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={!product.in_stock || isAddingToCart}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                        product.in_stock && !isAddingToCart
                          ? 'bg-primary text-white hover:bg-primary-dark'
                          : 'bg-gray-200 text-text-color cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>
                        {isAddingToCart 
                          ? 'Adicionando...' 
                          : product.in_stock 
                            ? 'Adicionar ao Carrinho' 
                            : 'Indisponível'
                        }
                      </span>
                    </button>

                    {/* Benefits */}
                    <div className="grid grid-cols-1 gap-3 pt-4 border-t border-accent/20">
                      <div className="flex items-center space-x-3 text-sm text-text-color">
                        <Truck className="w-4 h-4 text-primary" />
                        <span>Frete grátis para compras acima de R$ 99</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-text-color">
                        <Shield className="w-4 h-4 text-primary" />
                        <span>Compra 100% segura e protegida</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-text-color">
                        <Package className="w-4 h-4 text-primary" />
                        <span>Entrega em até 2 dias úteis</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-t border-accent/20">
                  <div className="flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`py-4 border-b-2 font-medium transition-colors ${
                        activeTab === 'details'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-text-color hover:text-text-color-dark'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Info className="w-4 h-4" />
                        <span>Detalhes</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`py-4 border-b-2 font-medium transition-colors ${
                        activeTab === 'reviews'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-text-color hover:text-text-color-dark'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4" />
                        <span>Avaliações ({product.reviews_count || 0})</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'details' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-text-color-dark mb-4">
                        Descrição do Produto
                      </h3>
                      <div className="prose prose-sm max-w-none text-text-color">
                        <p>
                          {product.description || 
                            `${product.name} é um produto de alta qualidade, desenvolvido especialmente para oferecer o melhor cuidado e bem-estar para seu pet. Fabricado com ingredientes selecionados e seguindo rigorosos padrões de qualidade.`
                          }
                        </p>
                        
                        <h4 className="font-semibold text-text-color-dark mt-6 mb-3">Características:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Produto premium de alta qualidade</li>
                          <li>Desenvolvido especialmente para pets</li>
                          <li>Ingredientes selecionados</li>
                          <li>Seguro e confiável</li>
                          <li>Recomendado por veterinários</li>
                        </ul>

                        <h4 className="font-semibold text-text-color-dark mt-6 mb-3">Informações Técnicas:</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Categoria:</span> {product.category}
                          </div>
                          <div>
                            <span className="font-medium">Disponibilidade:</span> 
                            {product.in_stock ? ' Em estoque' : ' Fora de estoque'}
                          </div>
                          <div>
                            <span className="font-medium">Avaliação:</span> {product.rating}/5 estrelas
                          </div>
                          <div>
                            <span className="font-medium">Avaliações:</span> {product.reviews_count || 0} clientes
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <ProductReviews 
                        productId={product.id} 
                        productName={product.name}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;