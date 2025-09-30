import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { createError } from '../middleware/errorHandler';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Interfaces para cupons e promoções
interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | 'buy_x_get_y';
  value: number; // Porcentagem ou valor fixo
  minOrderValue?: number;
  maxDiscount?: number;
  // Configurações específicas para buy_x_get_y
  buyQuantity?: number;
  getQuantity?: number;
  applicableProducts?: string[]; // IDs dos produtos aplicáveis
  applicableCategories?: string[]; // IDs das categorias aplicáveis
  excludedProducts?: string[]; // IDs dos produtos excluídos
  // Configurações de uso
  usageLimit?: number; // Limite total de uso
  usageLimitPerUser?: number; // Limite por usuário
  currentUsage: number;
  // Configurações de validade
  startDate: Date;
  endDate: Date;
  // Configurações de visibilidade
  isActive: boolean;
  isPublic: boolean; // Se aparece na lista pública
  requiresMinimumPurchases?: number; // Número mínimo de compras anteriores
  // Configurações de usuário
  applicableUserTypes?: ('new' | 'existing' | 'vip' | 'all')[];
  excludedUsers?: string[]; // IDs de usuários excluídos
  // Metadados
  image?: string;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  usedAt: Date;
}

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'flash_sale' | 'bundle' | 'category_discount' | 'loyalty_bonus' | 'seasonal';
  // Configurações de desconto
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  // Produtos/categorias aplicáveis
  applicableProducts?: string[];
  applicableCategories?: string[];
  // Configurações de bundle
  bundleProducts?: {
    productId: string;
    quantity: number;
    discountPercentage?: number;
  }[];
  bundlePrice?: number;
  // Configurações de tempo
  startDate: Date;
  endDate: Date;
  // Configurações de flash sale
  flashSaleEndTime?: Date;
  originalPrice?: number;
  salePrice?: number;
  // Configurações de estoque
  stockLimit?: number;
  currentStock?: number;
  // Configurações de visibilidade
  isActive: boolean;
  isFeatured: boolean;
  priority: number; // Para ordenação
  // Metadados
  image?: string;
  bannerImage?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  pointsPerReal: number; // Pontos ganhos por real gasto
  pointsValue: number; // Valor de cada ponto em reais
  minPointsToRedeem: number;
  maxPointsPerOrder?: number; // Máximo de pontos que podem ser usados por pedido
  bonusMultipliers: {
    category?: string;
    multiplier: number;
  }[];
  tierBenefits: {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    minPoints: number;
    benefits: string[];
    discountPercentage?: number;
    freeShippingThreshold?: number;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserLoyalty {
  id: string;
  userId: string;
  totalPoints: number;
  availablePoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  totalOrders: number;
  joinDate: Date;
  lastActivity: Date;
}

interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  orderId?: string;
  description: string;
  expiryDate?: Date;
  createdAt: Date;
}

// Dados mockados
const mockCoupons: Map<string, Coupon> = new Map();
const mockCouponUsage: Map<string, CouponUsage[]> = new Map();
const mockPromotions: Map<string, Promotion> = new Map();
const mockLoyaltyProgram: LoyaltyProgram[] = [];
const mockUserLoyalty: Map<string, UserLoyalty> = new Map();
const mockPointsTransactions: Map<string, PointsTransaction[]> = new Map();

