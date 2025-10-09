 
// Mock data and service for marketplace functionality

export interface Seller {
  id: string;
  name: string;
  email: string;
  storeName: string;
  logo?: string;
  description: string;
  rating: number;
  totalSales: number;
  totalProducts: number;
  joinDate: string;
  status: 'active' | 'pending' | 'suspended';
  commission: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  documents: {
    cnpj?: string;
    cpf?: string;
    verified: boolean;
  };
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  sellerId: string;
  sellerName: string;
  stock: number;
  sales: number;
  rating: number;
  reviews: number;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  createdAt: string;
  commission: number;
}

export interface MarketplaceStats {
  totalSellers: number;
  activeSellers: number;
  totalProducts: number;
  totalSales: number;
  totalCommission: number;
  pendingApprovals: number;
  averageRating: number;
  conversionRate: number;
}

export interface Commission {
  id: string;
  sellerId: string;
  sellerName: string;
  orderId: string;
  productId: string;
  productName: string;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
}

export interface SellerApplication {
  id: string;
  name: string;
  email: string;
  storeName: string;
  description: string;
  documents: {
    cnpj?: string;
    cpf?: string;
    businessLicense?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface MarketplaceSettings {
  defaultCommissionRate: number;
  autoApproveProducts: boolean;
  autoApproveSellers: boolean;
  commissionPaymentPeriod: 'weekly' | 'biweekly' | 'monthly';
  minimumSellerRating: number;
  requireSellerVerification: boolean;
  notifyAdminsNewSellers: boolean;
  allowSellerPromotions: boolean;
}

export interface SellerPerformance {
  sellerId: string;
  period: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  customerSatisfaction: number;
  returnRate: number;
  commissionEarned: number;
}

// Mock data
const mockSellers: Seller[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@petstore.com',
    storeName: 'Pet Store ABC',
    description: 'Especializada em produtos premium para cães e gatos',
    rating: 4.8,
    totalSales: 25000,
    totalProducts: 45,
    joinDate: '2024-01-15',
    status: 'active',
    commission: 15,
    address: {
      street: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    },
    documents: {
      cnpj: '12.345.678/0001-90',
      verified: true
    }
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@lojadopet.com',
    storeName: 'Loja do Pet',
    description: 'Produtos naturais e orgânicos para pets',
    rating: 4.6,
    totalSales: 18500,
    totalProducts: 32,
    joinDate: '2024-02-20',
    status: 'active',
    commission: 12,
    address: {
      street: 'Av. Principal, 456',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20000-000'
    },
    documents: {
      cpf: '123.456.789-00',
      verified: true
    }
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@petshop.com',
    storeName: 'Pet Shop Premium',
    description: 'Acessórios e brinquedos de luxo para pets',
    rating: 4.2,
    totalSales: 8900,
    totalProducts: 28,
    joinDate: '2024-03-10',
    status: 'pending',
    commission: 18,
    address: {
      street: 'Rua do Comércio, 789',
      city: 'Belo Horizonte',
      state: 'MG',
      zipCode: '30000-000'
    },
    documents: {
      cnpj: '98.765.432/0001-10',
      verified: false
    }
  }
];

const mockProducts: MarketplaceProduct[] = [
  {
    id: '1',
    name: 'Ração Premium para Cães',
    description: 'Ração super premium com ingredientes naturais',
    price: 89.90,
    originalPrice: 99.90,
    images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20dog%20food%20bag%20high%20quality&image_size=square'],
    category: 'Alimentação',
    sellerId: '1',
    sellerName: 'Pet Store ABC',
    stock: 50,
    sales: 125,
    rating: 4.7,
    reviews: 23,
    status: 'active',
    createdAt: '2024-01-20',
    commission: 15
  },
  {
    id: '2',
    name: 'Brinquedo Interativo para Gatos',
    description: 'Brinquedo que estimula a inteligência felina',
    price: 45.50,
    images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=interactive%20cat%20toy%20colorful%20modern&image_size=square'],
    category: 'Brinquedos',
    sellerId: '2',
    sellerName: 'Loja do Pet',
    stock: 30,
    sales: 78,
    rating: 4.5,
    reviews: 15,
    status: 'active',
    createdAt: '2024-02-15',
    commission: 12
  },
  {
    id: '3',
    name: 'Coleira de Couro Premium',
    description: 'Coleira artesanal em couro legítimo',
    price: 120.00,
    images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20leather%20dog%20collar%20luxury&image_size=square'],
    category: 'Acessórios',
    sellerId: '3',
    sellerName: 'Pet Shop Premium',
    stock: 15,
    sales: 32,
    rating: 4.8,
    reviews: 8,
    status: 'pending',
    createdAt: '2024-03-01',
    commission: 18
  }
];

const mockCommissions: Commission[] = [
  {
    id: '1',
    sellerId: '1',
    sellerName: 'Pet Store ABC',
    orderId: 'ORD-001',
    productId: '1',
    productName: 'Ração Premium para Cães',
    saleAmount: 89.90,
    commissionRate: 15,
    commissionAmount: 13.49,
    status: 'pending',
    createdAt: '2024-03-15'
  },
  {
    id: '2',
    sellerId: '2',
    sellerName: 'Loja do Pet',
    orderId: 'ORD-002',
    productId: '2',
    productName: 'Brinquedo Interativo para Gatos',
    saleAmount: 45.50,
    commissionRate: 12,
    commissionAmount: 5.46,
    status: 'paid',
    createdAt: '2024-03-10',
    paidAt: '2024-03-17'
  },
  {
    id: '3',
    sellerId: '1',
    sellerName: 'Pet Store ABC',
    orderId: 'ORD-003',
    productId: '1',
    productName: 'Ração Premium para Cães',
    saleAmount: 179.80,
    commissionRate: 15,
    commissionAmount: 26.97,
    status: 'pending',
    createdAt: '2024-03-18'
  }
];

const mockStats: MarketplaceStats = {
  totalSellers: 3,
  activeSellers: 2,
  totalProducts: 105,
  totalSales: 52400,
  totalCommission: 7860,
  pendingApprovals: 5,
  averageRating: 4.5,
  conversionRate: 3.2
};

class MarketplaceService {
  // Get marketplace statistics
  async getMarketplaceStats(): Promise<MarketplaceStats> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockStats;
  }

