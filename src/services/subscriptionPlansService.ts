import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type SubscriptionPlan = Database['public']['Tables']['subscription_plans_pet']['Row'];
type SubscriptionPlanInsert = Database['public']['Tables']['subscription_plans_pet']['Insert'];
type SubscriptionPlanUpdate = Database['public']['Tables']['subscription_plans_pet']['Update'];

export class SubscriptionPlansService {
  async getActivePlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans_pet')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar planos de assinatura: ${error.message}`);
    }

    return data || [];
  }

  async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
    const { data, error } = await supabase
      .from('subscription_plans_pet')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar plano de assinatura: ${error.message}`);
    }

    return data;
  }

  async getPlansByBillingCycle(billingCycle: string): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans_pet')
      .select('*')
      .eq('is_active', true)
      .eq('billing_cycle', billingCycle)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar planos por ciclo de cobrança: ${error.message}`);
    }

    return data || [];
  }

  async createPlan(plan: SubscriptionPlanInsert): Promise<SubscriptionPlan> {
    const { data, error } = await supabase
      .from('subscription_plans_pet')
      .insert(plan)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar plano de assinatura: ${error.message}`);
    }

    return data;
  }

  async updatePlan(planId: string, updates: SubscriptionPlanUpdate): Promise<SubscriptionPlan> {
    const { data, error } = await supabase
      .from('subscription_plans_pet')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar plano de assinatura: ${error.message}`);
    }

    return data;
  }

  async deletePlan(planId: string): Promise<void> {
    const { error } = await supabase
      .from('subscription_plans_pet')
      .delete()
      .eq('id', planId);

    if (error) {
      throw new Error(`Erro ao deletar plano de assinatura: ${error.message}`);
    }
  }

  async togglePlanStatus(planId: string): Promise<SubscriptionPlan> {
    const { data: current, error: fetchError } = await supabase
      .from('subscription_plans_pet')
      .select('is_active')
      .eq('id', planId)
      .single();

    if (fetchError) {
      throw new Error(`Erro ao buscar status do plano: ${fetchError.message}`);
    }

    const { data, error } = await supabase
      .from('subscription_plans_pet')
      .update({ is_active: !current.is_active })
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao alterar status do plano: ${error.message}`);
    }

    return data;
  }

  async getPlanFeatures(planId: string): Promise<string[]> {
    const plan = await this.getPlanById(planId);
    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    return Array.isArray(plan.features) ? plan.features : [];
  }

  async comparePlans(planIds: string[]): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans_pet')
      .select('*')
      .in('id', planIds)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Erro ao comparar planos: ${error.message}`);
    }

    return data || [];
  }

  async getRecommendedPlan(userPetsCount: number, userAppointmentsCount: number): Promise<SubscriptionPlan | null> {
    const plans = await this.getActivePlans();
    
    // Encontrar o plano que melhor se adequa às necessidades do usuário
    const suitablePlans = plans.filter(plan => 
      plan.max_pets >= userPetsCount && 
      plan.max_appointments >= userAppointmentsCount
    );

    if (suitablePlans.length === 0) {
      return null;
    }

    // Retornar o plano mais barato que atende às necessidades
    return suitablePlans.reduce((cheapest, current) => 
      current.price < cheapest.price ? current : cheapest
    );
  }

  async getPlanStats(planId: string): Promise<{
    totalSubscribers: number;
    monthlyRevenue: number;
    averageSubscriptionDuration: number;
  }> {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions_pet')
      .select('price, start_date, status')
      .eq('plan_id', planId);

    if (error) {
      throw new Error(`Erro ao buscar estatísticas do plano: ${error.message}`);
    }

    const totalSubscribers = subscriptions?.length || 0;
    const monthlyRevenue = subscriptions?.reduce((sum, sub) => sum + sub.price, 0) || 0;
    
    // Calcular duração média das assinaturas
    const now = new Date();
    const durations = subscriptions?.map(sub => {
      const startDate = new Date(sub.start_date);
      return Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    }) || [];
    
    const averageSubscriptionDuration = durations.length > 0 
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
      : 0;

    return {
      totalSubscribers,
      monthlyRevenue,
      averageSubscriptionDuration
    };
  }

  async createBulkPlans(plans: SubscriptionPlanInsert[]): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans_pet')
      .insert(plans)
      .select();

    if (error) {
      throw new Error(`Erro ao criar planos em lote: ${error.message}`);
    }

    return data || [];
  }

  async duplicatePlan(planId: string, newName: string): Promise<SubscriptionPlan> {
    const originalPlan = await this.getPlanById(planId);
    if (!originalPlan) {
      throw new Error('Plano original não encontrado');
    }

    const duplicatedPlan: SubscriptionPlanInsert = {
      name: newName,
      description: originalPlan.description,
      price: originalPlan.price,
      billing_cycle: originalPlan.billing_cycle,
      features: originalPlan.features,
      max_pets: originalPlan.max_pets,
      max_appointments: originalPlan.max_appointments,
      max_products_discount: originalPlan.max_products_discount,
      free_delivery: originalPlan.free_delivery,
      priority_support: originalPlan.priority_support,
      is_active: false, // Inativo por padrão
      sort_order: originalPlan.sort_order + 1
    };

    return this.createPlan(duplicatedPlan);
  }
}

export const subscriptionPlansService = new SubscriptionPlansService();
export type { SubscriptionPlan, SubscriptionPlanInsert, SubscriptionPlanUpdate };
