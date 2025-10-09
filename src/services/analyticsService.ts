 
interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  conversionRate: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  returnCustomerRate: number;
}

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  sales?: number;
  views?: number;
  revenue?: number;
  orders?: number;
  customers?: number;
  category?: string;
  source?: string;
  segment?: string;
  step?: string;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  views: number;
  conversionRate: number;
}

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  orders: number;
  lastOrder: string;
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  revenueData: ChartDataPoint[];
  ordersData: ChartDataPoint[];
  customersData: ChartDataPoint[];
  productPerformance: ChartDataPoint[];
  categoryPerformance: ChartDataPoint[];
  trafficSources: ChartDataPoint[];
  customerSegments: ChartDataPoint[];
  salesFunnel: ChartDataPoint[];
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
}

interface RealtimeMetrics {
  activeUsers: number;
  currentSales: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentActivity: {
    type: 'order' | 'user' | 'product' | 'review';
    message: string;
    timestamp: string;
  }[];
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  filters: Record<string, string | number | boolean>;
  schedule?: 'daily' | 'weekly' | 'monthly';
  recipients?: string[];
  createdAt: string;
  lastRun?: string;
}

interface Cohort {
  period: string;
  users: number;
  retention: number[];
}

interface FunnelStep {
  name: string;
  users: number;
  conversionRate: number;
}

class AnalyticsService {
  private baseUrl = '/api/analytics';

  // Obter dados de analytics por período
  async getAnalyticsData(period: string = '30d'): Promise<AnalyticsData> {
    try {
      // Simulação de dados para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return this.getMockAnalyticsData(period);
    } catch (error) {
      console.error('Erro ao obter dados de analytics:', error);
      throw error;
    }
  }

