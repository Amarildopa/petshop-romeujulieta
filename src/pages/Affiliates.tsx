import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  Users, 
  DollarSign, 
  Share2, 
  Copy, 
  Eye,
  Target,
  Award,
  Link,
  BarChart3,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';

interface AffiliateProgram {
  id: string;
  name: string;
  description: string;
  commissionRate: number;
  cookieDuration: number; // em dias
  minPayout: number;
  payoutSchedule: 'weekly' | 'monthly' | 'on-demand';
  isActive: boolean;
  tiers: AffiliateTier[];
}

interface AffiliateTier {
  id: string;
  name: string;
  minSales: number;
  commissionRate: number;
  bonuses: string[];
  color: string;
}

interface AffiliateStats {
  userId: string;
  programId: string;
  referralCode: string;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  currentTier: string;
  joinedAt: Date;
  lastActivity: Date;
}

interface AffiliateLink {
  id: string;
  affiliateId: string;
  productId?: string;
  categoryId?: string;
  url: string;
  shortUrl: string;
  title: string;
  clicks: number;
  conversions: number;
  createdAt: Date;
}

interface Commission {
  id: string;
  affiliateId: string;
  orderId: string;
  productName: string;
  orderValue: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  createdAt: Date;
  paidAt?: Date;
}

interface Referral {
  id: string;
  affiliateId: string;
  customerEmail: string;
  customerName: string;
  status: 'pending' | 'converted' | 'inactive';
  firstPurchase?: Date;
  totalPurchases: number;
  totalValue: number;
  createdAt: Date;
}

