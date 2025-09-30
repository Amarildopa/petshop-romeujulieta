import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { 
  Order, 
  OrderItem, 
  CreateOrderData, 
  OrderStatus, 
  PaymentStatus, 
  ShippingStatus,
  OrderFilter,
  OrderListQuery,
  OrderTracking,
  TrackingEvent,
  PaymentMethod,
  ShippingMethod
} from '../types/order';
import { Product } from '../types/product';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// Dados mockados
const mockOrders: Map<string, Order> = new Map();
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Ração Premium para Cães Adultos',
    price: 89.90,
    salePrice: 79.90,
    stock: 50,
    isActive: true
  } as Product,
  {
    id: '2',
    name: 'Bola de Borracha Resistente',
    price: 24.90,
    stock: 30,
    isActive: true
  } as Product
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'credit_card',
    name: 'Cartão de Crédito',
    isActive: true,
    processingFee: 0.039
  },
  {
    id: '2',
    type: 'debit_card',
    name: 'Cartão de Débito',
    isActive: true,
    processingFee: 0.029
  },
  {
    id: '3',
    type: 'pix',
    name: 'PIX',
    isActive: true,
    processingFee: 0
  },
  {
    id: '4',
    type: 'bank_slip',
    name: 'Boleto Bancário',
    isActive: true,
    processingFee: 0.015
  }
];

const mockShippingMethods: ShippingMethod[] = [
  {
    id: '1',
    name: 'Entrega Padrão',
    cost: 15.90,
    estimatedDays: 5,
    isActive: true
  },
  {
    id: '2',
    name: 'Entrega Expressa',
    cost: 25.90,
    estimatedDays: 2,
    isActive: true
  },
  {
    id: '3',
    name: 'Retirada na Loja',
    cost: 0,
    estimatedDays: 1,
    isActive: true
  }
];

