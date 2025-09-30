import { supabase } from '../lib/supabase';

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

class ReviewsService {
  // Buscar avaliações de um produto
  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (
            name,
            email
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(review => ({
        ...review,
        user_name: review.profiles?.name || 'Usuário Anônimo',
        user_email: review.profiles?.email
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      return [];
    }
  }

  // Buscar estatísticas de avaliações de um produto
  async getProductReviewStats(productId: string): Promise<ReviewStats> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);

      if (error) throw error;

      const reviews = data || [];
      const totalReviews = reviews.length;

      if (totalReviews === 0) {
        return {
          average_rating: 0,
          total_reviews: 0,
          rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }

      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = sum / totalReviews;

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        distribution[review.rating as keyof typeof distribution]++;
      });

      return {
        average_rating: Number(averageRating.toFixed(1)),
        total_reviews: totalReviews,
        rating_distribution: distribution
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de avaliações:', error);
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
  }

  // Criar nova avaliação
  async createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review | null> {
    try {
      // Verificar se o usuário já avaliou este produto
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', review.product_id)
        .eq('user_id', review.user_id)
        .single();

      if (existingReview) {
        throw new Error('Você já avaliou este produto');
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: review.product_id,
          user_id: review.user_id,
          rating: review.rating,
          comment: review.comment
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      throw error;
    }
  }

  // Atualizar avaliação
  async updateReview(reviewId: string, updates: Partial<Pick<Review, 'rating' | 'comment'>>): Promise<Review | null> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      throw error;
    }
  }

  // Deletar avaliação
  async deleteReview(reviewId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);
      return false;
    }
  }

  // Buscar avaliações do usuário
  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          products:product_id (
            name,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar avaliações do usuário:', error);
      return [];
    }
  }
}

export const reviewsService = new ReviewsService();