const Affiliates: React.FC = () => {
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null);
  const [affiliateProgram, setAffiliateProgram] = useState<AffiliateProgram | null>(null);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  // Mock data
  const mockAffiliateProgram: AffiliateProgram = {
    id: '1',
    name: 'Programa de Afiliados Pet Shop',
    description: 'Ganhe comissões indicando nossos produtos para seus amigos!',
    commissionRate: 10,
    cookieDuration: 30,
    minPayout: 50,
    payoutSchedule: 'monthly',
    isActive: true,
    tiers: [
      {
        id: '1',
        name: 'Iniciante',
        minSales: 0,
        commissionRate: 10,
        bonuses: ['Comissão de 10%', 'Suporte básico'],
        color: 'bg-gray-500'
      },
      {
        id: '2',
        name: 'Intermediário',
        minSales: 10,
        commissionRate: 12,
        bonuses: ['Comissão de 12%', 'Materiais promocionais', 'Suporte prioritário'],
        color: 'bg-blue-500'
      },
      {
        id: '3',
        name: 'Avançado',
        minSales: 50,
        commissionRate: 15,
        bonuses: ['Comissão de 15%', 'Bônus por performance', 'Gerente dedicado'],
        color: 'bg-purple-500'
      },
      {
        id: '4',
        name: 'Elite',
        minSales: 100,
        commissionRate: 20,
        bonuses: ['Comissão de 20%', 'Todos os benefícios anteriores', 'Eventos exclusivos'],
        color: 'bg-yellow-500'
      }
    ]
  };

  const mockAffiliateStats: AffiliateStats = {
    userId: '1',
    programId: '1',
    referralCode: 'PETLOVER2024',
    totalClicks: 1250,
    totalConversions: 87,
    conversionRate: 6.96,
    totalCommissions: 2450.80,
    pendingCommissions: 340.50,
    paidCommissions: 2110.30,
    currentTier: '2',
    joinedAt: new Date('2023-08-15'),
    lastActivity: new Date('2024-01-15')
  };

  const mockAffiliateLinks: AffiliateLink[] = [
    {
      id: '1',
      affiliateId: '1',
      productId: 'prod-1',
      url: 'https://petshop.com/produto/racao-premium?ref=PETLOVER2024',
      shortUrl: 'https://petshop.com/r/abc123',
      title: 'Ração Premium para Cães',
      clicks: 450,
      conversions: 32,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      affiliateId: '1',
      categoryId: 'cat-toys',
      url: 'https://petshop.com/categoria/brinquedos?ref=PETLOVER2024',
      shortUrl: 'https://petshop.com/r/def456',
      title: 'Categoria Brinquedos',
      clicks: 320,
      conversions: 18,
      createdAt: new Date('2024-01-05')
    },
    {
      id: '3',
      affiliateId: '1',
      url: 'https://petshop.com?ref=PETLOVER2024',
      shortUrl: 'https://petshop.com/r/ghi789',
      title: 'Página Principal',
      clicks: 480,
      conversions: 37,
      createdAt: new Date('2024-01-10')
    }
  ];

  const mockCommissions: Commission[] = [
    {
      id: '1',
      affiliateId: '1',
      orderId: 'ORD-001',
      productName: 'Ração Premium Golden',
      orderValue: 150.00,
      commissionRate: 12,
      commissionAmount: 18.00,
      status: 'paid',
      createdAt: new Date('2024-01-10'),
      paidAt: new Date('2024-01-15')
    },
    {
      id: '2',
      affiliateId: '1',
      orderId: 'ORD-002',
      productName: 'Kit Brinquedos Interativos',
      orderValue: 89.90,
      commissionRate: 12,
      commissionAmount: 10.79,
      status: 'approved',
      createdAt: new Date('2024-01-12')
    },
    {
      id: '3',
      affiliateId: '1',
      orderId: 'ORD-003',
      productName: 'Coleira Inteligente',
      orderValue: 299.90,
      commissionRate: 12,
      commissionAmount: 35.99,
      status: 'pending',
      createdAt: new Date('2024-01-14')
    }
  ];

  const mockReferrals: Referral[] = [
    {
      id: '1',
      affiliateId: '1',
      customerEmail: 'maria@email.com',
      customerName: 'Maria Silva',
      status: 'converted',
      firstPurchase: new Date('2024-01-10'),
      totalPurchases: 3,
      totalValue: 450.80,
      createdAt: new Date('2024-01-08')
    },
    {
      id: '2',
      affiliateId: '1',
      customerEmail: 'joao@email.com',
      customerName: 'João Santos',
      status: 'converted',
      firstPurchase: new Date('2024-01-12'),
      totalPurchases: 1,
      totalValue: 89.90,
      createdAt: new Date('2024-01-11')
    },
    {
      id: '3',
      affiliateId: '1',
      customerEmail: 'ana@email.com',
      customerName: 'Ana Costa',
      status: 'pending',
      totalPurchases: 0,
      totalValue: 0,
      createdAt: new Date('2024-01-14')
    }
  ];

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setAffiliateProgram(mockAffiliateProgram);
      setAffiliateStats(mockAffiliateStats);
      setAffiliateLinks(mockAffiliateLinks);
      setCommissions(mockCommissions);
      setReferrals(mockReferrals);
      setLoading(false);
    }, 1000);
  }, []);

  const getCurrentTier = () => {
    if (!affiliateProgram || !affiliateStats) return null;
    return affiliateProgram.tiers.find(tier => tier.id === affiliateStats.currentTier);
  };

  const getNextTier = () => {
    if (!affiliateProgram || !affiliateStats) return null;
    const currentTierIndex = affiliateProgram.tiers.findIndex(tier => tier.id === affiliateStats.currentTier);
    return affiliateProgram.tiers[currentTierIndex + 1] || null;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado para a área de transferência!');
  };

  const handleCreateLink = async () => {
    if (!newLinkTitle.trim()) {
      toast.error('Digite um título para o link');
      return;
    }

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newLink: AffiliateLink = {
        id: Date.now().toString(),
        affiliateId: '1',
        url: `https://petshop.com${selectedProduct ? `/produto/${selectedProduct}` : ''}?ref=${affiliateStats?.referralCode}`,
        shortUrl: `https://petshop.com/r/${Math.random().toString(36).substr(2, 6)}`,
        title: newLinkTitle,
        clicks: 0,
        conversions: 0,
        createdAt: new Date()
      };

      setAffiliateLinks(prev => [newLink, ...prev]);
      setNewLinkTitle('');
      setSelectedProduct('');
      toast.success('Link criado com sucesso!');
    } catch {
      toast.error('Erro ao criar link. Tente novamente.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Programa de Afiliados</h1>
        <p className="text-gray-600">{affiliateProgram?.description}</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {affiliateStats?.totalClicks.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {affiliateStats?.totalConversions}
            </div>
            <p className="text-xs text-gray-500">
              {affiliateStats?.conversionRate.toFixed(2)}% taxa de conversão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {affiliateStats?.pendingCommissions.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {affiliateStats?.totalCommissions.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="links">Meus Links</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
          <TabsTrigger value="referrals">Indicações</TabsTrigger>
          <TabsTrigger value="tiers">Níveis</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Código de Referência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Seu Código de Referência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input 
                    value={affiliateStats?.referralCode || ''} 
                    readOnly 
                    className="font-mono text-lg"
                  />
                </div>
                <Button 
                  onClick={() => copyToClipboard(affiliateStats?.referralCode || '')}
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Nível Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Nível Atual: {currentTier?.name}
              </CardTitle>
              <CardDescription>
                Comissão atual: {currentTier?.commissionRate}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentTier?.bonuses.map((bonus, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{bonus}</span>
                    </div>
                  ))}
                </div>
                {nextTier && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">
                      Próximo nível: {nextTier.name}
                    </div>
                    <div className="text-sm text-blue-700">
                      Faltam {nextTier.minSales - (affiliateStats?.totalConversions || 0)} vendas para o próximo nível
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Recente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance dos Últimos 30 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1,250</div>
                  <div className="text-sm text-gray-500">Cliques</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">87</div>
                  <div className="text-sm text-gray-500">Conversões</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">R$ 340,50</div>
                  <div className="text-sm text-gray-500">Comissões</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          {/* Criar Novo Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Criar Novo Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="linkTitle">Título do Link</Label>
                  <Input
                    id="linkTitle"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    placeholder="Ex: Ração Premium para Cães"
                  />
                </div>
                <div>
                  <Label htmlFor="productSelect">Produto (Opcional)</Label>
                  <Input
                    id="productSelect"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    placeholder="ID do produto ou deixe vazio para link geral"
                  />
                </div>
                <Button onClick={handleCreateLink} className="w-full">
                  Criar Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Links */}
          <div className="space-y-4">
            {affiliateLinks.map(link => (
              <Card key={link.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                      <CardDescription>
                        Criado em {link.createdAt.toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {link.clicks} cliques • {link.conversions} conversões
                      </div>
                      <div className="text-sm font-medium">
                        {link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : 0}% conversão
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-500">Link Curto</Label>
                      <div className="flex items-center gap-2">
                        <Input value={link.shortUrl} readOnly className="font-mono text-sm" />
                        <Button 
                          onClick={() => copyToClipboard(link.shortUrl)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Link Completo</Label>
                      <div className="flex items-center gap-2">
                        <Input value={link.url} readOnly className="font-mono text-sm" />
                        <Button 
                          onClick={() => copyToClipboard(link.url)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Histórico de Comissões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commissions.map(commission => (
                  <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{commission.productName}</div>
                      <div className="text-sm text-gray-500">
                        Pedido #{commission.orderId} • {commission.createdAt.toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        Valor do pedido: R$ {commission.orderValue.toFixed(2)} • Taxa: {commission.commissionRate}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        R$ {commission.commissionAmount.toFixed(2)}
                      </div>
                      <Badge className={getStatusColor(commission.status)}>
                        {commission.status === 'pending' ? 'Pendente' :
                         commission.status === 'approved' ? 'Aprovada' :
                         commission.status === 'paid' ? 'Paga' : 'Cancelada'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Suas Indicações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referrals.map(referral => (
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{referral.customerName}</div>
                      <div className="text-sm text-gray-500">{referral.customerEmail}</div>
                      <div className="text-sm text-gray-500">
                        Indicado em {referral.createdAt.toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {referral.totalPurchases} compras • R$ {referral.totalValue.toFixed(2)}
                      </div>
                      <Badge className={getStatusColor(referral.status)}>
                        {referral.status === 'pending' ? 'Pendente' :
                         referral.status === 'converted' ? 'Convertido' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {affiliateProgram?.tiers.map((tier) => (
              <Card key={tier.id} className={`relative ${
                tier.id === affiliateStats?.currentTier ? 'ring-2 ring-blue-500' : ''
              }`}>
                {tier.id === affiliateStats?.currentTier && (
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
                    A partir de {tier.minSales} vendas • {tier.commissionRate}% de comissão
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tier.bonuses.map((bonus, bonusIndex) => (
                      <div key={bonusIndex} className="flex items-center gap-2 text-sm">
                        <Award className="h-3 w-3 text-yellow-500" />
                        {bonus}
                      </div>
                    ))}
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

export default Affiliates;