// Inicializar dados mockados
const initMockData = () => {
  // Cupons
  const coupons: Coupon[] = [
    {
      id: '1',
      code: 'BEMVINDO10',
      name: 'Desconto de Boas-vindas',
      description: 'Ganhe 10% de desconto na sua primeira compra!',
      type: 'percentage',
      value: 10,
      minOrderValue: 50,
      maxDiscount: 30,
      usageLimit: 1000,
      usageLimitPerUser: 1,
      currentUsage: 245,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
      isPublic: true,
      applicableUserTypes: ['new'],
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=welcome%20discount%20coupon%20design%20with%2010%20percent%20off&image_size=landscape_4_3',
      termsAndConditions: 'Válido apenas para novos usuários. Pedido mínimo de R$ 50,00.',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      code: 'FRETEGRATIS',
      name: 'Frete Grátis',
      description: 'Frete grátis para todo o Brasil!',
      type: 'free_shipping',
      value: 0,
      minOrderValue: 100,
      usageLimit: 500,
      usageLimitPerUser: 3,
      currentUsage: 89,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-30'),
      isActive: true,
      isPublic: true,
      applicableUserTypes: ['all'],
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=free%20shipping%20coupon%20design%20with%20delivery%20truck&image_size=landscape_4_3',
      termsAndConditions: 'Válido para pedidos acima de R$ 100,00. Não cumulativo com outras promoções.',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '3',
      code: 'LEVE3PAGUE2',
      name: 'Leve 3 Pague 2',
      description: 'Na compra de 3 rações, pague apenas 2!',
      type: 'buy_x_get_y',
      value: 0,
      buyQuantity: 3,
      getQuantity: 1,
      applicableCategories: ['cat_1'], // Categoria de rações
      usageLimit: 200,
      usageLimitPerUser: 2,
      currentUsage: 45,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-29'),
      isActive: true,
      isPublic: true,
      applicableUserTypes: ['all'],
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=buy%203%20pay%202%20promotion%20with%20pet%20food%20bags&image_size=landscape_4_3',
      termsAndConditions: 'Válido apenas para rações. O desconto será aplicado no produto de menor valor.',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: '4',
      code: 'VIP20',
      name: 'Desconto VIP',
      description: 'Desconto especial de 20% para clientes VIP',
      type: 'percentage',
      value: 20,
      minOrderValue: 200,
      maxDiscount: 100,
      usageLimit: 50,
      usageLimitPerUser: 1,
      currentUsage: 12,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
      isPublic: false,
      applicableUserTypes: ['vip'],
      requiresMinimumPurchases: 10,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=vip%20exclusive%20discount%20coupon%20gold%20design&image_size=landscape_4_3',
      termsAndConditions: 'Exclusivo para clientes VIP com mais de 10 compras realizadas.',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  coupons.forEach(coupon => {
    mockCoupons.set(coupon.id, coupon);
  });

  // Promoções
  const promotions: Promotion[] = [
    {
      id: '1',
      name: 'Flash Sale - Rações Premium',
      description: 'Até 40% de desconto em rações premium por tempo limitado!',
      type: 'flash_sale',
      discountType: 'percentage',
      discountValue: 40,
      applicableCategories: ['cat_1'],
      startDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // Começou há 2 horas
      endDate: new Date(Date.now() + 22 * 60 * 60 * 1000), // Termina em 22 horas
      flashSaleEndTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // Flash sale termina em 6 horas
      stockLimit: 100,
      currentStock: 67,
      isActive: true,
      isFeatured: true,
      priority: 1,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=flash%20sale%20banner%20premium%20pet%20food%2040%20percent%20off&image_size=landscape_16_9',
      bannerImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=flash%20sale%20countdown%20banner%20pet%20food&image_size=landscape_16_9',
      tags: ['flash', 'premium', 'ração'],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Combo Cuidados Completos',
      description: 'Kit completo: Ração + Shampoo + Brinquedo por um preço especial',
      type: 'bundle',
      discountType: 'fixed',
      discountValue: 0,
      bundleProducts: [
        { productId: '1', quantity: 1, discountPercentage: 0 },
        { productId: '3', quantity: 1, discountPercentage: 15 },
        { productId: '2', quantity: 1, discountPercentage: 20 }
      ],
      bundlePrice: 89.90,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-29'),
      isActive: true,
      isFeatured: true,
      priority: 2,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20care%20bundle%20package%20food%20shampoo%20toy&image_size=landscape_4_3',
      tags: ['bundle', 'cuidados', 'economia'],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: '3',
      name: 'Semana do Pet - Brinquedos',
      description: '25% de desconto em todos os brinquedos durante a semana do pet',
      type: 'category_discount',
      discountType: 'percentage',
      discountValue: 25,
      applicableCategories: ['cat_3'], // Categoria de brinquedos
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-02-22'),
      isActive: true,
      isFeatured: false,
      priority: 3,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20week%20toys%20discount%2025%20percent%20off&image_size=landscape_4_3',
      tags: ['semana', 'brinquedos', 'desconto'],
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-10')
    }
  ];

  promotions.forEach(promotion => {
    mockPromotions.set(promotion.id, promotion);
  });

  // Programa de fidelidade
  const loyaltyProgram: LoyaltyProgram = {
    id: '1',
    name: 'Pet Points',
    description: 'Ganhe pontos a cada compra e troque por descontos incríveis!',
    pointsPerReal: 1, // 1 ponto por real gasto
    pointsValue: 0.01, // Cada ponto vale R$ 0,01
    minPointsToRedeem: 100,
    maxPointsPerOrder: 1000,
    bonusMultipliers: [
      { category: 'cat_1', multiplier: 2 }, // Rações dão pontos em dobro
      { category: 'cat_4', multiplier: 1.5 } // Medicamentos dão 50% a mais
    ],
    tierBenefits: [
      {
        tier: 'bronze',
        minPoints: 0,
        benefits: ['Pontos por compra', 'Ofertas exclusivas'],
        discountPercentage: 0
      },
      {
        tier: 'silver',
        minPoints: 1000,
        benefits: ['Pontos por compra', 'Ofertas exclusivas', 'Frete grátis em pedidos acima de R$ 150'],
        discountPercentage: 5,
        freeShippingThreshold: 150
      },
      {
        tier: 'gold',
        minPoints: 5000,
        benefits: ['Pontos por compra', 'Ofertas exclusivas', 'Frete grátis em pedidos acima de R$ 100', 'Atendimento prioritário'],
        discountPercentage: 10,
        freeShippingThreshold: 100
      },
      {
        tier: 'platinum',
        minPoints: 15000,
        benefits: ['Pontos por compra', 'Ofertas exclusivas', 'Frete grátis sempre', 'Atendimento prioritário', 'Acesso antecipado a promoções'],
        discountPercentage: 15,
        freeShippingThreshold: 0
      }
    ],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  mockLoyaltyProgram.push(loyaltyProgram);

  // Dados de fidelidade dos usuários
  const userLoyaltyData: UserLoyalty[] = [
    {
      id: '1',
      userId: '1',
      totalPoints: 2500,
      availablePoints: 1800,
      tier: 'silver',
      totalSpent: 1250.00,
      totalOrders: 8,
      joinDate: new Date('2023-06-15'),
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      userId: '2',
      totalPoints: 8500,
      availablePoints: 6200,
      tier: 'gold',
      totalSpent: 4250.00,
      totalOrders: 25,
      joinDate: new Date('2023-03-10'),
      lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  userLoyaltyData.forEach(loyalty => {
    mockUserLoyalty.set(loyalty.userId, loyalty);
  });

  // Transações de pontos
  const pointsTransactions: PointsTransaction[] = [
    {
      id: '1',
      userId: '1',
      type: 'earned',
      points: 150,
      orderId: 'order_123',
      description: 'Pontos ganhos na compra #123',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      userId: '1',
      type: 'redeemed',
      points: -500,
      orderId: 'order_124',
      description: 'Pontos utilizados na compra #124',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      userId: '2',
      type: 'bonus',
      points: 200,
      description: 'Bônus por avaliação de produto',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  pointsTransactions.forEach(transaction => {
    const userTransactions = mockPointsTransactions.get(transaction.userId) || [];
    userTransactions.push(transaction);
    mockPointsTransactions.set(transaction.userId, userTransactions);
  });
};

// Inicializar dados mockados
initMockData();

// Função para verificar se um cupom é válido para um usuário
const validateCoupon = (coupon: Coupon, userId: string, orderValue: number): { valid: boolean; error?: string } => {
  if (!coupon.isActive) {
    return { valid: false, error: 'Cupom inativo' };
  }

  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    return { valid: false, error: 'Cupom fora do período de validade' };
  }

  if (coupon.usageLimit && coupon.currentUsage >= coupon.usageLimit) {
    return { valid: false, error: 'Limite de uso do cupom atingido' };
  }

  if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
    return { valid: false, error: `Valor mínimo do pedido: R$ ${coupon.minOrderValue.toFixed(2)}` };
  }

  // Verificar uso por usuário
  if (coupon.usageLimitPerUser) {
    const userUsage = Array.from(mockCouponUsage.values())
      .flat()
      .filter(usage => usage.couponId === coupon.id && usage.userId === userId)
      .length;
    
    if (userUsage >= coupon.usageLimitPerUser) {
      return { valid: false, error: 'Limite de uso por usuário atingido' };
    }
  }

  return { valid: true };
};

// Função para calcular desconto do cupom
const calculateCouponDiscount = (coupon: Coupon, orderValue: number, items: any[]): number => {
  switch (coupon.type) {
    case 'percentage':
      const percentageDiscount = (orderValue * coupon.value) / 100;
      return coupon.maxDiscount ? Math.min(percentageDiscount, coupon.maxDiscount) : percentageDiscount;
    
    case 'fixed':
      return Math.min(coupon.value, orderValue);
    
    case 'free_shipping':
      return 0; // O desconto do frete é calculado separadamente
    
    case 'buy_x_get_y':
      // Lógica simplificada para buy_x_get_y
      if (coupon.applicableCategories && coupon.buyQuantity && coupon.getQuantity) {
        const applicableItems = items.filter(item => 
          coupon.applicableCategories!.includes(item.categoryId)
        );
        
        const totalQuantity = applicableItems.reduce((sum, item) => sum + item.quantity, 0);
        const freeItems = Math.floor(totalQuantity / coupon.buyQuantity) * coupon.getQuantity;
        
        // Aplicar desconto nos itens de menor valor
        const sortedItems = applicableItems.sort((a, b) => a.price - b.price);
        let discount = 0;
        let remainingFreeItems = freeItems;
        
        for (const item of sortedItems) {
          if (remainingFreeItems <= 0) break;
          const itemsToDiscount = Math.min(remainingFreeItems, item.quantity);
          discount += itemsToDiscount * item.price;
          remainingFreeItems -= itemsToDiscount;
        }
        
        return discount;
      }
      return 0;
    
    default:
      return 0;
  }
};

// Listar cupons públicos
router.get('/public', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve ser entre 1 e 50'),
  query('type').optional().isIn(['percentage', 'fixed', 'free_shipping', 'buy_x_get_y'])
], optionalAuth, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const {
      page = 1,
      limit = 20,
      type
    } = req.query;

    const now = new Date();
    
    // Filtrar cupons públicos e ativos
    let coupons = Array.from(mockCoupons.values())
      .filter(coupon => 
        coupon.isPublic && 
        coupon.isActive && 
        coupon.startDate <= now && 
        coupon.endDate >= now
      );

    // Aplicar filtro de tipo
    if (type) {
      coupons = coupons.filter(c => c.type === type);
    }

    // Ordenar por prioridade (cupons com maior desconto primeiro)
    coupons.sort((a, b) => {
      if (a.type === 'percentage' && b.type === 'percentage') {
        return b.value - a.value;
      }
      if (a.type === 'fixed' && b.type === 'fixed') {
        return b.value - a.value;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    // Paginação
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedCoupons = coupons.slice(offset, offset + Number(limit));

    // Remover informações sensíveis
    const publicCoupons = paginatedCoupons.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minOrderValue: coupon.minOrderValue,
      maxDiscount: coupon.maxDiscount,
      endDate: coupon.endDate,
      image: coupon.image,
      termsAndConditions: coupon.termsAndConditions
    }));

    res.json({
      data: publicCoupons,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: coupons.length,
        totalPages: Math.ceil(coupons.length / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Validar cupom
router.post('/validate', [
  body('code').notEmpty().withMessage('Código do cupom é obrigatório'),
  body('orderValue').isFloat({ min: 0 }).withMessage('Valor do pedido deve ser um número positivo'),
  body('items').optional().isArray().withMessage('Items deve ser um array')
], authMiddleware, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { code, orderValue, items = [] } = req.body;

    // Buscar cupom pelo código
    const coupon = Array.from(mockCoupons.values())
      .find(c => c.code.toLowerCase() === code.toLowerCase());

    if (!coupon) {
      throw createError('Cupom não encontrado', 404, 'COUPON_NOT_FOUND');
    }

    // Validar cupom
    const validation = validateCoupon(coupon, userId, orderValue);
    if (!validation.valid) {
      throw createError(validation.error!, 400, 'COUPON_INVALID');
    }

    // Calcular desconto
    const discountAmount = calculateCouponDiscount(coupon, orderValue, items);
    const freeShipping = coupon.type === 'free_shipping';

    res.json({
      data: {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          value: coupon.value
        },
        discountAmount,
        freeShipping,
        valid: true
      }
    });
  } catch (error) {
    next(error);
  }
});

// Listar promoções ativas
router.get('/promotions', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve ser entre 1 e 50'),
  query('type').optional().isIn(['flash_sale', 'bundle', 'category_discount', 'loyalty_bonus', 'seasonal']),
  query('featured').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const {
      page = 1,
      limit = 20,
      type,
      featured
    } = req.query;

    const now = new Date();
    
    // Filtrar promoções ativas
    let promotions = Array.from(mockPromotions.values())
      .filter(promotion => 
        promotion.isActive && 
        promotion.startDate <= now && 
        promotion.endDate >= now
      );

    // Aplicar filtros
    if (type) {
      promotions = promotions.filter(p => p.type === type);
    }
    if (featured !== undefined) {
      promotions = promotions.filter(p => p.isFeatured === featured);
    }

    // Ordenar por prioridade
    promotions.sort((a, b) => a.priority - b.priority);

    // Paginação
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedPromotions = promotions.slice(offset, offset + Number(limit));

    // Adicionar informações de tempo restante para flash sales
    const promotionsWithTimeLeft = paginatedPromotions.map(promotion => {
      const result: any = { ...promotion };
      
      if (promotion.type === 'flash_sale' && promotion.flashSaleEndTime) {
        const timeLeft = promotion.flashSaleEndTime.getTime() - now.getTime();
        result.timeLeftMs = Math.max(0, timeLeft);
        result.isFlashSaleActive = timeLeft > 0;
      }
      
      return result;
    });

    res.json({
      data: promotionsWithTimeLeft,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: promotions.length,
        totalPages: Math.ceil(promotions.length / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obter detalhes de uma promoção
router.get('/promotions/:promotionId', [
  param('promotionId').notEmpty().withMessage('ID da promoção é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { promotionId } = req.params;
    const promotion = mockPromotions.get(promotionId);

    if (!promotion || !promotion.isActive) {
      throw createError('Promoção não encontrada', 404, 'PROMOTION_NOT_FOUND');
    }

    const now = new Date();
    if (promotion.startDate > now || promotion.endDate < now) {
      throw createError('Promoção não está ativa', 400, 'PROMOTION_INACTIVE');
    }

    // Adicionar informações de tempo restante
    const result: any = { ...promotion };
    
    if (promotion.type === 'flash_sale' && promotion.flashSaleEndTime) {
      const timeLeft = promotion.flashSaleEndTime.getTime() - now.getTime();
      result.timeLeftMs = Math.max(0, timeLeft);
      result.isFlashSaleActive = timeLeft > 0;
    }

    res.json({
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Obter informações do programa de fidelidade
router.get('/loyalty/program', async (req, res, next) => {
  try {
    const program = mockLoyaltyProgram.find(p => p.isActive);
    
    if (!program) {
      throw createError('Programa de fidelidade não encontrado', 404, 'LOYALTY_PROGRAM_NOT_FOUND');
    }

    res.json({
      data: program
    });
  } catch (error) {
    next(error);
  }
});

// Obter dados de fidelidade do usuário
router.get('/loyalty/my-points', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const userLoyalty = mockUserLoyalty.get(userId);

    if (!userLoyalty) {
      // Criar dados de fidelidade para novo usuário
      const newUserLoyalty: UserLoyalty = {
        id: `loyalty_${Date.now()}`,
        userId,
        totalPoints: 0,
        availablePoints: 0,
        tier: 'bronze',
        totalSpent: 0,
        totalOrders: 0,
        joinDate: new Date(),
        lastActivity: new Date()
      };
      
      mockUserLoyalty.set(userId, newUserLoyalty);
      
      res.json({
        data: newUserLoyalty
      });
      return;
    }

    res.json({
      data: userLoyalty
    });
  } catch (error) {
    next(error);
  }
});

// Obter histórico de pontos do usuário
router.get('/loyalty/points-history', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve ser entre 1 e 50'),
  query('type').optional().isIn(['earned', 'redeemed', 'expired', 'bonus'])
], authMiddleware, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const {
      page = 1,
      limit = 20,
      type
    } = req.query;

    let transactions = mockPointsTransactions.get(userId) || [];

    // Aplicar filtro de tipo
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    // Ordenar por data (mais recente primeiro)
    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Paginação
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedTransactions = transactions.slice(offset, offset + Number(limit));

    res.json({
      data: paginatedTransactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: transactions.length,
        totalPages: Math.ceil(transactions.length / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Resgatar pontos
router.post('/loyalty/redeem', [
  body('points').isInt({ min: 1 }).withMessage('Quantidade de pontos deve ser um número positivo'),
  body('orderId').optional().notEmpty().withMessage('ID do pedido não pode estar vazio')
], authMiddleware, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { points, orderId } = req.body;

    const userLoyalty = mockUserLoyalty.get(userId);
    if (!userLoyalty) {
      throw createError('Dados de fidelidade não encontrados', 404, 'LOYALTY_DATA_NOT_FOUND');
    }

    const program = mockLoyaltyProgram.find(p => p.isActive);
    if (!program) {
      throw createError('Programa de fidelidade não ativo', 400, 'LOYALTY_PROGRAM_INACTIVE');
    }

    // Validações
    if (points < program.minPointsToRedeem) {
      throw createError(`Mínimo de ${program.minPointsToRedeem} pontos para resgate`, 400, 'INSUFFICIENT_POINTS_FOR_REDEMPTION');
    }

    if (points > userLoyalty.availablePoints) {
      throw createError('Pontos insuficientes', 400, 'INSUFFICIENT_POINTS');
    }

    if (program.maxPointsPerOrder && points > program.maxPointsPerOrder) {
      throw createError(`Máximo de ${program.maxPointsPerOrder} pontos por pedido`, 400, 'POINTS_LIMIT_EXCEEDED');
    }

    // Calcular valor do desconto
    const discountValue = points * program.pointsValue;

    // Atualizar pontos do usuário
    userLoyalty.availablePoints -= points;
    userLoyalty.lastActivity = new Date();
    mockUserLoyalty.set(userId, userLoyalty);

    // Registrar transação
    const transaction: PointsTransaction = {
      id: `transaction_${Date.now()}`,
      userId,
      type: 'redeemed',
      points: -points,
      orderId,
      description: `Resgate de ${points} pontos`,
      createdAt: new Date()
    };

    const userTransactions = mockPointsTransactions.get(userId) || [];
    userTransactions.push(transaction);
    mockPointsTransactions.set(userId, userTransactions);

    res.json({
      message: 'Pontos resgatados com sucesso',
      data: {
        pointsRedeemed: points,
        discountValue,
        remainingPoints: userLoyalty.availablePoints,
        transaction
      }
    });
  } catch (error) {
    next(error);
  }
});

export { router as couponRoutes };