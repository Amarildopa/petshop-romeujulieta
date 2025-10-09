 
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  intervalCount: number;
  trialDays?: number;
  features: string[];
  products: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  status: 'active' | 'inactive' | 'draft';
  subscriberCount: number;
  createdAt: string;
}

interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'active' | 'paused' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  amount: number;
  interval: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  pausedAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  trialConversionRate: number;
  totalRevenue: number;
  newSubscriptionsThisMonth: number;
}

interface BillingHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  billingDate: string;
  paidAt?: string;
  failureReason?: string;
  invoiceUrl?: string;
}

interface CreatePlanData {
  name: string;
  description: string;
  price: number;
  interval: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  intervalCount: number;
  trialDays?: number;
  features: string[];
  productIds: string[];
}

interface CreateSubscriptionData {
  userId: string;
  planId: string;
  paymentMethodId: string;
  trialDays?: number;
  couponCode?: string;
}

interface SubscriptionMetrics {
  period: string;
  newSubscriptions: number;
  cancelledSubscriptions: number;
  revenue: number;
  churnRate: number;
  conversionRate: number;
}

interface PaymentRetry {
  id: string;
  subscriptionId: string;
  attemptNumber: number;
  scheduledAt: string;
  status: 'pending' | 'processing' | 'failed' | 'succeeded';
  failureReason?: string;
}

class SubscriptionService {
  private mockPlans: SubscriptionPlan[] = [
    {
      id: 'plan_1',
      name: 'Pet Care Básico',
      description: 'Cuidados essenciais para seu pet',
      price: 49.90,
      interval: 'monthly',
      intervalCount: 1,
      trialDays: 7,
      features: [
        'Ração premium mensal',
        'Consulta veterinária básica',
        'Suporte por chat',
        'Desconto em produtos'
      ],
      products: [
        { id: 'prod_1', name: 'Ração Premium 3kg', quantity: 1, price: 35.90 },
        { id: 'prod_2', name: 'Petisco Natural', quantity: 2, price: 7.00 }
      ],
      status: 'active',
      subscriberCount: 245,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'plan_2',
      name: 'Pet Care Premium',
      description: 'Cuidados completos e personalizados',
      price: 89.90,
      interval: 'monthly',
      intervalCount: 1,
      trialDays: 14,
      features: [
        'Ração premium personalizada',
        'Consultas veterinárias ilimitadas',
        'Suporte 24/7',
        'Desconto de 20% em produtos',
        'Entrega expressa grátis',
        'Plano nutricional personalizado'
      ],
      products: [
        { id: 'prod_1', name: 'Ração Premium 5kg', quantity: 1, price: 55.90 },
        { id: 'prod_2', name: 'Petisco Natural', quantity: 3, price: 7.00 },
        { id: 'prod_3', name: 'Suplemento Vitamínico', quantity: 1, price: 25.00 }
      ],
      status: 'active',
      subscriberCount: 189,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'plan_3',
      name: 'Pet Care Enterprise',
      description: 'Solução completa para múltiplos pets',
      price: 149.90,
      interval: 'monthly',
      intervalCount: 1,
      trialDays: 30,
      features: [
        'Ração premium para até 3 pets',
        'Consultas veterinárias ilimitadas',
        'Suporte dedicado',
        'Desconto de 30% em produtos',
        'Entrega expressa grátis',
        'Plano nutricional personalizado',
        'Monitoramento de saúde',
        'Emergência 24h'
      ],
      products: [
        { id: 'prod_1', name: 'Ração Premium 10kg', quantity: 2, price: 55.90 },
        { id: 'prod_2', name: 'Petisco Natural', quantity: 5, price: 7.00 },
        { id: 'prod_3', name: 'Suplemento Vitamínico', quantity: 3, price: 25.00 },
        { id: 'prod_4', name: 'Kit Higiene Completo', quantity: 1, price: 45.00 }
      ],
      status: 'active',
      subscriberCount: 67,
      createdAt: '2024-01-15T10:00:00Z'
    }
  ];

