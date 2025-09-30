/* eslint-disable */
interface AffiliateStats {
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  totalReferrals: number;
  activeReferrals: number;
  conversionRate: number;
  clicksThisMonth: number;
  salesThisMonth: number;
}

interface Referral {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  firstPurchaseAt?: string;
  totalSpent: number;
  commissionEarned: number;
  status: 'pending' | 'active' | 'inactive';
}

interface Commission {
  id: string;
  referralId: string;
  referralName: string;
  orderId: string;
  orderValue: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
  paidAt?: string;
}

interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  clicks: number;
  conversions: number;
  createdAt: string;
  isActive: boolean;
}

interface AffiliateProgram {
  id: string;
  name: string;
  description: string;
  commissionRate: number;
  minimumPayout: number;
  paymentSchedule: 'weekly' | 'monthly' | 'quarterly';
  cookieDuration: number; // em dias
  isActive: boolean;
}

interface PaymentDetails {
  pixKey?: string;
  bankAccount?: {
    bank: string;
    agency: string;
    account: string;
    accountType: 'checking' | 'savings';
  };
  paypalEmail?: string;
}

interface PayoutRequest {
  id: string;
  affiliateId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  paymentMethod: 'pix' | 'bank_transfer' | 'paypal';
  paymentDetails: PaymentDetails;
}

class AffiliateService {
  private baseUrl = '/api/affiliates';

  // Mock data para desenvolvimento
  private mockStats: AffiliateStats = {
    totalCommission: 1250.75,
    pendingCommission: 320.50,
    paidCommission: 930.25,
    totalReferrals: 15,
    activeReferrals: 12,
    conversionRate: 8.5,
    clicksThisMonth: 245,
    salesThisMonth: 18
  };

  private mockReferrals: Referral[] = [
    {
      id: '1',
      name: 'Maria Silva',
      email: 'maria@email.com',
      registeredAt: '2024-01-15T10:00:00Z',
      firstPurchaseAt: '2024-01-16T14:30:00Z',
      totalSpent: 450.00,
      commissionEarned: 22.50,
      status: 'active'
    },
    {
      id: '2',
      name: 'João Santos',
      email: 'joao@email.com',
      registeredAt: '2024-01-20T09:15:00Z',
      firstPurchaseAt: '2024-01-22T16:45:00Z',
      totalSpent: 320.00,
      commissionEarned: 16.00,
      status: 'active'
    },
    {
      id: '3',
      name: 'Ana Costa',
      email: 'ana@email.com',
      registeredAt: '2024-01-25T11:30:00Z',
      totalSpent: 0,
      commissionEarned: 0,
      status: 'pending'
    }
  ];

  private mockCommissions: Commission[] = [
    {
      id: '1',
      referralId: '1',
      referralName: 'Maria Silva',
      orderId: 'ORD-001',
      orderValue: 200.00,
      commissionRate: 5,
      commissionAmount: 10.00,
      status: 'paid',
      createdAt: '2024-01-16T14:30:00Z',
      paidAt: '2024-02-01T10:00:00Z'
    },
    {
      id: '2',
      referralId: '1',
      referralName: 'Maria Silva',
      orderId: 'ORD-002',
      orderValue: 250.00,
      commissionRate: 5,
      commissionAmount: 12.50,
      status: 'approved',
      createdAt: '2024-01-20T16:15:00Z'
    },
    {
      id: '3',
      referralId: '2',
      referralName: 'João Santos',
      orderId: 'ORD-003',
      orderValue: 320.00,
      commissionRate: 5,
      commissionAmount: 16.00,
      status: 'pending',
      createdAt: '2024-01-22T16:45:00Z'
    }
  ];

  private mockAffiliateLinks: AffiliateLink[] = [
    {
      id: '1',
      name: 'Link Principal',
      url: 'https://petshop.com/store?ref=ABC123',
      clicks: 156,
      conversions: 12,
      createdAt: '2024-01-10T10:00:00Z',
      isActive: true
    },
    {
      id: '2',
      name: 'Promoção Ração',
      url: 'https://petshop.com/store/categoria/racao?ref=ABC123',
      clicks: 89,
      conversions: 6,
      createdAt: '2024-01-15T14:30:00Z',
      isActive: true
    }
  ];

