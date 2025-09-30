import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Filter, Sort, MessageCircle, User } from 'lucide-react';
import { reviewsService, Review, ReviewStats } from '../services/reviewsService';
import { productsService, Product } from '../services/productsService';
import { authService } from '../services/authService';
import { toast } from 'sonner';

interface ReviewFormData {
  rating: number;
  comment: string;
}

const Reviews: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<{id: string; email: string} | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    comment: ''
  });

  const loadData = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const [productData, reviewsData, statsData] = await Promise.all([
        productsService.getProductById(productId),
        reviewsService.getReviewsByProduct(productId, sortBy, filterRating),
        reviewsService.getReviewStats(productId)
      ]);

      setProduct(productData);
      setReviews(reviewsData);
      setStats(statsData);

      // Verificar se o usuário já avaliou
      if (currentUser) {
        const existingReview = reviewsData.find(r => r.user_id === currentUser.id);
        setUserReview(existingReview || null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  }, [productId, sortBy, filterRating, currentUser]);

  useEffect(() => {
    if (productId) {
      loadData();
    }
    loadCurrentUser();
  }, [productId, loadData]);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const loadData = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const [productData, reviewsData, statsData] = await Promise.all([
        productsService.getProductById(productId),
        reviewsService.getProductReviews(productId),
        reviewsService.getProductReviewStats(productId)
      ]);

      setProduct(productData);
      setReviews(reviewsData);
      setStats(statsData);

      // Verificar se o usuário já avaliou
      if (currentUser) {
        const existingReview = reviewsData.find(r => r.user_id === currentUser.id);
        setUserReview(existingReview || null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Você precisa estar logado para avaliar');
      return;
    }

    if (!productId) return;

    setSubmitting(true);
    try {
      if (userReview) {
        // Atualizar avaliação existente
        await reviewsService.updateReview(userReview.id, {
          rating: formData.rating,
          comment: formData.comment
        });
        toast.success('Avaliação atualizada com sucesso!');
      } else {
        // Criar nova avaliação
        await reviewsService.createReview({
          product_id: productId,
          user_id: currentUser.id,
          rating: formData.rating,
          comment: formData.comment
        });
        toast.success('Avaliação enviada com sucesso!');
      }
      
      setShowForm(false);
      loadData(); // Recarregar dados
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Tem certeza que deseja excluir sua avaliação?')) return;
    
    try {
      await reviewsService.deleteReview(reviewId);
      toast.success('Avaliação excluída com sucesso!');
      loadData();
    } catch {
      toast.error('Erro ao excluir avaliação');
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${
              interactive ? 'cursor-pointer hover:text-yellow-400' : ''
            }`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  const filteredAndSortedReviews = reviews
    .filter(review => filterRating ? review.rating === filterRating : true)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'rating_high':
          return b.rating - a.rating;
        case 'rating_low':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando avaliações...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h2>
          <button
            onClick={() => navigate('/store')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Voltar à Loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header do Produto */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start space-x-6">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {renderStars(stats?.average_rating || 0)}
                  <span className="text-lg font-semibold text-gray-900">
                    {stats?.average_rating || 0}
                  </span>
                  <span className="text-gray-500">
                    ({stats?.total_reviews || 0} avaliações)
                  </span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  R$ {product.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas das Avaliações */}
        {stats && stats.total_reviews > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Distribuição das Avaliações</h2>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_distribution[rating as keyof typeof stats.rating_distribution];
                const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botão para Avaliar */}
        {currentUser && !userReview && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Compartilhe sua experiência
              </h3>
              <p className="text-gray-600 mb-4">
                Ajude outros clientes com sua avaliação deste produto
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Escrever Avaliação</span>
              </button>
            </div>
          </div>
        )}

        {/* Avaliação do Usuário */}
        {userReview && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sua Avaliação</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setFormData({
                      rating: userReview.rating,
                      comment: userReview.comment
                    });
                    setShowForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteReview(userReview.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              {renderStars(userReview.rating)}
              <span className="text-sm text-gray-500">
                {new Date(userReview.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <p className="text-gray-700">{userReview.comment}</p>
          </div>
        )}

        {/* Formulário de Avaliação */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {userReview ? 'Editar Avaliação' : 'Nova Avaliação'}
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sua nota
                </label>
                {renderStars(formData.rating, true, (rating) => 
                  setFormData(prev => ({ ...prev, rating }))
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentário
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Conte sobre sua experiência com este produto..."
                  required
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : userReview ? 'Atualizar' : 'Enviar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtros e Ordenação */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={filterRating || ''}
                    onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Todas as notas</option>
                    <option value="5">5 estrelas</option>
                    <option value="4">4 estrelas</option>
                    <option value="3">3 estrelas</option>
                    <option value="2">2 estrelas</option>
                    <option value="1">1 estrela</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Sort className="w-5 h-5 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'rating_high' | 'rating_low')}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="newest">Mais recentes</option>
                    <option value="oldest">Mais antigas</option>
                    <option value="rating_high">Maior nota</option>
                    <option value="rating_low">Menor nota</option>
                  </select>
                </div>
              </div>
              
              <span className="text-sm text-gray-600">
                {filteredAndSortedReviews.length} de {reviews.length} avaliações
              </span>
            </div>
          </div>
        )}

        {/* Lista de Avaliações */}
        <div className="space-y-6">
          {filteredAndSortedReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filterRating ? 'Nenhuma avaliação encontrada' : 'Seja o primeiro a avaliar'}
              </h3>
              <p className="text-gray-600 mb-6">
                {filterRating 
                  ? 'Tente ajustar os filtros para ver mais avaliações'
                  : 'Compartilhe sua experiência e ajude outros clientes'
                }
              </p>
              {!currentUser && (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Fazer Login para Avaliar
                </button>
              )}
            </div>
          ) : (
            filteredAndSortedReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {review.user_name || 'Usuário Anônimo'}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;