  private mockSubscriptions: UserSubscription[] = [
    {
      id: 'sub_1',
      planId: 'plan_2',
      planName: 'Pet Care Premium',
      userId: 'user_1',
      userName: 'Maria Silva',
      userEmail: 'maria@email.com',
      status: 'active',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      nextBillingDate: '2024-02-01T00:00:00Z',
      amount: 89.90,
      interval: 'monthly',
      cancelAtPeriodEnd: false,
      createdAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 'sub_2',
      planId: 'plan_1',
      planName: 'Pet Care Básico',
      userId: 'user_2',
      userName: 'João Santos',
      userEmail: 'joao@email.com',
      status: 'trialing',
      currentPeriodStart: '2024-01-20T00:00:00Z',
      currentPeriodEnd: '2024-02-20T00:00:00Z',
      nextBillingDate: '2024-01-27T00:00:00Z',
      amount: 49.90,
      interval: 'monthly',
      trialEnd: '2024-01-27T00:00:00Z',
      cancelAtPeriodEnd: false,
      createdAt: '2024-01-20T10:00:00Z'
    },
    {
      id: 'sub_3',
      planId: 'plan_2',
      planName: 'Pet Care Premium',
      userId: 'user_3',
      userName: 'Ana Costa',
      userEmail: 'ana@email.com',
      status: 'paused',
      currentPeriodStart: '2024-01-10T00:00:00Z',
      currentPeriodEnd: '2024-02-10T00:00:00Z',
      nextBillingDate: '2024-02-10T00:00:00Z',
      amount: 89.90,
      interval: 'monthly',
      pausedAt: '2024-01-25T15:30:00Z',
      cancelAtPeriodEnd: false,
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      id: 'sub_4',
      planId: 'plan_3',
      planName: 'Pet Care Enterprise',
      userId: 'user_4',
      userName: 'Carlos Oliveira',
      userEmail: 'carlos@email.com',
      status: 'past_due',
      currentPeriodStart: '2024-01-05T00:00:00Z',
      currentPeriodEnd: '2024-02-05T00:00:00Z',
      nextBillingDate: '2024-02-05T00:00:00Z',
      amount: 149.90,
      interval: 'monthly',
      cancelAtPeriodEnd: false,
      createdAt: '2024-01-05T10:00:00Z'
    },
    {
      id: 'sub_5',
      planId: 'plan_1',
      planName: 'Pet Care Básico',
      userId: 'user_5',
      userName: 'Lucia Ferreira',
      userEmail: 'lucia@email.com',
      status: 'cancelled',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      nextBillingDate: '2024-02-01T00:00:00Z',
      amount: 49.90,
      interval: 'monthly',
      cancelledAt: '2024-01-28T14:20:00Z',
      cancelAtPeriodEnd: true,
      createdAt: '2024-01-01T10:00:00Z'
    }
  ];

  private mockBillingHistory: BillingHistory[] = [
    {
      id: 'bill_1',
      subscriptionId: 'sub_1',
      amount: 89.90,
      status: 'paid',
      billingDate: '2024-01-01T00:00:00Z',
      paidAt: '2024-01-01T02:15:00Z',
      invoiceUrl: 'https://example.com/invoice/bill_1.pdf'
    },
    {
      id: 'bill_2',
      subscriptionId: 'sub_2',
      amount: 49.90,
      status: 'pending',
      billingDate: '2024-01-27T00:00:00Z'
    },
    {
      id: 'bill_3',
      subscriptionId: 'sub_4',
      amount: 149.90,
      status: 'failed',
      billingDate: '2024-02-05T00:00:00Z',
      failureReason: 'Cartão de crédito expirado'
    },
    {
      id: 'bill_4',
      subscriptionId: 'sub_3',
      amount: 89.90,
      status: 'paid',
      billingDate: '2024-01-10T00:00:00Z',
      paidAt: '2024-01-10T01:45:00Z',
      invoiceUrl: 'https://example.com/invoice/bill_4.pdf'
    },
    {
      id: 'bill_5',
      subscriptionId: 'sub_5',
      amount: 49.90,
      status: 'refunded',
      billingDate: '2024-01-01T00:00:00Z',
      paidAt: '2024-01-01T03:20:00Z'
    }
  ];

  // Obter estatísticas de assinatura
  async getSubscriptionStats(/* _period: string = '30d' */): Promise<SubscriptionStats> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

    const activeSubscriptions = this.mockSubscriptions.filter(sub => sub.status === 'active').length;
    const totalSubscriptions = this.mockSubscriptions.length;
    const monthlyRevenue = this.mockSubscriptions
      .filter(sub => ['active', 'trialing'].includes(sub.status))
      .reduce((sum, sub) => sum + sub.amount, 0);
    
