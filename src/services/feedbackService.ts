import { supabase } from '../lib/supabase';
import { mockFeedbacks, getFeedbacksByType, getHighRatingFeedbacks, getRecentFeedbacks, getFeedbackStats, type FeedbackData } from '../data/mockFeedback';
import { logger } from '../lib/logger';

// Interface para feedback do banco de dados
interface DatabaseFeedback {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  type: 'service' | 'product' | 'app' | 'support';
  rating: number | null;
  title: string | null;
  comment: string | null;
  category: string | null;
  status: 'pending' | 'in_review' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  resolved_at: string | null;
  resolution: string | null;
  metadata: any;
}

// Função para converter feedback do banco para o formato da aplicação
const convertDatabaseFeedback = (dbFeedback: DatabaseFeedback): FeedbackData => {
  return {
    id: dbFeedback.id,
    type: dbFeedback.type as 'service' | 'product' | 'app',
    rating: dbFeedback.rating || 5,
    title: dbFeedback.title || 'Feedback sem título',
    comment: dbFeedback.comment || 'Sem comentário',
    status: dbFeedback.status as 'pending' | 'resolved' | 'closed',
    priority: dbFeedback.priority as 'low' | 'medium' | 'high',
    created_at: dbFeedback.created_at,
    user_name: 'Usuário' // Nome genérico já que não temos join com profiles
  };
};

export const feedbackService = {
  // Buscar todos os feedbacks (tenta banco primeiro, depois mock)
  async getAllFeedbacks(): Promise<FeedbackData[]> {
    try {
      logger.info('Tentando buscar feedbacks do banco de dados', {}, 'FEEDBACK');
      
      const { data, error } = await supabase
        .from('feedback_pet')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        logger.warn('Erro ao buscar feedbacks do banco, usando dados mock', { error }, 'FEEDBACK');
        return mockFeedbacks;
      }
      
      if (!data || data.length === 0) {
        logger.info('Nenhum feedback encontrado no banco, usando dados mock', {}, 'FEEDBACK');
        return mockFeedbacks;
      }
      
      logger.info(`${data.length} feedbacks encontrados no banco`, {}, 'FEEDBACK');
      return data.map(convertDatabaseFeedback);
      
    } catch (error) {
      logger.error('Erro ao buscar feedbacks', error as Error, {}, 'FEEDBACK');
      return mockFeedbacks;
    }
  },
  
  // Buscar feedbacks por tipo
  async getFeedbacksByType(type?: 'service' | 'product' | 'app'): Promise<FeedbackData[]> {
    try {
      const allFeedbacks = await this.getAllFeedbacks();
      
      if (!type) return allFeedbacks;
      
      return allFeedbacks.filter(feedback => feedback.type === type);
      
    } catch (error) {
      logger.error('Erro ao buscar feedbacks por tipo', error as Error, { type }, 'FEEDBACK');
      return getFeedbacksByType(type);
    }
  },
  
  // Buscar feedbacks com rating alto (4-5 estrelas)
  async getHighRatingFeedbacks(): Promise<FeedbackData[]> {
    try {
      const allFeedbacks = await this.getAllFeedbacks();
      return allFeedbacks.filter(feedback => feedback.rating >= 4);
      
    } catch (error) {
      logger.error('Erro ao buscar feedbacks com rating alto', error as Error, {}, 'FEEDBACK');
      return getHighRatingFeedbacks();
    }
  },
  
  // Buscar feedbacks recentes
  async getRecentFeedbacks(days: number = 30): Promise<FeedbackData[]> {
    try {
      const allFeedbacks = await this.getAllFeedbacks();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return allFeedbacks.filter(feedback => {
        const feedbackDate = new Date(feedback.created_at);
        return feedbackDate >= cutoffDate;
      });
      
    } catch (error) {
      logger.error('Erro ao buscar feedbacks recentes', error as Error, { days }, 'FEEDBACK');
      return getRecentFeedbacks(days);
    }
  },
  
  // Obter estatísticas dos feedbacks
  async getFeedbackStats() {
    try {
      const allFeedbacks = await this.getAllFeedbacks();
      
      if (allFeedbacks.length === 0) {
        return getFeedbackStats();
      }
      
      const total = allFeedbacks.length;
      const avgRating = allFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / total;
      
      const byType = {
        service: allFeedbacks.filter(f => f.type === 'service').length,
        product: allFeedbacks.filter(f => f.type === 'product').length,
        app: allFeedbacks.filter(f => f.type === 'app').length
      };
      
      const byRating = {
        5: allFeedbacks.filter(f => f.rating === 5).length,
        4: allFeedbacks.filter(f => f.rating === 4).length,
        3: allFeedbacks.filter(f => f.rating === 3).length,
        2: allFeedbacks.filter(f => f.rating === 2).length,
        1: allFeedbacks.filter(f => f.rating === 1).length
      };
      
      return {
        total,
        avgRating: Math.round(avgRating * 10) / 10,
        byType,
        byRating
      };
      
    } catch (error) {
      logger.error('Erro ao calcular estatísticas dos feedbacks', error as Error, {}, 'FEEDBACK');
      return getFeedbackStats();
    }
  },
  
  // Buscar feedbacks para exibir na home (apenas os melhores)
  async getFeedbacksForHome(limit: number = 6): Promise<FeedbackData[]> {
    try {
      const highRatingFeedbacks = await this.getHighRatingFeedbacks();
      
      // Filtrar apenas feedbacks resolvidos e com comentários
      const qualityFeedbacks = highRatingFeedbacks
        .filter(feedback => 
          feedback.status === 'resolved' && 
          feedback.comment && 
          feedback.comment.length > 20
        )
        .sort((a, b) => {
          // Ordenar por rating (desc) e depois por data (desc)
          if (a.rating !== b.rating) {
            return b.rating - a.rating;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
        .slice(0, limit);
      
      logger.info(`${qualityFeedbacks.length} feedbacks selecionados para a home`, {}, 'FEEDBACK');
      return qualityFeedbacks;
      
    } catch (error) {
      logger.error('Erro ao buscar feedbacks para a home', error as Error, { limit }, 'FEEDBACK');
      // Fallback para dados mock
      return getHighRatingFeedbacks().slice(0, limit);
    }
  },
  
  // Criar novo feedback
  async createFeedback(feedbackData: Omit<FeedbackData, 'id' | 'created_at'>): Promise<FeedbackData | null> {
    try {
      logger.info('Tentando criar novo feedback', { type: feedbackData.type }, 'FEEDBACK');
      
      const { data, error } = await supabase
        .from('feedback_pet')
        .insert([
          {
            type: feedbackData.type,
            rating: feedbackData.rating,
            title: feedbackData.title,
            comment: feedbackData.comment,
            status: feedbackData.status || 'pending',
            priority: feedbackData.priority || 'medium'
          }
        ])
        .select('*')
        .single();
      
      if (error) {
        logger.error('Erro ao criar feedback no banco', error, feedbackData, 'FEEDBACK');
        return null;
      }
      
      logger.info('Feedback criado com sucesso', { id: data.id }, 'FEEDBACK');
      return convertDatabaseFeedback(data);
      
    } catch (error) {
      logger.error('Erro ao criar feedback', error as Error, feedbackData, 'FEEDBACK');
      return null;
    }
  }
};