import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type FAQ = Database['public']['Tables']['faq_pet']['Row'];
type FAQInsert = Database['public']['Tables']['faq_pet']['Insert'];
type FAQUpdate = Database['public']['Tables']['faq_pet']['Update'];

type HelpArticle = Database['public']['Tables']['help_articles_pet']['Row'];
type HelpArticleInsert = Database['public']['Tables']['help_articles_pet']['Insert'];
type HelpArticleUpdate = Database['public']['Tables']['help_articles_pet']['Update'];

type Feedback = Database['public']['Tables']['feedback_pet']['Row'];
type FeedbackInsert = Database['public']['Tables']['feedback_pet']['Insert'];
type FeedbackUpdate = Database['public']['Tables']['feedback_pet']['Update'];

export class HelpService {
  // =============================================
  // FAQ METHODS
  // =============================================

  async getFAQs(category?: string): Promise<FAQ[]> {
    let query = supabase
      .from('faq_pet')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar FAQ: ${error.message}`);
    }

    return data || [];
  }

  async getFAQById(faqId: string): Promise<FAQ | null> {
    const { data, error } = await supabase
      .from('faq_pet')
      .select('*')
      .eq('id', faqId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar FAQ: ${error.message}`);
    }

    return data;
  }

  async createFAQ(faq: FAQInsert): Promise<FAQ> {
    const { data, error } = await supabase
      .from('faq_pet')
      .insert(faq)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar FAQ: ${error.message}`);
    }

    return data;
  }

  async updateFAQ(faqId: string, updates: FAQUpdate): Promise<FAQ> {
    const { data, error } = await supabase
      .from('faq_pet')
      .update(updates)
      .eq('id', faqId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar FAQ: ${error.message}`);
    }

    return data;
  }

  async deleteFAQ(faqId: string): Promise<void> {
    const { error } = await supabase
      .from('faq_pet')
      .delete()
      .eq('id', faqId);

    if (error) {
      throw new Error(`Erro ao deletar FAQ: ${error.message}`);
    }
  }

  async incrementFAQViewCount(faqId: string): Promise<void> {
    const { error } = await supabase
      .from('faq_pet')
      .update({ view_count: supabase.raw('view_count + 1') })
      .eq('id', faqId);

    if (error) {
      throw new Error(`Erro ao incrementar visualizações: ${error.message}`);
    }
  }

  async markFAQAsHelpful(faqId: string): Promise<void> {
    const { error } = await supabase
      .from('faq_pet')
      .update({ helpful_count: supabase.raw('helpful_count + 1') })
      .eq('id', faqId);

    if (error) {
      throw new Error(`Erro ao marcar FAQ como útil: ${error.message}`);
    }
  }

  async searchFAQs(query: string): Promise<FAQ[]> {
    const { data, error } = await supabase
      .from('faq_pet')
      .select('*')
      .eq('is_active', true)
      .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
      .order('helpful_count', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar FAQ: ${error.message}`);
    }

    return data || [];
  }

  async getFAQCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('faq_pet')
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null);

    if (error) {
      throw new Error(`Erro ao buscar categorias de FAQ: ${error.message}`);
    }

    const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
    return categories;
  }

  // =============================================
  // HELP ARTICLES METHODS
  // =============================================

  async getHelpArticles(category?: string, published: boolean = true): Promise<HelpArticle[]> {
    let query = supabase
      .from('help_articles_pet')
      .select(`
        *,
        profiles_pet!help_articles_pet_author_id_fkey (
          id,
          full_name
        )
      `)
      .order('published_at', { ascending: false });

    if (published) {
      query = query.eq('is_published', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar artigos de ajuda: ${error.message}`);
    }

    return data || [];
  }

  async getRandomTip(): Promise<HelpArticle | null> {
    // Primeiro, busca todos os artigos publicados (sem relacionamento com profiles)
    const { data: articles, error: fetchError } = await supabase
      .from('help_articles_pet')
      .select('*')
      .eq('is_published', true);

    if (fetchError) {
      throw new Error(`Erro ao buscar artigos: ${fetchError.message}`);
    }

    if (!articles || articles.length === 0) {
      return null;
    }

    // Seleciona um artigo aleatório
    const randomIndex = Math.floor(Math.random() * articles.length);
    return articles[randomIndex];
  }

  async getHelpArticleBySlug(slug: string): Promise<HelpArticle | null> {
    const { data, error } = await supabase
      .from('help_articles_pet')
      .select(`
        *,
        profiles_pet!help_articles_pet_author_id_fkey (
          id,
          full_name
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar artigo de ajuda: ${error.message}`);
    }

    return data;
  }

  async createHelpArticle(article: HelpArticleInsert): Promise<HelpArticle> {
    const { data, error } = await supabase
      .from('help_articles_pet')
      .insert(article)
      .select(`
        *,
        profiles_pet!help_articles_pet_author_id_fkey (
          id,
          full_name
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar artigo de ajuda: ${error.message}`);
    }

    return data;
  }

  async updateHelpArticle(articleId: string, updates: HelpArticleUpdate): Promise<HelpArticle> {
    const { data, error } = await supabase
      .from('help_articles_pet')
      .update(updates)
      .eq('id', articleId)
      .select(`
        *,
        profiles_pet!help_articles_pet_author_id_fkey (
          id,
          full_name
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar artigo de ajuda: ${error.message}`);
    }

    return data;
  }

  async deleteHelpArticle(articleId: string): Promise<void> {
    const { error } = await supabase
      .from('help_articles_pet')
      .delete()
      .eq('id', articleId);

    if (error) {
      throw new Error(`Erro ao deletar artigo de ajuda: ${error.message}`);
    }
  }

  async publishHelpArticle(articleId: string): Promise<HelpArticle> {
    return this.updateHelpArticle(articleId, {
      is_published: true,
      published_at: new Date().toISOString()
    });
  }

  async unpublishHelpArticle(articleId: string): Promise<HelpArticle> {
    return this.updateHelpArticle(articleId, {
      is_published: false,
      published_at: null
    });
  }

  async incrementArticleViewCount(articleId: string): Promise<void> {
    const { error } = await supabase
      .from('help_articles_pet')
      .update({ view_count: supabase.raw('view_count + 1') })
      .eq('id', articleId);

    if (error) {
      throw new Error(`Erro ao incrementar visualizações: ${error.message}`);
    }
  }

  async markArticleAsHelpful(articleId: string): Promise<void> {
    const { error } = await supabase
      .from('help_articles_pet')
      .update({ helpful_count: supabase.raw('helpful_count + 1') })
      .eq('id', articleId);

    if (error) {
      throw new Error(`Erro ao marcar artigo como útil: ${error.message}`);
    }
  }

  async searchHelpArticles(query: string): Promise<HelpArticle[]> {
    const { data, error } = await supabase
      .from('help_articles_pet')
      .select(`
        *,
        profiles_pet!help_articles_pet_author_id_fkey (
          id,
          full_name
        )
      `)
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order('helpful_count', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar artigos de ajuda: ${error.message}`);
    }

    return data || [];
  }

  async getHelpArticleCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('help_articles_pet')
      .select('category')
      .eq('is_published', true)
      .not('category', 'is', null);

    if (error) {
      throw new Error(`Erro ao buscar categorias de artigos: ${error.message}`);
    }

    const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
    return categories;
  }

  // =============================================
  // FEEDBACK METHODS
  // =============================================

  async getFeedback(userId: string): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedback_pet')
      .select(`
        *,
        profiles_pet!feedback_pet_assigned_to_fkey (
          id,
          full_name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar feedback: ${error.message}`);
    }

    return data || [];
  }

  async createFeedback(feedback: FeedbackInsert): Promise<Feedback> {
    const { data, error } = await supabase
      .from('feedback_pet')
      .insert(feedback)
      .select(`
        *,
        profiles_pet!feedback_pet_assigned_to_fkey (
          id,
          full_name
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar feedback: ${error.message}`);
    }

    return data;
  }

  async updateFeedback(feedbackId: string, updates: FeedbackUpdate): Promise<Feedback> {
    const { data, error } = await supabase
      .from('feedback_pet')
      .update(updates)
      .eq('id', feedbackId)
      .select(`
        *,
        profiles_pet!feedback_pet_assigned_to_fkey (
          id,
          full_name
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar feedback: ${error.message}`);
    }

    return data;
  }

  async resolveFeedback(feedbackId: string, resolution: string, resolvedBy: string): Promise<Feedback> {
    return this.updateFeedback(feedbackId, {
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolution,
      assigned_to: resolvedBy
    });
  }

  async getFeedbackByStatus(status: string): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedback_pet')
      .select(`
        *,
        profiles_pet!feedback_pet_user_id_fkey (
          id,
          full_name,
          email
        ),
        profiles_pet!feedback_pet_assigned_to_fkey (
          id,
          full_name
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar feedback por status: ${error.message}`);
    }

    return data || [];
  }

  async getFeedbackStats(): Promise<{
    total: number;
    pending: number;
    inReview: number;
    resolved: number;
    closed: number;
  }> {
    const { data, error } = await supabase
      .from('feedback_pet')
      .select('status');

    if (error) {
      throw new Error(`Erro ao buscar estatísticas de feedback: ${error.message}`);
    }

    const stats = {
      total: data?.length || 0,
      pending: 0,
      inReview: 0,
      resolved: 0,
      closed: 0
    };

    data?.forEach(feedback => {
      switch (feedback.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'in_review':
          stats.inReview++;
          break;
        case 'resolved':
          stats.resolved++;
          break;
        case 'closed':
          stats.closed++;
          break;
      }
    });

    return stats;
  }

  // =============================================
  // SEARCH METHODS
  // =============================================

  async searchAll(query: string): Promise<{
    faqs: FAQ[];
    articles: HelpArticle[];
  }> {
    const [faqs, articles] = await Promise.all([
      this.searchFAQs(query),
      this.searchHelpArticles(query)
    ]);

    return { faqs, articles };
  }

  async getPopularContent(): Promise<{
    popularFAQs: FAQ[];
    popularArticles: HelpArticle[];
  }> {
    const [popularFAQs, popularArticles] = await Promise.all([
      supabase
        .from('faq_pet')
        .select('*')
        .eq('is_active', true)
        .order('helpful_count', { ascending: false })
        .limit(5),
      supabase
        .from('help_articles_pet')
        .select(`
          *,
          profiles_pet!help_articles_pet_author_id_fkey (
            id,
            full_name
          )
        `)
        .eq('is_published', true)
        .order('helpful_count', { ascending: false })
        .limit(5)
    ]);

    if (popularFAQs.error) {
      throw new Error(`Erro ao buscar FAQs populares: ${popularFAQs.error.message}`);
    }

    if (popularArticles.error) {
      throw new Error(`Erro ao buscar artigos populares: ${popularArticles.error.message}`);
    }

    return {
      popularFAQs: popularFAQs.data || [],
      popularArticles: popularArticles.data || []
    };
  }
}

export const helpService = new HelpService();
export type { FAQ, FAQInsert, FAQUpdate, HelpArticle, HelpArticleInsert, HelpArticleUpdate, Feedback, FeedbackInsert, FeedbackUpdate };