    const paidBills = this.mockBillingHistory.filter(bill => bill.status === 'paid');
    const totalRevenue = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    return {
      totalSubscriptions,
      activeSubscriptions,
      monthlyRecurringRevenue: monthlyRevenue,
      averageRevenuePerUser: activeSubscriptions > 0 ? monthlyRevenue / activeSubscriptions : 0,
      churnRate: 5.2,
      trialConversionRate: 78.5,
      totalRevenue,
      newSubscriptionsThisMonth: 23
    };
  }

  // Obter planos de assinatura
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.mockPlans];
  }

  // Obter assinaturas de usuários
  async getUserSubscriptions(): Promise<UserSubscription[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...this.mockSubscriptions];
  }

  // Obter histórico de faturamento
  async getBillingHistory(): Promise<BillingHistory[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.mockBillingHistory];
  }

  // Criar novo plano
  async createPlan(planData: CreatePlanData): Promise<SubscriptionPlan> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newPlan: SubscriptionPlan = {
      id: `plan_${Date.now()}`,
      ...planData,
      products: [], // Seria populado com base nos productIds
      status: 'draft',
      subscriberCount: 0,
      createdAt: new Date().toISOString()
    };
    
    this.mockPlans.push(newPlan);
    return newPlan;
  }

  // Atualizar plano
  async updatePlan(planId: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const planIndex = this.mockPlans.findIndex(plan => plan.id === planId);
    if (planIndex === -1) {
      throw new Error('Plano não encontrado');
    }
    
    this.mockPlans[planIndex] = { ...this.mockPlans[planIndex], ...updates };
    return this.mockPlans[planIndex];
  }

  // Atualizar status do plano
  async updatePlanStatus(planId: string, status: 'active' | 'inactive'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const plan = this.mockPlans.find(p => p.id === planId);
    if (plan) {
      plan.status = status;
    }
  }

  // Criar nova assinatura
  async createSubscription(subscriptionData: CreateSubscriptionData): Promise<UserSubscription> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const plan = this.mockPlans.find(p => p.id === subscriptionData.planId);
    if (!plan) {
      throw new Error('Plano não encontrado');
    }
    
    const now = new Date();
    const trialEnd = subscriptionData.trialDays ? 
      new Date(now.getTime() + subscriptionData.trialDays * 24 * 60 * 60 * 1000) : undefined;
    
    const newSubscription: UserSubscription = {
      id: `sub_${Date.now()}`,
      planId: plan.id,
      planName: plan.name,
      userId: subscriptionData.userId,
      userName: 'Novo Cliente',
      userEmail: 'cliente@email.com',
      status: trialEnd ? 'trialing' : 'active',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      nextBillingDate: trialEnd ? trialEnd.toISOString() : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: plan.price,
      interval: plan.interval,
      trialEnd: trialEnd?.toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: now.toISOString()
    };
    
    this.mockSubscriptions.push(newSubscription);
    return newSubscription;
  }

  // Atualizar status da assinatura
  async updateSubscriptionStatus(subscriptionId: string, action: 'pause' | 'resume' | 'cancel'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const subscription = this.mockSubscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }
    
    const now = new Date().toISOString();
    
    switch (action) {
      case 'pause':
        subscription.status = 'paused';
        subscription.pausedAt = now;
        break;
      case 'resume':
        subscription.status = 'active';
        subscription.pausedAt = undefined;
        break;
      case 'cancel':
        subscription.status = 'cancelled';
        subscription.cancelledAt = now;
        subscription.cancelAtPeriodEnd = true;
        break;
    }
  }

  // Tentar pagamento novamente
  async retryPayment(subscriptionId: string): Promise<PaymentRetry> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const subscription = this.mockSubscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }
    
    // Simular tentativa de pagamento
    const success = Math.random() > 0.3; // 70% de chance de sucesso
    
    if (success) {
      subscription.status = 'active';
      
      // Criar novo registro de faturamento
      const newBilling: BillingHistory = {
        id: `bill_${Date.now()}`,
        subscriptionId,
        amount: subscription.amount,
        status: 'paid',
        billingDate: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        invoiceUrl: `https://example.com/invoice/bill_${Date.now()}.pdf`
      };
      
      this.mockBillingHistory.push(newBilling);
    }
    
    return {
      id: `retry_${Date.now()}`,
      subscriptionId,
      attemptNumber: 1,
      scheduledAt: new Date().toISOString(),
      status: success ? 'succeeded' : 'failed',
      failureReason: success ? undefined : 'Cartão de crédito recusado'
    };
  }

  // Processar renovação de assinatura
  async processRenewal(subscriptionId: string): Promise<BillingHistory> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const subscription = this.mockSubscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }
    
    const success = Math.random() > 0.1; // 90% de chance de sucesso
    
    const billing: BillingHistory = {
      id: `bill_${Date.now()}`,
      subscriptionId,
      amount: subscription.amount,
      status: success ? 'paid' : 'failed',
      billingDate: new Date().toISOString(),
      paidAt: success ? new Date().toISOString() : undefined,
      failureReason: success ? undefined : 'Saldo insuficiente',
      invoiceUrl: success ? `https://example.com/invoice/bill_${Date.now()}.pdf` : undefined
    };
    
    this.mockBillingHistory.push(billing);
    
    if (success) {
      // Atualizar período da assinatura
      const currentEnd = new Date(subscription.currentPeriodEnd);
      const nextEnd = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      subscription.currentPeriodStart = subscription.currentPeriodEnd;
      subscription.currentPeriodEnd = nextEnd.toISOString();
      subscription.nextBillingDate = nextEnd.toISOString();
    } else {
      subscription.status = 'past_due';
    }
    
    return billing;
  }

  // Aplicar cupom de desconto
  async applyCoupon(subscriptionId: string, couponCode: string): Promise<{ discount: number; newAmount: number }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const subscription = this.mockSubscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }
    
    // Simular validação de cupom
    const coupons = {
      'DESCONTO10': 0.10,
      'DESCONTO20': 0.20,
      'PRIMEIRA50': 0.50
    };
    
    const discount = coupons[couponCode as keyof typeof coupons] || 0;
    if (discount === 0) {
      throw new Error('Cupom inválido');
    }
    
    const discountAmount = subscription.amount * discount;
    const newAmount = subscription.amount - discountAmount;
    
    return {
      discount: discountAmount,
      newAmount
    };
  }

  // Obter métricas por período
  async getMetricsByPeriod(period: string): Promise<SubscriptionMetrics[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Simular dados históricos
    const metrics: SubscriptionMetrics[] = [];
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      metrics.push({
        period: date.toISOString().split('T')[0],
        newSubscriptions: Math.floor(Math.random() * 10) + 1,
        cancelledSubscriptions: Math.floor(Math.random() * 3),
        revenue: Math.random() * 1000 + 500,
        churnRate: Math.random() * 10,
        conversionRate: Math.random() * 20 + 70
      });
    }
    
    return metrics;
  }

  // Exportar relatório
  async exportReport(_type: 'subscriptions' | 'revenue' | 'churn', period: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simular geração de relatório
    const reportData = {
      subscriptions: this.mockSubscriptions,
      revenue: this.mockBillingHistory,
      churn: await this.getMetricsByPeriod(period)
    };
    
    // Em uma implementação real, isso geraria um arquivo Excel/PDF
    const blob = new Blob([JSON.stringify(reportData[_type], null, 2)], {
      type: 'application/json'
    });
    
    return URL.createObjectURL(blob);
  }

  // Obter assinatura por ID
  async getSubscriptionById(subscriptionId: string): Promise<UserSubscription | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockSubscriptions.find(sub => sub.id === subscriptionId) || null;
  }

  // Obter plano por ID
  async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockPlans.find(plan => plan.id === planId) || null;
  }

  // Calcular próxima data de cobrança
  calculateNextBillingDate(currentDate: Date, interval: string, intervalCount: number = 1): Date {
    const nextDate = new Date(currentDate);
    
    switch (interval) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (7 * intervalCount));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + intervalCount);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + (3 * intervalCount));
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + intervalCount);
        break;
    }
    
    return nextDate;
  }

  // Validar dados do plano
  validatePlanData(planData: CreatePlanData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!planData.name || planData.name.trim().length < 3) {
      errors.push('Nome do plano deve ter pelo menos 3 caracteres');
    }
    
    if (!planData.description || planData.description.trim().length < 10) {
      errors.push('Descrição deve ter pelo menos 10 caracteres');
    }
    
    if (planData.price <= 0) {
      errors.push('Preço deve ser maior que zero');
    }
    
    if (!['weekly', 'monthly', 'quarterly', 'yearly'].includes(planData.interval)) {
      errors.push('Intervalo inválido');
    }
    
    if (planData.intervalCount < 1) {
      errors.push('Contagem de intervalo deve ser pelo menos 1');
    }
    
    if (planData.trialDays && planData.trialDays < 0) {
      errors.push('Dias de teste não podem ser negativos');
    }
    
    if (!planData.features || planData.features.length === 0) {
      errors.push('Pelo menos um recurso deve ser especificado');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Obter assinaturas que expiram em breve
  async getExpiringSubscriptions(_days: number = 7): Promise<UserSubscription[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + _days);
    
    return this.mockSubscriptions.filter(sub => {
      const nextBilling = new Date(sub.nextBillingDate);
      return nextBilling <= cutoffDate && ['active', 'trialing'].includes(sub.status);
    });
  }

  // Obter estatísticas de retenção
  async getRetentionStats(): Promise<{ period: string; retentionRate: number }[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Simular dados de retenção
    return [
      { period: '1 mês', retentionRate: 95 },
      { period: '3 meses', retentionRate: 87 },
      { period: '6 meses', retentionRate: 78 },
      { period: '12 meses', retentionRate: 65 }
    ];
  }
}

export const subscriptionService = new SubscriptionService();
export type {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionStats,
  BillingHistory,
  CreatePlanData,
  CreateSubscriptionData,
  SubscriptionMetrics,
  PaymentRetry
};