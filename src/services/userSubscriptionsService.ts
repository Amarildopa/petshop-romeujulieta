import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type UserSubscription = Database['public']['Tables']['user_subscriptions_pet']['Row'];
type UserSubscriptionInsert = Database['public']['Tables']['user_subscriptions_pet']['Insert'];
type UserSubscriptionUpdate = Database['public']['Tables']['user_subscriptions_pet']['Update'];

export class UserSubscriptionsService {
  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Erro ao buscar assinaturas do usuário: ' + error.message);
    }

    return data || [];
  }

  async getActiveSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      throw new Error('Erro ao buscar assinatura ativa: ' + error.message);
    }

    // Se não há dados ou array vazio, retorna null
    if (!data || data.length === 0) {
      return null;
    }

    // Se há múltiplos registros, retorna o mais recente
    if (data.length > 1) {
      return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    }

    // Se há apenas um registro, retorna ele
    return data[0];
  }

  async createSubscription(subscription: UserSubscriptionInsert): Promise<UserSubscription> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .insert(subscription)
      .select()
      .single();

    if (error) {
      throw new Error('Erro ao criar assinatura: ' + error.message);
    }

    return data;
  }

  async updateSubscription(id: string, updates: UserSubscriptionUpdate): Promise<UserSubscription> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('Erro ao atualizar assinatura: ' + error.message);
    }

    return data;
  }

  async cancelSubscription(subscriptionId: string, reason?: string): Promise<UserSubscription> {
    const updates: UserSubscriptionUpdate = {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
      auto_renew: false
    };

    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error('Erro ao cancelar assinatura: ' + error.message);
    }

    return data;
  }

  async pauseSubscription(subscriptionId: string): Promise<UserSubscription> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .update({ status: 'paused' })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error('Erro ao pausar assinatura: ' + error.message);
    }

    return data;
  }

  async resumeSubscription(subscriptionId: string): Promise<UserSubscription> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .update({ status: 'active' })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error('Erro ao reativar assinatura: ' + error.message);
    }

    return data;
  }

  async upgradeSubscription(subscriptionId: string, newPlanType: string): Promise<UserSubscription> {
    // Atualizar diretamente na tabela subscriptions_pet
    return this.updateSubscription(subscriptionId, {
      plan_type: newPlanType as 'basic' | 'premium' | 'vip'
    });
  }

  async downgradeSubscription(subscriptionId: string, newPlanType: string): Promise<UserSubscription> {
    // Atualizar diretamente na tabela subscriptions_pet
    return this.updateSubscription(subscriptionId, {
      plan_type: newPlanType as 'basic' | 'premium' | 'vip'
    });
  }

  async getSubscriptionById(subscriptionId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error('Erro ao buscar assinatura: ' + error.message);
    }

    return data;
  }

  async getSubscriptionsByStatus(status: string): Promise<UserSubscription[]> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Erro ao buscar assinaturas por status: ' + error.message);
    }

    return data || [];
  }

  async getExpiringSubscriptions(days: number = 7): Promise<UserSubscription[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .select('*')
      .eq('status', 'active')
      .lte('next_billing_date', futureDate.toISOString())
      .order('next_billing_date', { ascending: true });

    if (error) {
      throw new Error('Erro ao buscar assinaturas expirando: ' + error.message);
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
    
    // Como a tabela subscriptions_pet não tem campo price, vamos calcular baseado no cashback_accumulated
    const totalSpent = subscriptions.reduce((sum, sub) => sum + (sub.cashback_accumulated || 0), 0);
    
    // Calcular gasto médio mensal baseado no cashback acumulado
    const monthlySubscriptions = subscriptions.filter(sub => sub.billing_cycle === 'monthly');
    const averageMonthlySpend = monthlySubscriptions.length > 0 
      ? monthlySubscriptions.reduce((sum, sub) => sum + (sub.cashback_accumulated || 0), 0) / monthlySubscriptions.length 
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

    // Definir limites baseados no tipo de plano
    const limits = {
      basic: { pets: 1, appointments: 5 },
      premium: { pets: 5, appointments: 999 },
      vip: { pets: 10, appointments: 999 }
    };

    const planLimits = limits[activeSubscription.plan_type] || limits.basic;
    
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

    const remainingPets = Math.max(0, planLimits.pets - (petsCount || 0));
    const remainingAppointments = Math.max(0, planLimits.appointments - (appointmentsCount || 0));

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
    } else {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    return this.updateSubscription(subscriptionId, {
      status: 'active',
      next_billing_date: nextBillingDate.toISOString()
    });
  }

  async getSubscriptionHistory(userId: string): Promise<UserSubscription[]> {
    const { data, error } = await supabase
      .from('user_subscriptions_pet')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Erro ao buscar histórico de assinaturas: ' + error.message);
    }

    return data || [];
  }

  async getSubscriptionUsage(subscriptionId: string) {
    // Como a tabela user_subscriptions_pet tem campos diferentes, vamos adaptar
    const { data: subscription, error } = await supabase
      .from('user_subscriptions_pet')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (error) {
      throw new Error('Erro ao buscar uso da assinatura: ' + error.message);
    }

    return {
      services_used: subscription.services_used || 0,
      services_limit: subscription.services_limit || 0,
      cashback_accumulated: subscription.cashback_accumulated || 0
    };
  }
}

export const userSubscriptionsService = new UserSubscriptionsService();
export type { UserSubscription, UserSubscriptionInsert, UserSubscriptionUpdate };
