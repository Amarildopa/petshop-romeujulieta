/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { subscriptionService } from '../services/subscriptionService';
import { Check, Crown, Star, Calendar, CreditCard, Users, Package, Zap } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  maxProducts?: number;
  maxOrders?: number;
  supportLevel: 'basic' | 'priority' | 'premium';
}

interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
}

interface SubscriptionStats {
  totalRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
}

const Subscriptions: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [plansData, subscriptionData, statsData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getUserSubscription(),
        subscriptionService.getStats()
      ]);
      setPlans(plansData);
      setUserSubscription(subscriptionData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados de assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPlan = async (planId: string) => {
    try {
      await subscriptionService.subscribe(planId);
      await loadSubscriptionData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao assinar plano:', error);
    }
  };

  const cancelSubscription = async () => {
    try {
      if (userSubscription) {
        await subscriptionService.cancelSubscription(userSubscription.id);
        await loadSubscriptionData();
      }
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
    }
  };

  const reactivateSubscription = async () => {
    try {
      if (userSubscription) {
        await subscriptionService.reactivateSubscription(userSubscription.id);
        await loadSubscriptionData();
      }
    } catch (error) {
      console.error('Erro ao reativar assinatura:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trialing': return 'bg-blue-100 text-blue-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'trialing': return 'Período de Teste';
      case 'past_due': return 'Pagamento Pendente';
      case 'canceled': return 'Cancelado';
      default: return status;
    }
  };

  const getSupportLevelText = (level: string) => {
    switch (level) {
      case 'basic': return 'Suporte Básico';
      case 'priority': return 'Suporte Prioritário';
      case 'premium': return 'Suporte Premium';
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando assinaturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assinaturas</h1>
        <p className="text-gray-600">Gerencie seus planos de assinatura e faturamento</p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {stats.totalRevenue.toLocaleString()}</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assinaturas Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Cancelamento</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.churnRate}%</p>
                </div>
                <Zap className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ARPU</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {stats.averageRevenuePerUser}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Assinatura Atual</TabsTrigger>
          <TabsTrigger value="plans">Planos Disponíveis</TabsTrigger>
        </TabsList>

        {/* Assinatura Atual */}
        <TabsContent value="current">
          {userSubscription ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Sua Assinatura Atual</span>
                  <Badge className={getStatusColor(userSubscription.status)}>
                    {getStatusText(userSubscription.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{userSubscription.planName}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Período atual: {userSubscription.currentPeriodStart.toLocaleDateString()} - {userSubscription.currentPeriodEnd.toLocaleDateString()}</span>
                      </div>
                      {userSubscription.trialEnd && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          <span>Teste gratuito até: {userSubscription.trialEnd.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {userSubscription.status === 'active' && !userSubscription.cancelAtPeriodEnd ? (
                      <Button 
                        variant="outline" 
                        onClick={cancelSubscription}
                        className="w-full"
                      >
                        Cancelar Assinatura
                      </Button>
                    ) : userSubscription.cancelAtPeriodEnd ? (
                      <div className="space-y-2">
                        <p className="text-sm text-yellow-600">Assinatura será cancelada em {userSubscription.currentPeriodEnd.toLocaleDateString()}</p>
                        <Button 
                          onClick={reactivateSubscription}
                          className="w-full"
                        >
                          Reativar Assinatura
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => setIsDialogOpen(true)}
                        className="w-full"
                      >
                        Renovar Assinatura
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma Assinatura Ativa</h3>
                <p className="text-gray-600 mb-4">Escolha um plano para começar a usar todos os recursos</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  Ver Planos Disponíveis
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Planos Disponíveis */}
        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.isPopular ? 'ring-2 ring-blue-500' : ''}`}>
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      <Crown className="h-3 w-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">R$ {plan.price}</span>
                    <span className="text-gray-600">/{plan.interval === 'monthly' ? 'mês' : 'ano'}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
                    {plan.maxProducts && (
                      <div>Até {plan.maxProducts} produtos</div>
                    )}
                    {plan.maxOrders && (
                      <div>Até {plan.maxOrders} pedidos/mês</div>
                    )}
                    <div>{getSupportLevelText(plan.supportLevel)}</div>
                  </div>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className={`w-full ${plan.isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        {userSubscription?.planId === plan.id ? 'Plano Atual' : 'Escolher Plano'}
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar Assinatura</DialogTitle>
                        <DialogDescription>
                          Você está prestes a assinar o plano {selectedPlan?.name}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedPlan && (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">{selectedPlan.name}</h4>
                            <p className="text-2xl font-bold mb-2">R$ {selectedPlan.price}/{selectedPlan.interval === 'monthly' ? 'mês' : 'ano'}</p>
                            <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setIsDialogOpen(false)}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                            <Button 
                              onClick={() => subscribeToPlan(selectedPlan.id)}
                              className="flex-1"
                            >
                              Confirmar Assinatura
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Subscriptions;