  // Get all sellers
  async getSellers(): Promise<Seller[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockSellers;
  }

  // Get seller by ID
  async getSellerById(sellerId: string): Promise<Seller | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockSellers.find(seller => seller.id === sellerId) || null;
  }

  // Create new seller
  async createSeller(sellerData: Omit<Seller, 'id' | 'rating' | 'totalSales' | 'totalProducts' | 'joinDate'>): Promise<Seller> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newSeller: Seller = {
      ...sellerData,
      id: Date.now().toString(),
      rating: 0,
      totalSales: 0,
      totalProducts: 0,
      joinDate: new Date().toISOString()
    };
    
    mockSellers.push(newSeller);
    return newSeller;
  }

  // Update seller status
  async updateSellerStatus(sellerId: string, status: 'active' | 'pending' | 'suspended'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const sellerIndex = mockSellers.findIndex(seller => seller.id === sellerId);
    if (sellerIndex !== -1) {
      mockSellers[sellerIndex].status = status;
    }
  }

  // Get all products
  async getProducts(): Promise<MarketplaceProduct[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProducts;
  }

  // Get products by seller
  async getProductsBySeller(sellerId: string): Promise<MarketplaceProduct[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockProducts.filter(product => product.sellerId === sellerId);
  }

  // Update product status
  async updateProductStatus(productId: string, status: 'active' | 'inactive' | 'pending' | 'rejected'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const productIndex = mockProducts.findIndex(product => product.id === productId);
    if (productIndex !== -1) {
      mockProducts[productIndex].status = status;
    }
  }

  // Get all commissions
  async getCommissions(): Promise<Commission[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCommissions;
  }

  // Get commissions by seller
  async getCommissionsBySeller(sellerId: string): Promise<Commission[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockCommissions.filter(commission => commission.sellerId === sellerId);
  }

  // Pay commission
  async payCommission(commissionId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const commissionIndex = mockCommissions.findIndex(commission => commission.id === commissionId);
    if (commissionIndex !== -1) {
      mockCommissions[commissionIndex].status = 'paid';
      mockCommissions[commissionIndex].paidAt = new Date().toISOString();
    }
  }

  // Calculate commission for a sale
  calculateCommission(saleAmount: number, commissionRate: number): number {
    return (saleAmount * commissionRate) / 100;
  }

  // Create commission record
  async createCommission(commissionData: Omit<Commission, 'id' | 'createdAt' | 'commissionAmount'>): Promise<Commission> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const commissionAmount = this.calculateCommission(commissionData.saleAmount, commissionData.commissionRate);
    
    const newCommission: Commission = {
      ...commissionData,
      id: Date.now().toString(),
      commissionAmount,
      createdAt: new Date().toISOString()
    };
    
    mockCommissions.push(newCommission);
    return newCommission;
  }

  // Get seller performance metrics
  async getSellerPerformance(sellerId: string, _period: string): Promise<SellerPerformance> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const seller = mockSellers.find(s => s.id === sellerId);
    if (!seller) {
      throw new Error('Seller not found');
    }
    
    // Mock performance data
    return {
      sellerId,
      period: _period,
      totalSales: seller.totalSales,
      totalOrders: Math.floor(seller.totalSales / 75), // Average order value ~75
      averageOrderValue: 75,
      conversionRate: 3.2,
      customerSatisfaction: seller.rating,
      returnRate: 2.1,
      commissionEarned: seller.totalSales * (seller.commission / 100)
    };
  }

  // Get top performing sellers
  async getTopSellers(limit: number = 10): Promise<Seller[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockSellers
      .filter(seller => seller.status === 'active')
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, limit);
  }

  // Get pending approvals
  async getPendingApprovals(): Promise<{ sellers: Seller[], products: MarketplaceProduct[] }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const pendingSellers = mockSellers.filter(seller => seller.status === 'pending');
    const pendingProducts = mockProducts.filter(product => product.status === 'pending');
    
    return {
      sellers: pendingSellers,
      products: pendingProducts
    };
  }

  // Search sellers
  async searchSellers(query: string): Promise<Seller[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const lowercaseQuery = query.toLowerCase();
    return mockSellers.filter(seller => 
      seller.name.toLowerCase().includes(lowercaseQuery) ||
      seller.storeName.toLowerCase().includes(lowercaseQuery) ||
      seller.email.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Search products
  async searchProducts(query: string): Promise<MarketplaceProduct[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const lowercaseQuery = query.toLowerCase();
    return mockProducts.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.sellerName.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Export reports
  async exportReport(type: 'sellers' | 'products' | 'commissions'): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would generate and return a download URL
    // For now, we'll return a mock URL
    return `https://example.com/reports/marketplace-${type}-${Date.now()}.xlsx`;
  }

  // Get marketplace settings
  async getMarketplaceSettings(): Promise<MarketplaceSettings> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      defaultCommissionRate: 15,
      autoApproveProducts: false,
      autoApproveSellers: false,
      commissionPaymentPeriod: 'monthly',
      minimumSellerRating: 4.0,
      requireSellerVerification: true,
      notifyAdminsNewSellers: true,
      allowSellerPromotions: true
    };
  }

  // Update marketplace settings
  async updateMarketplaceSettings(settings: Partial<MarketplaceSettings>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    // In a real implementation, this would update the settings in the database
    console.log('Marketplace settings updated:', settings);
  }

  // Get commission summary for a period
  async getCommissionSummary(/* period: string */): Promise<{
    totalCommissions: number;
    paidCommissions: number;
    pendingCommissions: number;
    topEarners: { sellerId: string; sellerName: string; totalEarned: number }[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const totalCommissions = mockCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const paidCommissions = mockCommissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.commissionAmount, 0);
    const pendingCommissions = mockCommissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.commissionAmount, 0);
    
    // Calculate top earners
    const earnerMap = new Map<string, { sellerName: string; totalEarned: number }>();
    mockCommissions.forEach(commission => {
      const current = earnerMap.get(commission.sellerId) || { sellerName: commission.sellerName, totalEarned: 0 };
      current.totalEarned += commission.commissionAmount;
      earnerMap.set(commission.sellerId, current);
    });
    
    const topEarners = Array.from(earnerMap.entries())
      .map(([sellerId, data]) => ({ sellerId, ...data }))
      .sort((a, b) => b.totalEarned - a.totalEarned)
      .slice(0, 5);
    
    return {
      totalCommissions,
      paidCommissions,
      pendingCommissions,
      topEarners
    };
  }

  // Validate seller documents
  async validateSellerDocuments(sellerId: string): Promise<{ valid: boolean; issues: string[] }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const seller = mockSellers.find(s => s.id === sellerId);
    if (!seller) {
      return { valid: false, issues: ['Seller not found'] };
    }
    
    const issues: string[] = [];
    
    if (!seller.documents.cnpj && !seller.documents.cpf) {
      issues.push('Missing tax document (CNPJ or CPF)');
    }
    
    if (!seller.documents.verified) {
      issues.push('Documents not verified');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Send notification to seller
  async sendSellerNotification(sellerId: string, message: string, type: 'info' | 'warning' | 'success' | 'error'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real implementation, this would send an email or push notification
    console.log(`Notification sent to seller ${sellerId}:`, { message, type });
  }
}

export const marketplaceService = new MarketplaceService();
export default marketplaceService;