  async getAffiliateStats(affiliateId: string, period: string): Promise<AffiliateStats> {
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Em produção, fazer chamada real à API
      // const response = await fetch(`${this.baseUrl}/${affiliateId}/stats?period=${period}`);
      // return await response.json();
      
      return this.mockStats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de afiliado:', error);
      throw error;
    }
  }

  async getReferrals(affiliateId: string): Promise<Referral[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.mockReferrals;
    } catch (error) {
      console.error('Erro ao buscar indicações:', error);
      throw error;
    }
  }

  async getCommissions(affiliateId: string): Promise<Commission[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.mockCommissions;
    } catch (error) {
      console.error('Erro ao buscar comissões:', error);
      throw error;
    }
  }

  async getAffiliateLinks(affiliateId: string): Promise<AffiliateLink[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.mockAffiliateLinks;
    } catch (error) {
      console.error('Erro ao buscar links de afiliado:', error);
      throw error;
    }
  }

  async createAffiliateLink(affiliateId: string, name: string): Promise<AffiliateLink> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newLink: AffiliateLink = {
        id: Date.now().toString(),
        name,
        url: `https://petshop.com/store?ref=${affiliateId.toUpperCase()}${Date.now()}`,
        clicks: 0,
        conversions: 0,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      this.mockAffiliateLinks.push(newLink);
      return newLink;
    } catch (error) {
      console.error('Erro ao criar link de afiliado:', error);
      throw error;
    }
  }

  async updateLinkStatus(linkId: string, isActive: boolean): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const linkIndex = this.mockAffiliateLinks.findIndex(link => link.id === linkId);
      if (linkIndex !== -1) {
        this.mockAffiliateLinks[linkIndex].isActive = isActive;
      }
    } catch (error) {
      console.error('Erro ao atualizar status do link:', error);
      throw error;
    }
  }

  async trackClick(linkId: string, userAgent?: string, referrer?: string): Promise<void> {
    try {
      // Em produção, registrar o clique no backend
      const linkIndex = this.mockAffiliateLinks.findIndex(link => link.id === linkId);
      if (linkIndex !== -1) {
        this.mockAffiliateLinks[linkIndex].clicks++;
      }
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
  }

  async trackConversion(linkId: string, orderId: string, orderValue: number): Promise<void> {
    try {
      // Em produção, registrar a conversão no backend
      const linkIndex = this.mockAffiliateLinks.findIndex(link => link.id === linkId);
      if (linkIndex !== -1) {
        this.mockAffiliateLinks[linkIndex].conversions++;
      }
      
      // Criar comissão
      const commission: Commission = {
        id: Date.now().toString(),
        referralId: 'ref-' + Date.now(),
        referralName: 'Cliente Indicado',
        orderId,
        orderValue,
        commissionRate: 5,
        commissionAmount: orderValue * 0.05,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      this.mockCommissions.push(commission);
    } catch (error) {
      console.error('Erro ao registrar conversão:', error);
    }
  }

  async requestPayout(affiliateId: string, amount: number, paymentMethod: string, paymentDetails: PaymentDetails): Promise<PayoutRequest> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const payout: PayoutRequest = {
        id: Date.now().toString(),
        affiliateId,
        amount,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        paymentMethod: paymentMethod as 'pix' | 'bank_transfer' | 'paypal',
        paymentDetails
      };
      
      return payout;
    } catch (error) {
      console.error('Erro ao solicitar saque:', error);
      throw error;
    }
  }

  async getPayoutHistory(affiliateId: string): Promise<PayoutRequest[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock data para histórico de saques
      return [
        {
          id: '1',
          affiliateId,
          amount: 500.00,
          status: 'completed',
          requestedAt: '2024-01-01T10:00:00Z',
          processedAt: '2024-01-03T14:30:00Z',
          paymentMethod: 'pix',
          paymentDetails: { pixKey: 'user@email.com' }
        },
        {
          id: '2',
          affiliateId,
          amount: 250.00,
          status: 'processing',
          requestedAt: '2024-01-15T16:45:00Z',
          paymentMethod: 'bank_transfer',
          paymentDetails: { bank: 'Banco do Brasil', account: '12345-6' }
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar histórico de saques:', error);
      throw error;
    }
  }

  async exportCommissions(affiliateId: string, period: string): Promise<string> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gerar CSV com as comissões
      const headers = 'Data,Indicação,Pedido,Valor do Pedido,Taxa,Comissão,Status\n';
      const rows = this.mockCommissions.map(commission => 
        `${new Date(commission.createdAt).toLocaleDateString('pt-BR')},${commission.referralName},${commission.orderId},${commission.orderValue.toFixed(2)},${commission.commissionRate}%,${commission.commissionAmount.toFixed(2)},${commission.status}`
      ).join('\n');
      
      return headers + rows;
    } catch (error) {
      console.error('Erro ao exportar comissões:', error);
      throw error;
    }
  }

  async getAffiliatePrograms(): Promise<AffiliateProgram[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return [
        {
          id: '1',
          name: 'Programa Padrão',
          description: 'Programa de afiliados padrão com 5% de comissão',
          commissionRate: 5,
          minimumPayout: 50,
          paymentSchedule: 'monthly',
          cookieDuration: 30,
          isActive: true
        },
        {
          id: '2',
          name: 'Programa Premium',
          description: 'Programa premium com 8% de comissão para afiliados VIP',
          commissionRate: 8,
          minimumPayout: 100,
          paymentSchedule: 'monthly',
          cookieDuration: 60,
          isActive: true
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar programas de afiliados:', error);
      throw error;
    }
  }

  async joinAffiliateProgram(userId: string, programId: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Em produção, registrar o usuário no programa de afiliados
      console.log(`Usuário ${userId} ingressou no programa ${programId}`);
    } catch (error) {
      console.error('Erro ao ingressar no programa de afiliados:', error);
      throw error;
    }
  }

  calculateCommission(orderValue: number, commissionRate: number): number {
    return orderValue * (commissionRate / 100);
  }

  generateAffiliateCode(userId: string): string {
    const timestamp = Date.now().toString(36);
    const userHash = userId.slice(-4).toUpperCase();
    return `${userHash}${timestamp}`.toUpperCase();
  }

  validateAffiliateCode(code: string): boolean {
    // Validar formato do código de afiliado
    return /^[A-Z0-9]{8,12}$/.test(code);
  }

  async getTopAffiliates(limit: number = 10): Promise<{ id: string; name: string; totalCommission: number; referrals: number; }[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return [
        { id: '1', name: 'João Silva', totalCommission: 2500.00, referrals: 45 },
        { id: '2', name: 'Maria Santos', totalCommission: 1800.00, referrals: 32 },
        { id: '3', name: 'Pedro Costa', totalCommission: 1200.00, referrals: 28 }
      ];
    } catch (error) {
      console.error('Erro ao buscar top afiliados:', error);
      throw error;
    }
  }
}

export const affiliateService = new AffiliateService();
export type { AffiliateStats, Referral, Commission, AffiliateLink, AffiliateProgram, PayoutRequest };