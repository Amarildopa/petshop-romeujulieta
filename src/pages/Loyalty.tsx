import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Gift, Star, Trophy, Coins, History, Award, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  pointsPerReal: number;
  minPointsToRedeem: number;
  maxPointsPerOrder: number;
  isActive: boolean;
  tiers: LoyaltyTier[];
}

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  multiplier: number;
  benefits: string[];
  color: string;
}

interface UserLoyalty {
  userId: string;
  programId: string;
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  currentTier: string;
  nextTierPoints: number;
  joinedAt: Date;
}

interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  description: string;
  orderId?: string;
  createdAt: Date;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'product' | 'shipping' | 'service';
  value: number;
  isActive: boolean;
  stock?: number;
  image?: string;
}

const Loyalty: React.FC = () => {
  const [userLoyalty, setUserLoyalty] = useState<UserLoyalty | null>(null);
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const mockLoyaltyProgram: LoyaltyProgram = {
    id: '1',
    name: 'Pet Lovers Club',
    description: 'Ganhe pontos a cada compra e troque por recompensas incríveis!',
    pointsPerReal: 1,
    minPointsToRedeem: 100,
    maxPointsPerOrder: 1000,
    isActive: true,
    tiers: [
      {
        id: '1',
        name: 'Bronze',
        minPoints: 0,
        multiplier: 1,
        benefits: ['1 ponto por R$ 1,00', 'Ofertas exclusivas'],
        color: 'bg-amber-600'
      },
      {
        id: '2',
        name: 'Prata',
        minPoints: 1000,
        multiplier: 1.2,
        benefits: ['1.2 pontos por R$ 1,00', 'Frete grátis', 'Desconto de aniversário'],
        color: 'bg-gray-400'
      },
      {
        id: '3',
        name: 'Ouro',
        minPoints: 5000,
        multiplier: 1.5,
        benefits: ['1.5 pontos por R$ 1,00', 'Frete grátis', 'Atendimento prioritário', '10% desconto'],
        color: 'bg-yellow-500'
      },
      {
        id: '4',
        name: 'Diamante',
        minPoints: 15000,
        multiplier: 2,
        benefits: ['2 pontos por R$ 1,00', 'Todos os benefícios anteriores', 'Consulta veterinária gratuita'],
        color: 'bg-blue-500'
      }
    ]
  };

  const mockUserLoyalty: UserLoyalty = {
    userId: '1',
    programId: '1',
    currentPoints: 2450,
    totalEarned: 8750,
    totalRedeemed: 6300,
    currentTier: '2',
    nextTierPoints: 2550,
    joinedAt: new Date('2023-06-15')
  };

  const mockTransactions: PointsTransaction[] = [
    {
      id: '1',
      userId: '1',
      type: 'earned',
      points: 150,
      description: 'Compra de ração premium',
      orderId: 'ORD-001',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      userId: '1',
      type: 'redeemed',
      points: -500,
      description: 'Desconto de R$ 25,00',
      createdAt: new Date('2024-01-10')
    },
    {
      id: '3',
      userId: '1',
      type: 'earned',
      points: 200,
      description: 'Compra de brinquedos',
      orderId: 'ORD-002',
      createdAt: new Date('2024-01-08')
    }
  ];

  const mockRewards: Reward[] = [
    {
      id: '1',
      name: 'Desconto R$ 10,00',
      description: 'Desconto de R$ 10,00 em qualquer compra',
      pointsCost: 200,
      type: 'discount',
      value: 10,
      isActive: true
    },
    {
      id: '2',
      name: 'Frete Grátis',
      description: 'Frete grátis para sua próxima compra',
      pointsCost: 300,
      type: 'shipping',
      value: 0,
      isActive: true
    },
    {
      id: '3',
      name: 'Brinquedo Premium',
      description: 'Brinquedo interativo para cães',
      pointsCost: 800,
      type: 'product',
      value: 45,
      isActive: true,
      stock: 5,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=interactive%20dog%20toy%20premium%20colorful&image_size=square'
    },
    {
      id: '4',
      name: 'Consulta Veterinária',
      description: 'Consulta veterinária gratuita',
      pointsCost: 1500,
      type: 'service',
      value: 80,
      isActive: true,
      stock: 2
    }
  ];

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setLoyaltyProgram(mockLoyaltyProgram);
      setUserLoyalty(mockUserLoyalty);
      setTransactions(mockTransactions);
      setRewards(mockRewards);
      setLoading(false);
    }, 1000);
  }, []);

  const getCurrentTier = () => {
    if (!loyaltyProgram || !userLoyalty) return null;
    return loyaltyProgram.tiers.find(tier => tier.id === userLoyalty.currentTier);
  };

  const getNextTier = () => {
    if (!loyaltyProgram || !userLoyalty) return null;
    const currentTierIndex = loyaltyProgram.tiers.findIndex(tier => tier.id === userLoyalty.currentTier);
    return loyaltyProgram.tiers[currentTierIndex + 1] || null;
  };

  const getProgressToNextTier = () => {
    const nextTier = getNextTier();
    const currentTier = getCurrentTier();
    if (!nextTier || !currentTier || !userLoyalty) return 100;
    
    const pointsInCurrentTier = userLoyalty.currentPoints - currentTier.minPoints;
    const pointsNeededForNext = nextTier.minPoints - currentTier.minPoints;
    return Math.min((pointsInCurrentTier / pointsNeededForNext) * 100, 100);
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (!userLoyalty || userLoyalty.currentPoints < reward.pointsCost) {
      toast.error('Pontos insuficientes para resgatar esta recompensa');
      return;
    }

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar pontos do usuário
      setUserLoyalty(prev => prev ? {
        ...prev,
        currentPoints: prev.currentPoints - reward.pointsCost,
        totalRedeemed: prev.totalRedeemed + reward.pointsCost
      } : null);

      // Adicionar transação
      const newTransaction: PointsTransaction = {
        id: Date.now().toString(),
        userId: '1',
        type: 'redeemed',
        points: -reward.pointsCost,
        description: `Resgate: ${reward.name}`,
        createdAt: new Date()
      };
      setTransactions(prev => [newTransaction, ...prev]);

      toast.success(`Recompensa "${reward.name}" resgatada com sucesso!`);
    } catch {
      toast.error('Erro ao resgatar recompensa. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progressToNext = getProgressToNextTier();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Programa de Fidelidade</h1>
        <p className="text-gray-600">{loyaltyProgram?.description}</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Atuais</CardTitle>
            <Coins className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {userLoyalty?.currentPoints.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível Atual</CardTitle>
            <Trophy className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTier?.name}</div>
            <Badge className={`mt-1 ${currentTier?.color} text-white`}>
              {currentTier?.multiplier}x pontos
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
            <Star className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {userLoyalty?.totalEarned.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resgatado</CardTitle>
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {userLoyalty?.totalRedeemed.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="tiers">Níveis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Progresso para Próximo Nível */}
          {nextTier && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Progresso para {nextTier.name}
                </CardTitle>
                <CardDescription>
                  Faltam {userLoyalty?.nextTierPoints} pontos para o próximo nível
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentTier?.name}</span>
                    <span>{nextTier.name}</span>
                  </div>
                  <Progress value={progressToNext} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{currentTier?.minPoints} pts</span>
                    <span>{nextTier.minPoints} pts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefícios Atuais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Seus Benefícios Atuais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTier?.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map(reward => (
              <Card key={reward.id} className="relative">
                {reward.image && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img 
                      src={reward.image} 
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                    <Badge variant="secondary">
                      {reward.pointsCost} pts
                    </Badge>
                  </div>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reward.stock !== undefined && (
                      <div className="text-sm text-gray-500">
                        Estoque: {reward.stock} unidades
                      </div>
                    )}
                    <Button 
                      onClick={() => handleRedeemReward(reward)}
                      disabled={!userLoyalty || userLoyalty.currentPoints < reward.pointsCost || reward.stock === 0}
                      className="w-full"
                    >
                      {!userLoyalty || userLoyalty.currentPoints < reward.pointsCost 
                        ? 'Pontos Insuficientes' 
                        : reward.stock === 0 
                        ? 'Esgotado'
                        : 'Resgatar'
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Pontos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'earned' ? 'bg-green-100 text-green-600' :
                        transaction.type === 'redeemed' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {transaction.type === 'earned' ? <Star className="h-4 w-4" /> :
                         transaction.type === 'redeemed' ? <Gift className="h-4 w-4" /> :
                         <History className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.createdAt.toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold ${
                      transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loyaltyProgram?.tiers.map((tier) => (
              <Card key={tier.id} className={`relative ${
                tier.id === userLoyalty?.currentTier ? 'ring-2 ring-blue-500' : ''
              }`}>
                {tier.id === userLoyalty?.currentTier && (
                  <Badge className="absolute -top-2 -right-2 bg-blue-500">
                    Atual
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${tier.color}`}></div>
                    {tier.name}
                  </CardTitle>
                  <CardDescription>
                    A partir de {tier.minPoints.toLocaleString()} pontos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium text-lg">
                      {tier.multiplier}x pontos por compra
                    </div>
                    <div className="space-y-1">
                      {tier.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center gap-2 text-sm">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Loyalty;