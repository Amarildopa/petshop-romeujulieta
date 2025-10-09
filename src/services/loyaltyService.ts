 
interface LoyaltyData {
  points: number;
  tier: string;
  history: PointsHistory[];
}

interface PointsHistory {
  id: string;
  type: 'earned' | 'redeemed';
  points: number;
  description: string;
  date: string;
  orderId?: string;
}

interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsCost: number;
  status: 'pending' | 'completed' | 'expired';
  redeemedAt: string;
  expiresAt?: string;
}

class LoyaltyService {
  private baseUrl = '/api/loyalty';

  // Obter dados de fidelidade do usuário
  async getUserLoyaltyData(userId: string): Promise<LoyaltyData> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar dados de fidelidade');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro no loyaltyService.getUserLoyaltyData:', error);
      // Retornar dados mock para desenvolvimento
      return this.getMockLoyaltyData(userId);
    }
  }

  // Adicionar pontos por compra
  async addPointsForPurchase(userId: string, orderValue: number, orderId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/add-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          orderValue,
          orderId,
          type: 'purchase'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar pontos');
      }
    } catch (error) {
      console.error('Erro no loyaltyService.addPointsForPurchase:', error);
      throw error;
    }
  }

  // Adicionar pontos por ação (avaliação, indicação, etc.)
  async addPointsForAction(userId: string, action: string, points: number, description: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/add-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          points,
          action,
          description,
          type: 'action'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar pontos');
      }
    } catch (error) {
      console.error('Erro no loyaltyService.addPointsForAction:', error);
      throw error;
    }
  }

  // Resgatar recompensa
  async redeemReward(userId: string, rewardId: string, pointsCost: number): Promise<RewardRedemption> {
    try {
      const response = await fetch(`${this.baseUrl}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          rewardId,
          pointsCost
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao resgatar recompensa');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro no loyaltyService.redeemReward:', error);
      throw error;
    }
  }

  // Obter resgates do usuário
  async getUserRedemptions(userId: string): Promise<RewardRedemption[]> {
    try {
      const response = await fetch(`${this.baseUrl}/redemptions/${userId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar resgates');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro no loyaltyService.getUserRedemptions:', error);
      return [];
    }
  }

  // Calcular pontos baseado no valor da compra e tier do usuário
  calculatePointsForPurchase(orderValue: number, userTier: string): number {
    const multipliers = {
      bronze: 1,
      silver: 1.5,
      gold: 2,
      diamond: 3
    };

    const basePoints = Math.floor(orderValue / 10); // 1 ponto a cada R$ 10
    const multiplier = multipliers[userTier as keyof typeof multipliers] || 1;
    
    return Math.floor(basePoints * multiplier);
  }

  // Determinar tier baseado nos pontos
  getTierByPoints(points: number): string {
    if (points >= 3000) return 'diamond';
    if (points >= 1500) return 'gold';
    if (points >= 500) return 'silver';
    return 'bronze';
  }

  // Obter benefícios do tier
  getTierBenefits(tier: string) {
    const benefits = {
      bronze: {
        pointsMultiplier: 1,
        birthdayDiscount: 5,
        freeShippingThreshold: null,
        prioritySupport: false,
        exclusiveProducts: false
      },
      silver: {
        pointsMultiplier: 1.5,
        birthdayDiscount: 10,
        freeShippingThreshold: 100,
        prioritySupport: false,
        exclusiveProducts: false
      },
      gold: {
        pointsMultiplier: 2,
        birthdayDiscount: 15,
        freeShippingThreshold: 0,
        prioritySupport: true,
        exclusiveProducts: false
      },
      diamond: {
        pointsMultiplier: 3,
        birthdayDiscount: 20,
        freeShippingThreshold: 0,
        prioritySupport: true,
        exclusiveProducts: true
      }
    };

    return benefits[tier as keyof typeof benefits] || benefits.bronze;
  }

  // Dados mock para desenvolvimento
  private getMockLoyaltyData(/* _userId: string */): LoyaltyData {
    const mockHistory: PointsHistory[] = [
      {
        id: '1',
        type: 'earned',
        points: 150,
        description: 'Compra realizada - Pedido #12345',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        orderId: '12345'
      },
      {
        id: '2',
        type: 'earned',
        points: 50,
        description: 'Avaliação de produto',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'redeemed',
        points: 200,
        description: 'Resgate: Desconto de 10%',
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        type: 'earned',
        points: 300,
        description: 'Compra realizada - Pedido #12344',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        orderId: '12344'
      },
      {
        id: '5',
        type: 'earned',
        points: 100,
        description: 'Indicação de amigo',
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const totalPoints = 850; // Exemplo: usuário no tier Prata
    const tier = this.getTierByPoints(totalPoints);

    return {
      points: totalPoints,
      tier,
      history: mockHistory
    };
  }

  // Validar se o usuário pode resgatar uma recompensa
  async canRedeemReward(userId: string, rewardId: string, pointsCost: number): Promise<boolean> {
    try {
      const userData = await this.getUserLoyaltyData(userId);
      return userData.points >= pointsCost;
    } catch (error) {
      console.error('Erro ao validar resgate:', error);
      return false;
    }
  }

  // Gerar cupom de desconto baseado no resgate
  generateRewardCoupon(rewardId: string, /* _userId: string */): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `LOYALTY-${rewardId.toUpperCase()}-${random}-${timestamp.toString().slice(-6)}`;
  }

  // Verificar expiração de resgates
  async checkExpiredRedemptions(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/check-expired/${userId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao verificar resgates expirados');
      }
    } catch (error) {
      console.error('Erro ao verificar resgates expirados:', error);
    }
  }
}

export const loyaltyService = new LoyaltyService();
export type { LoyaltyData, PointsHistory, RewardRedemption };