import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ThumbsUp, 
  MessageCircle, 
  User, 
  Edit3, 
  Trash2,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { reviewsService, type Review, type ReviewStats } from '../services/reviewsService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

interface CreateReviewData {
  product_id: string;
  rating: number;
  title: string;
  comment: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateReviewData>({
    product_id: productId,
    rating: 5,
    title: '',
    comment: ''
  });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        reviewsService.getProductReviews(productId),
        reviewsService.getProductReviewStats(productId)
      ]);
      
      // Buscar avaliação do usuário nos dados retornados
      const userReviewData = user ? reviewsData.find(review => review.user_id === user.id) || null : null;

      setReviews(reviewsData);
      setReviewStats(statsData);
      setUserReview(userReviewData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      setError(null);

      if (userReview) {
        // Atualizar avaliação existente
        const updatedReview = await reviewsService.updateReview(userReview.id, user.id, {
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment
        });
        setUserReview(updatedReview);
        setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r));
      } else {
        // Criar nova avaliação
        const newReview = await reviewsService.createReview(formData, user.id);
        setUserReview(newReview);
        setReviews(prev => [newReview, ...prev]);
      }

      // Recarregar estatísticas
      const newStats = await reviewsService.getProductReviewStats(productId);
      setReviewStats(newStats);

      setShowReviewForm(false);
      setFormData({
        product_id: productId,
        rating: 5,
        title: '',
        comment: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar avaliação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!user || !userReview) return;

    try {
      await reviewsService.deleteReview(userReview.id, user.id);
      setUserReview(null);
      setReviews(prev => prev.filter(r => r.id !== userReview.id));
      
      // Recarregar estatísticas
      const newStats = await reviewsService.getProductReviewStats(productId);
      setReviewStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir avaliação');
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      // TODO: Implementar método markReviewHelpful no reviewsService
      console.log('Marcar como útil:', reviewId);
      // await reviewsService.markReviewHelpful(reviewId);
      // setReviews(prev => prev.map(r => 
      //   r.id === reviewId 
      //     ? { ...r, helpful_count: r.helpful_count + 1 }
      //     : r
      // ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar como útil');
    }
  };

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!reviewStats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = reviewStats.rating_distribution[rating] || 0;
          const percentage = reviewStats.total_reviews > 0 
            ? (count / reviewStats.total_reviews) * 100 
            : 0;

          return (
            <div key={rating} className="flex items-center space-x-2 text-sm">
              <span className="w-8">{rating}</span>
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-text-color">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-accent/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-accent/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-text-color-dark flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Avaliações dos Clientes
        </h3>
        {user && !userReview && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Avaliar Produto
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Estatísticas de Avaliações */}
      {reviewStats && reviewStats.total_reviews > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mb-6 p-4 bg-surface rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-text-color-dark mb-2">
              {reviewStats.average_rating}
            </div>
            {renderStars(reviewStats.average_rating, 'w-6 h-6')}
            <div className="text-sm text-text-color mt-2">
              Baseado em {reviewStats.total_reviews} avaliações
            </div>
          </div>
          <div>
            <h4 className="font-medium text-text-color-dark mb-3">Distribuição das Avaliações</h4>
            {renderRatingDistribution()}
          </div>
        </div>
      )}

      {/* Formulário de Avaliação */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-surface rounded-lg border border-accent/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-text-color-dark">
                {userReview ? 'Editar Avaliação' : 'Avaliar Produto'}
              </h4>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-text-color hover:text-text-color-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-color-dark mb-2">
                  Avaliação
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= formData.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-text-color">
                    {formData.rating} de 5 estrelas
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-color-dark mb-2">
                  Título da Avaliação
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Resuma sua experiência com o produto"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-color-dark mb-2">
                  Comentário
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Conte-nos mais sobre sua experiência com este produto"
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Salvando...' : (userReview ? 'Atualizar' : 'Publicar')} Avaliação
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="text-text-color hover:text-text-color-dark px-4 py-2"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avaliação do Usuário */}
      {userReview && (
        <div className="mb-6 p-4 bg-primary-light/10 border border-primary/20 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-text-color-dark">Sua Avaliação</div>
                <div className="flex items-center space-x-2">
                  {renderStars(userReview.rating)}
                  {userReview.is_verified_purchase && (
                    <div className="flex items-center text-green-600 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Compra Verificada
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setFormData({
                    product_id: productId,
                    rating: userReview.rating,
                    title: userReview.title,
                    comment: userReview.comment
                  });
                  setShowReviewForm(true);
                }}
                className="text-text-color hover:text-primary"
                title="Editar avaliação"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteReview}
                className="text-text-color hover:text-red-600"
                title="Excluir avaliação"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h4 className="font-medium text-text-color-dark mb-2">{userReview.title}</h4>
          <p className="text-text-color text-sm mb-2">{userReview.comment}</p>
          <div className="text-xs text-text-color">
            {formatDistanceToNow(new Date(userReview.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </div>
        </div>
      )}

      {/* Lista de Avaliações */}
      <div className="space-y-4">
        {reviews.filter(review => review.id !== userReview?.id).map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-accent/20 pb-4 last:border-b-0"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                {review.user_avatar ? (
                  <img 
                    src={review.user_avatar} 
                    alt={review.user_name} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-text-color" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-text-color-dark">{review.user_name}</div>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      {review.is_verified_purchase && (
                        <div className="flex items-center text-green-600 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Compra Verificada
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-text-color">
                    {formatDistanceToNow(new Date(review.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </div>
                </div>
                <h4 className="font-medium text-text-color-dark mb-2">{review.title}</h4>
                <p className="text-text-color text-sm mb-3">{review.comment}</p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleMarkHelpful(review.id)}
                    className="flex items-center space-x-1 text-text-color hover:text-primary text-sm"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Útil</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-text-color mx-auto mb-4" />
          <p className="text-text-color">
            Seja o primeiro a avaliar este produto!
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;