// Função para gerar número de pedido
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PET${timestamp.slice(-6)}${random}`;
};

// Função para gerar código de rastreamento
const generateTrackingCode = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let code = '';
  
  // 2 letras + 9 números + 2 letras (formato dos Correios)
  for (let i = 0; i < 2; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 9; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  for (let i = 0; i < 2; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  return code;
};

// Listar pedidos
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  query('paymentStatus').optional().isIn(['pending', 'processing', 'paid', 'failed', 'refunded']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      startDate,
      endDate
    }: OrderListQuery = req.query;

    // Filtrar pedidos do usuário
    let userOrders = Array.from(mockOrders.values()).filter(order => order.userId === userId);

    // Aplicar filtros
    if (status) {
      userOrders = userOrders.filter(order => order.status === status);
    }
    if (paymentStatus) {
      userOrders = userOrders.filter(order => order.paymentStatus === paymentStatus);
    }
    if (startDate) {
      const start = new Date(startDate);
      userOrders = userOrders.filter(order => order.createdAt >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      userOrders = userOrders.filter(order => order.createdAt <= end);
    }

    // Ordenar por data de criação (mais recente primeiro)
    userOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Paginação
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedOrders = userOrders.slice(offset, offset + Number(limit));

    res.json({
      data: paginatedOrders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: userOrders.length,
        totalPages: Math.ceil(userOrders.length / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obter detalhes de um pedido
router.get('/:orderId', [
  param('orderId').notEmpty().withMessage('ID do pedido é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { orderId } = req.params;

    const order = mockOrders.get(orderId);
    if (!order) {
      throw createError('Pedido não encontrado', 404, 'ORDER_NOT_FOUND');
    }

    if (order.userId !== userId) {
      throw createError('Acesso negado', 403, 'ACCESS_DENIED');
    }

    res.json({
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// Criar novo pedido
router.post('/', [
  body('items').isArray({ min: 1 }).withMessage('Pelo menos um item é obrigatório'),
  body('items.*.productId').notEmpty().withMessage('ID do produto é obrigatório'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser positiva'),
  body('items.*.variantId').optional().isString(),
  body('shippingAddress.street').notEmpty().withMessage('Endereço é obrigatório'),
  body('shippingAddress.city').notEmpty().withMessage('Cidade é obrigatória'),
  body('shippingAddress.state').notEmpty().withMessage('Estado é obrigatório'),
  body('shippingAddress.zipCode').notEmpty().withMessage('CEP é obrigatório'),
  body('paymentMethodId').notEmpty().withMessage('Método de pagamento é obrigatório'),
  body('shippingMethodId').notEmpty().withMessage('Método de envio é obrigatório'),
  body('notes').optional().isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const orderData: CreateOrderData = req.body;

    // Verificar método de pagamento
    const paymentMethod = mockPaymentMethods.find(pm => pm.id === orderData.paymentMethodId);
    if (!paymentMethod || !paymentMethod.isActive) {
      throw createError('Método de pagamento inválido', 400, 'INVALID_PAYMENT_METHOD');
    }

    // Verificar método de envio
    const shippingMethod = mockShippingMethods.find(sm => sm.id === orderData.shippingMethodId);
    if (!shippingMethod || !shippingMethod.isActive) {
      throw createError('Método de envio inválido', 400, 'INVALID_SHIPPING_METHOD');
    }

    // Processar itens do pedido
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of orderData.items) {
      const product = mockProducts.find(p => p.id === item.productId);
      if (!product) {
        throw createError(`Produto ${item.productId} não encontrado`, 404, 'PRODUCT_NOT_FOUND');
      }

      if (!product.isActive) {
        throw createError(`Produto ${product.name} não está disponível`, 400, 'PRODUCT_UNAVAILABLE');
      }

      if (product.stock < item.quantity) {
        throw createError(
          `Estoque insuficiente para ${product.name}`,
          400,
          'INSUFFICIENT_STOCK',
          { available: product.stock, requested: item.quantity }
        );
      }

      const unitPrice = product.salePrice || product.price;
      const totalPrice = unitPrice * item.quantity;

      orderItems.push({
        id: `item_${Date.now()}_${Math.random()}`,
        orderId: '', // Será definido após criar o pedido
        productId: item.productId,
        product,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        totalPrice
      });

      subtotal += totalPrice;
    }

    // Calcular totais
    const shippingCost = shippingMethod.cost;
    const taxAmount = 0; // Sem impostos para este exemplo
    const discountAmount = orderData.couponCode ? subtotal * 0.1 : 0; // 10% se houver cupom
    const total = subtotal + shippingCost + taxAmount - discountAmount;

    // Criar pedido
    const orderId = `order_${Date.now()}`;
    const orderNumber = generateOrderNumber();
    const trackingCode = generateTrackingCode();

    const order: Order = {
      id: orderId,
      orderNumber,
      userId,
      items: orderItems.map(item => ({ ...item, orderId })),
      status: 'pending' as OrderStatus,
      paymentStatus: 'pending' as PaymentStatus,
      shippingStatus: 'pending' as ShippingStatus,
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      total,
      currency: 'BRL',
      paymentMethod,
      shippingMethod,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress || orderData.shippingAddress,
      couponCode: orderData.couponCode,
      notes: orderData.notes,
      trackingCode,
      estimatedDeliveryDate: new Date(Date.now() + shippingMethod.estimatedDays * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockOrders.set(orderId, order);

    // Simular redução de estoque
    for (const item of orderData.items) {
      const product = mockProducts.find(p => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    }

    res.status(201).json({
      message: 'Pedido criado com sucesso',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// Cancelar pedido
router.post('/:orderId/cancel', [
  param('orderId').notEmpty().withMessage('ID do pedido é obrigatório'),
  body('reason').optional().isString().withMessage('Motivo deve ser uma string')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = mockOrders.get(orderId);
    if (!order) {
      throw createError('Pedido não encontrado', 404, 'ORDER_NOT_FOUND');
    }

    if (order.userId !== userId) {
      throw createError('Acesso negado', 403, 'ACCESS_DENIED');
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw createError('Pedido não pode ser cancelado neste status', 400, 'CANNOT_CANCEL_ORDER');
    }

    // Atualizar status
    order.status = 'cancelled';
    order.paymentStatus = order.paymentStatus === 'paid' ? 'refunded' : 'failed';
    order.shippingStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    order.updatedAt = new Date();

    // Restaurar estoque
    for (const item of order.items) {
      const product = mockProducts.find(p => p.id === item.productId);
      if (product) {
        product.stock += item.quantity;
      }
    }

    res.json({
      message: 'Pedido cancelado com sucesso',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// Obter rastreamento do pedido
router.get('/:orderId/tracking', [
  param('orderId').notEmpty().withMessage('ID do pedido é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { orderId } = req.params;

    const order = mockOrders.get(orderId);
    if (!order) {
      throw createError('Pedido não encontrado', 404, 'ORDER_NOT_FOUND');
    }

    if (order.userId !== userId) {
      throw createError('Acesso negado', 403, 'ACCESS_DENIED');
    }

    // Gerar eventos de rastreamento mockados
    const events: TrackingEvent[] = [
      {
        id: '1',
        status: 'pending',
        description: 'Pedido recebido',
        location: 'Pet Shop Romeo & Julieta',
        timestamp: order.createdAt
      }
    ];

    if (['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)) {
      events.push({
        id: '2',
        status: 'confirmed',
        description: 'Pedido confirmado e em preparação',
        location: 'Pet Shop Romeo & Julieta',
        timestamp: new Date(order.createdAt.getTime() + 30 * 60 * 1000) // 30 min depois
      });
    }

    if (['processing', 'shipped', 'delivered'].includes(order.status)) {
      events.push({
        id: '3',
        status: 'processing',
        description: 'Pedido em processamento',
        location: 'Centro de Distribuição',
        timestamp: new Date(order.createdAt.getTime() + 2 * 60 * 60 * 1000) // 2h depois
      });
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      events.push({
        id: '4',
        status: 'shipped',
        description: 'Pedido enviado para entrega',
        location: 'Transportadora',
        timestamp: new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000) // 1 dia depois
      });
    }

    if (order.status === 'delivered') {
      events.push({
        id: '5',
        status: 'delivered',
        description: 'Pedido entregue',
        location: order.shippingAddress.city,
        timestamp: order.deliveredAt || new Date()
      });
    }

    const tracking: OrderTracking = {
      orderId,
      trackingCode: order.trackingCode!,
      currentStatus: order.shippingStatus,
      estimatedDeliveryDate: order.estimatedDeliveryDate!,
      events,
      lastUpdated: order.updatedAt
    };

    res.json({
      data: tracking
    });
  } catch (error) {
    next(error);
  }
});

// Obter métodos de pagamento disponíveis
router.get('/payment-methods', async (req, res, next) => {
  try {
    const activePaymentMethods = mockPaymentMethods.filter(pm => pm.isActive);
    
    res.json({
      data: activePaymentMethods
    });
  } catch (error) {
    next(error);
  }
});

// Obter métodos de envio disponíveis
router.get('/shipping-methods', [
  query('zipCode').optional().isString(),
  query('weight').optional().isFloat({ min: 0 }),
  query('value').optional().isFloat({ min: 0 })
], async (req, res, next) => {
  try {
    const { zipCode, weight, value } = req.query;
    
    let availableShippingMethods = mockShippingMethods.filter(sm => sm.isActive);
    
    // Simular cálculo de frete baseado no CEP (mockado)
    if (zipCode) {
      availableShippingMethods = availableShippingMethods.map(method => ({
        ...method,
        cost: method.id === '3' ? 0 : method.cost + Math.random() * 10 // Variação no frete
      }));
    }
    
    res.json({
      data: availableShippingMethods
    });
  } catch (error) {
    next(error);
  }
});

export { router as orderRoutes };