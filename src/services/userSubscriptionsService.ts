import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type UserSubscription = Database['public']['Tables']['user_subscriptions_pet']['Row'];
type UserSubscriptionInsert = Database['public']['Tables']['user_subscriptions_pet']['Insert'];
type UserSubscriptionUpdate = Database['public']['Tables']['user_subscriptions_pet']['Update'];

export class UserSubscriptionsService {
  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .select(`
        *,
        subscription_plans_pet (
          id,
          name,
          description,
          features,
          max_pets,
          max_appointments,
          max_products_discount,
          free_delivery,
          priority_support
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar assinaturas do usuário: ${error.message}`);
    }

    return data || [];
  }

  async getActiveSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .select(`
        *,
        subscription_plans_pet (
          id,
          name,
          description,
          features,
          max_pets,
          max_appointments,
          max_products_discount,
          free_delivery,
          priority_support
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar assinatura ativa: ${error.message}`);
    }

    return data;
  }

  async createSubscription(subscription: UserSubscriptionInsert): Promise<UserSubscription> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .insert(subscription)
      .select(`
        *,
        subscription_plans_pet (
          id,
          name,
          description,
          features,
          max_pets,
          max_appointments,
          max_products_discount,
          free_delivery,
          priority_support
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar assinatura: ${error.message}`);
    }

    return data;
  }

  async updateSubscription(subscriptionId: string, updates: UserSubscriptionUpdate): Promise<UserSubscription> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .update(updates)
      .eq('id', subscriptionId)
      .select(`
        *,
        subscription_plans_pet (
          id,
          name,
          description,
          features,
          max_pets,
          max_appointments,
          max_products_discount,
          free_delivery,
          priority_support
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
    }

    return data;
  }

  async cancelSubscription(subscriptionId: string, reason?: string): Promise<UserSubscription> {
    return this.updateSubscription(subscriptionId, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
      auto_renew: false
    });
  }

  async pauseSubscription(subscriptionId: string): Promise<UserSubscription> {
    return this.updateSubscription(subscriptionId, {
      status: 'paused',
      auto_renew: false
    });
  }

  async resumeSubscription(subscriptionId: string): Promise<UserSubscription> {
    return this.updateSubscription(subscriptionId, {
      status: 'active',
      auto_renew: true
    });
  }

  async upgradeSubscription(subscriptionId: string, newPlanId: string): Promise<UserSubscription> {
    // Buscar o novo plano
    const { data: newPlan, error: planError } = await supabase
      .from('subscription_plans_pet')
      .select('price, billing_cycle')
      .eq('id', newPlanId)
      .single();

    if (planError || !newPlan) {
      throw new Error('Plano não encontrado');
    }

    return this.updateSubscription(subscriptionId, {
      plan_id: newPlanId,
      price: newPlan.price,
      billing_cycle: newPlan.billing_cycle
    });
  }

  async downgradeSubscription(subscriptionId: string, newPlanId: string): Promise<UserSubscription> {
    // Buscar o novo plano
    const { data: newPlan, error: planError } = await supabase
      .from('subscription_plans_pet')
      .select('price, billing_cycle')
      .eq('id', newPlanId)
      .single();

    if (planError || !newPlan) {
      throw new Error('Plano não encontrado');
    }

    return this.updateSubscription(subscriptionId, {
      plan_id: newPlanId,
      price: newPlan.price,
      billing_cycle: newPlan.billing_cycle
    });
  }

  async getSubscriptionById(subscriptionId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .select(`
        *,
        subscription_plans_pet (
          id,
          name,
          description,
          features,
          max_pets,
          max_appointments,
          max_products_discount,
          free_delivery,
          priority_support
        )
      `)
      .eq('id', subscriptionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar assinatura: ${error.message}`);
    }

    return data;
  }

  async getSubscriptionsByStatus(status: string): Promise<UserSubscription[]> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .select(`
        *,
        subscription_plans_pet (
          id,
          name,
          description,
          features,
          max_pets,
          max_appointments,
          max_products_discount,
          free_delivery,
          priority_support
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar assinaturas por status: ${error.message}`);
    }

    return data || [];
  }

  async getExpiringSubscriptions(days: number = 7): Promise<UserSubscription[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .select(`
        *,
        subscription_plans_pet (
          id,
          name,
          description,
          features,
          max_pets,
          max_appointments,
          max_products_discount,
          free_delivery,
          priority_support
        )
      `)
      .eq('status', 'active')
      .lte('next_billing_date', futureDate.toISOString())
      .order('next_billing_date', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar assinaturas expirando: ${error.message}`);
    }

    return data || [];
  }

  async getSubscriptionStats(userId: string): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalSpent: number;
    averageMonthlySpend: number;
  }> {
    const subscriptions = await this.getUserSubscriptions(userId);
    
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
    const totalSpent = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    
    // Calcular gasto médio mensal
    const monthlySubscriptions = subscriptions.filter(sub => sub.billing_cycle === 'monthly');
    const averageMonthlySpend = monthlySubscriptions.length > 0 
      ? monthlySubscriptions.reduce((sum, sub) => sum + sub.price, 0) / monthlySubscriptions.length 
      : 0;

    return {
      totalSubscriptions,
      activeSubscriptions,
      totalSpent,
      averageMonthlySpend
    };
  }

  async checkSubscriptionLimits(userId: string): Promise<{
    canAddPet: boolean;
    canScheduleAppointment: boolean;
    remainingPets: number;
    remainingAppointments: number;
  }> {
    const activeSubscription = await this.getActiveSubscription(userId);
    
    if (!activeSubscription) {
      return {
        canAddPet: false,
        canScheduleAppointment: false,
        remainingPets: 0,
        remainingAppointments: 0
      };
    }

    const plan = activeSubscription.subscription_plans_pet as any;
    
    // Buscar contagem atual de pets do usuário
    const { count: petsCount } = await supabase
      .from('pets_pet')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Buscar contagem atual de agendamentos do usuário
    const { count: appointmentsCount } = await supabase
      .from('appointments_pet')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const remainingPets = Math.max(0, plan.max_pets - (petsCount || 0));
    const remainingAppointments = Math.max(0, plan.max_appointments - (appointmentsCount || 0));

    return {
      canAddPet: remainingPets > 0,
      canScheduleAppointment: remainingAppointments > 0,
      remainingPets,
      remainingAppointments
    };
  }

  async renewSubscription(subscriptionId: string): Promise<UserSubscription> {
    const subscription = await this.getSubscriptionById(subscriptionId);
    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }

    const nextBillingDate = new Date();
    if (subscription.billing_cycle === 'monthly') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (subscription.billing_cycle === 'quarterly') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
    } else if (subscription.billing_cycle === 'yearly') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    return this.updateSubscription(subscriptionId, {
      status: 'active',
      next_billing_date: nextBillingDate.toISOString(),
      auto_renew: true
    });
  }

  async getSubscriptionHistory(userId: string): Promise<UserSubscription[]> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .select(`
        *,
        subscription_plans_pet (
          id,
          name,
          description,
          features,
          max_pets,
          max_appointments,
          max_products_discount,
          free_delivery,
          priority_support
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar histórico de assinaturas: ${error.message}`);
    }

    return data || [];
  }
}

export const userSubscriptionsService = new UserSubscriptionsService();
export type { UserSubscription, UserSubscriptionInsert, UserSubscriptionUpdate };