  // Obter métricas em tempo real
  async getRealtimeMetrics(): Promise<RealtimeMetrics> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        activeUsers: Math.floor(Math.random() * 100) + 50,
        currentSales: Math.floor(Math.random() * 10000) + 5000,
        pendingOrders: Math.floor(Math.random() * 20) + 5,
        lowStockProducts: Math.floor(Math.random() * 15) + 3,
        recentActivity: [
          {
            type: 'order',
            message: 'Novo pedido #12345 - R$ 299,90',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
          },
          {
            type: 'user',
            message: 'Novo usuário cadastrado: João Silva',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
          },
          {
            type: 'product',
            message: 'Produto "Ração Premium" com estoque baixo',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
          },
          {
            type: 'review',
            message: 'Nova avaliação 5 estrelas para "Brinquedo Interativo"',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
          }
        ]
      };
    } catch (error) {
      console.error('Erro ao obter métricas em tempo real:', error);
      throw error;
    }
  }

  // Exportar relatório
  async exportReport(reportId: string, /* format: 'csv' | 'pdf' | 'excel' = 'csv' */): Promise<Blob> {
    const report = this.customReports.find(r => r.id === reportId);
    if (!report) {
      throw new Error('Relatório não encontrado');
    }

    // Simular exportação
    const data = await this.getAnalyticsData();
    // Limite para exportação (1000)
    
    // Aqui seria implementada a lógica real de exportação
    const content = JSON.stringify(data, null, 2);
    return new Blob([content], { type: 'application/json' });
  }

  // Criar relatório customizado
  async createCustomReport(report: Omit<CustomReport, 'id' | 'createdAt'>): Promise<CustomReport> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newReport: CustomReport = {
        ...report,
        id: `report_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      return newReport;
    } catch (error) {
      console.error('Erro ao criar relatório customizado:', error);
      throw error;
    }
  }

  // Obter relatórios customizados
  async getCustomReports(): Promise<CustomReport[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return [
        {
          id: 'report_1',
          name: 'Relatório de Vendas Semanal',
          description: 'Análise semanal de vendas por categoria',
          metrics: ['revenue', 'orders', 'conversion'],
          filters: { period: '7d', category: 'all' },
          schedule: 'weekly',
          recipients: ['admin@petshop.com'],
          createdAt: '2024-01-15T10:00:00Z',
          lastRun: '2024-01-22T10:00:00Z'
        },
        {
          id: 'report_2',
          name: 'Performance de Produtos',
          description: 'Análise mensal de performance de produtos',
          metrics: ['sales', 'views', 'conversion', 'revenue'],
          filters: { period: '30d', minSales: 10 },
          schedule: 'monthly',
          recipients: ['manager@petshop.com', 'admin@petshop.com'],
          createdAt: '2024-01-10T15:30:00Z',
          lastRun: '2024-01-20T15:30:00Z'
        }
      ];
    } catch (error) {
      console.error('Erro ao obter relatórios customizados:', error);
      throw error;
    }
  }

  // Executar relatório customizado
  async runCustomReport(reportId: string): Promise<string> {
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return `https://api.petshop.com/reports/custom-${reportId}-${Date.now()}.pdf`;
    } catch (error) {
      console.error('Erro ao executar relatório customizado:', error);
      throw error;
    }
  }

  // Obter análise de coorte
  async getCohortAnalysis(_period: 'weekly' | 'monthly' = 'monthly'): Promise<Cohort[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const cohorts: Cohort[] = [];
      const periodsCount = _period === 'weekly' ? 12 : 6;
      
      for (let i = 0; i < periodsCount; i++) {
        const date = new Date();
        if (_period === 'weekly') {
          date.setDate(date.getDate() - (i * 7));
        } else {
          date.setMonth(date.getMonth() - i);
        }
        
        const retention = [];
        for (let j = 0; j < 6; j++) {
          retention.push(Math.max(0, 100 - (j * 15) - Math.random() * 20));
        }
        
        cohorts.push({
          period: _period === 'weekly' 
            ? `Semana ${date.toLocaleDateString('pt-BR')}` 
            : date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          users: Math.floor(Math.random() * 500) + 100,
          retention
        });
      }
      
      return cohorts.reverse();
    } catch (error) {
      console.error('Erro ao obter análise de coorte:', error);
      throw error;
    }
  }

  // Obter análise de funil
  async getFunnelAnalysis(): Promise<FunnelStep[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const totalVisitors = 10000;
      
      return [
        {
          name: 'Visitantes',
          users: totalVisitors,
          conversionRate: 100
        },
        {
          name: 'Visualizaram Produto',
          users: Math.floor(totalVisitors * 0.6),
          conversionRate: 60
        },
        {
          name: 'Adicionaram ao Carrinho',
          users: Math.floor(totalVisitors * 0.25),
          conversionRate: 25
        },
        {
          name: 'Iniciaram Checkout',
          users: Math.floor(totalVisitors * 0.15),
          conversionRate: 15
        },
        {
          name: 'Completaram Compra',
          users: Math.floor(totalVisitors * 0.08),
          conversionRate: 8
        }
      ];
    } catch (error) {
      console.error('Erro ao obter análise de funil:', error);
      throw error;
    }
  }

  // Obter insights de IA
  async getAIInsights(/* period: string = '30d' */): Promise<{
    insights: string[];
    recommendations: string[];
    alerts: string[];
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        insights: [
          'Vendas de produtos para gatos aumentaram 25% no último mês',
          'Taxa de conversão é 15% maior aos fins de semana',
          'Clientes que compram ração premium têm 40% mais chance de comprar brinquedos',
          'Campanhas de email têm ROI 3x maior que anúncios pagos'
        ],
        recommendations: [
          'Aumentar estoque de produtos para gatos devido ao crescimento da demanda',
          'Criar campanhas específicas para fins de semana',
          'Implementar cross-selling de brinquedos para compradores de ração premium',
          'Investir mais em marketing por email e reduzir gastos com anúncios pagos'
        ],
        alerts: [
          'Estoque baixo: Ração Premium para Cães (apenas 5 unidades)',
          'Taxa de abandono de carrinho aumentou 12% esta semana',
          'Tempo de resposta do suporte está acima da meta (2h vs 1h)'
        ]
      };
    } catch (error) {
      console.error('Erro ao obter insights de IA:', error);
      throw error;
    }
  }

  // Comparar períodos
  async comparePeriods(/* currentPeriod: string, previousPeriod: string */): Promise<{
    current: AnalyticsOverview;
    previous: AnalyticsOverview;
    changes: Record<string, { value: number; percentage: number }>;
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const current = this.getMockOverview();
      const previous = {
        ...current,
        totalRevenue: current.totalRevenue * 0.9,
        totalOrders: current.totalOrders * 0.85,
        totalCustomers: current.totalCustomers * 0.95,
        conversionRate: current.conversionRate * 0.92
      };
      
      const changes: Record<string, { value: number; percentage: number }> = {};
      
      Object.keys(current).forEach(key => {
        const currentValue = current[key as keyof AnalyticsOverview] as number;
        const previousValue = previous[key as keyof AnalyticsOverview] as number;
        const difference = currentValue - previousValue;
        const percentage = (difference / previousValue) * 100;
        
        changes[key] = {
          value: difference,
          percentage: Math.round(percentage * 100) / 100
        };
      });
      
      return { current, previous, changes };
    } catch (error) {
      console.error('Erro ao comparar períodos:', error);
      throw error;
    }
  }

  // Dados mockados para desenvolvimento
  private getMockAnalyticsData(period: string): AnalyticsData {
    const days = this.getPeriodDays(period);
    
    return {
      overview: this.getMockOverview(),
      revenueData: this.generateTimeSeriesData(days, 'revenue'),
      ordersData: this.generateTimeSeriesData(days, 'orders'),
      customersData: this.generateTimeSeriesData(days, 'customers'),
      productPerformance: this.getMockProductPerformance(),
      categoryPerformance: this.getMockCategoryPerformance(),
      trafficSources: this.getMockTrafficSources(),
      customerSegments: this.getMockCustomerSegments(),
      salesFunnel: this.getMockSalesFunnel(),
      topProducts: this.getMockTopProducts(),
      topCustomers: this.getMockTopCustomers()
    };
  }

  private getMockOverview(): AnalyticsOverview {
    return {
      totalRevenue: 125000 + Math.random() * 25000,
      totalOrders: 850 + Math.floor(Math.random() * 200),
      totalCustomers: 1200 + Math.floor(Math.random() * 300),
      totalProducts: 450 + Math.floor(Math.random() * 50),
      conversionRate: 3.2 + Math.random() * 1.5,
      averageOrderValue: 147 + Math.random() * 50,
      customerLifetimeValue: 890 + Math.random() * 200,
      returnCustomerRate: 35 + Math.random() * 15
    };
  }

  private generateTimeSeriesData(days: number, type: 'revenue' | 'orders' | 'customers'): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    const baseValue = type === 'revenue' ? 5000 : type === 'orders' ? 30 : 20;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        name: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        value: Math.floor(baseValue + Math.random() * baseValue * 0.5)
      });
    }
    
    return data;
  }

  private getMockProductPerformance(): ChartDataPoint[] {
    const products = ['Ração Premium', 'Brinquedos', 'Acessórios', 'Medicamentos', 'Higiene'];
    
    return products.map(product => ({
      name: product,
      sales: Math.floor(Math.random() * 100) + 20,
      views: Math.floor(Math.random() * 1000) + 200,
      revenue: Math.floor(Math.random() * 10000) + 2000,
      value: Math.floor(Math.random() * 100) + 20
    }));
  }

  private getMockCategoryPerformance(): ChartDataPoint[] {
    return [
      { name: 'Ração', value: 45000 },
      { name: 'Brinquedos', value: 28000 },
      { name: 'Acessórios', value: 22000 },
      { name: 'Medicamentos', value: 18000 },
      { name: 'Higiene', value: 12000 }
    ];
  }

  private getMockTrafficSources(): ChartDataPoint[] {
    return [
      { name: 'Busca Orgânica', value: 4500 },
      { name: 'Direto', value: 3200 },
      { name: 'Redes Sociais', value: 2800 },
      { name: 'Email Marketing', value: 1900 },
      { name: 'Anúncios Pagos', value: 1600 },
      { name: 'Referências', value: 800 }
    ];
  }

  private getMockCustomerSegments(): ChartDataPoint[] {
    return [
      { name: 'Novos Clientes', value: 450 },
      { name: 'Clientes Recorrentes', value: 320 },
      { name: 'VIP', value: 180 },
      { name: 'Inativos', value: 250 }
    ];
  }

  private getMockSalesFunnel(): ChartDataPoint[] {
    return [
      { name: 'Visitantes', value: 10000 },
      { name: 'Visualizaram Produto', value: 6000 },
      { name: 'Adicionaram ao Carrinho', value: 2500 },
      { name: 'Iniciaram Checkout', value: 1500 },
      { name: 'Completaram Compra', value: 800 }
    ];
  }

  private getMockTopProducts(): TopProduct[] {
    return [
      {
        id: '1',
        name: 'Ração Premium para Cães Adultos 15kg',
        sales: 245,
        revenue: 36750,
        views: 3200,
        conversionRate: 7.6
      },
      {
        id: '2',
        name: 'Brinquedo Interativo para Gatos',
        sales: 189,
        revenue: 9450,
        views: 2800,
        conversionRate: 6.8
      },
      {
        id: '3',
        name: 'Coleira Antipulgas Premium',
        sales: 156,
        revenue: 7800,
        views: 2100,
        conversionRate: 7.4
      },
      {
        id: '4',
        name: 'Shampoo Hipoalergênico',
        sales: 134,
        revenue: 4020,
        views: 1900,
        conversionRate: 7.1
      },
      {
        id: '5',
        name: 'Cama Ortopédica para Cães',
        sales: 98,
        revenue: 14700,
        views: 1500,
        conversionRate: 6.5
      }
    ];
  }

  private getMockTopCustomers(): TopCustomer[] {
    return [
      {
        id: '1',
        name: 'Maria Silva',
        email: 'maria.silva@email.com',
        totalSpent: 2850,
        orders: 12,
        lastOrder: '2024-01-20T10:30:00Z'
      },
      {
        id: '2',
        name: 'João Santos',
        email: 'joao.santos@email.com',
        totalSpent: 2340,
        orders: 8,
        lastOrder: '2024-01-18T15:45:00Z'
      },
      {
        id: '3',
        name: 'Ana Costa',
        email: 'ana.costa@email.com',
        totalSpent: 1980,
        orders: 15,
        lastOrder: '2024-01-22T09:15:00Z'
      },
      {
        id: '4',
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@email.com',
        totalSpent: 1750,
        orders: 6,
        lastOrder: '2024-01-19T14:20:00Z'
      },
      {
        id: '5',
        name: 'Carla Mendes',
        email: 'carla.mendes@email.com',
        totalSpent: 1650,
        orders: 9,
        lastOrder: '2024-01-21T11:00:00Z'
      }
    ];
  }

  private getPeriodDays(period: string): number {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }
}

export const analyticsService = new AnalyticsService();
export type { AnalyticsData, RealtimeMetrics, CustomReport, Cohort, FunnelStep };