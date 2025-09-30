import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { 
  Cart, 
  CartItem, 
  AddToCartData, 
  UpdateCartItemData,
  OrderSummary,
  Coupon,
  ApplyCouponData
} from '../types/order';
import { Product } from '../types/product';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// Dados mockados
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

const mockCarts: Map<string, Cart> = new Map();
const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'DESCONTO10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 50,
    usageLimit: 100,
    usageCount: 25,
    isActive: true,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31')
  },
  {
    id: '2',
    code: 'FRETEGRATIS',
    type: 'free_shipping',
    value: 0,
    minOrderAmount: 100,
    usageLimit: 50,
    usageCount: 12,
    isActive: true,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31')
  }
];

// Função para calcular totais do carrinho
const calculateCartTotals = (cart: Cart): void => {
  cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
  cart.total = cart.subtotal;
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
};

// Obter carrinho
router.get('/', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    let cart = mockCarts.get(userId);

    if (!cart) {
      cart = {
        id: `cart_${userId}`,
        userId,
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockCarts.set(userId, cart);
    }

    res.json({
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

// Adicionar item ao carrinho
router.post('/items', [
  body('productId').notEmpty().withMessage('ID do produto é obrigatório'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser um número positivo'),
  body('variantId').optional().isString(),
  body('notes').optional().isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { productId, quantity, variantId, notes }: AddToCartData = req.body;

    // Verificar se produto existe
    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
      throw createError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
    }

    if (!product.isActive) {
      throw createError('Produto não está disponível', 400, 'PRODUCT_UNAVAILABLE');
    }

    // Verificar estoque
    if (product.stock < quantity) {
      throw createError('Estoque insuficiente', 400, 'INSUFFICIENT_STOCK', {
        available: product.stock,
        requested: quantity
      });
    }

    // Obter ou criar carrinho
    let cart = mockCarts.get(userId);
    if (!cart) {
      cart = {
        id: `cart_${userId}`,
        userId,
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Verificar se item já existe no carrinho
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId && item.variantId === variantId
    );

    const unitPrice = product.salePrice || product.price;

    if (existingItemIndex >= 0) {
      // Atualizar item existente
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        throw createError('Estoque insuficiente', 400, 'INSUFFICIENT_STOCK', {
          available: product.stock,
          requested: newQuantity,
          currentInCart: existingItem.quantity
        });
      }

      existingItem.quantity = newQuantity;
      existingItem.totalPrice = unitPrice * newQuantity;
      existingItem.updatedAt = new Date();
      if (notes) existingItem.notes = notes;
    } else {
      // Adicionar novo item
      const newItem: CartItem = {
        id: `item_${Date.now()}`,
        cartId: cart.id,
        productId,
        product,
        variantId,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        notes,
        addedAt: new Date(),
        updatedAt: new Date()
      };
      cart.items.push(newItem);
    }

    // Recalcular totais
    calculateCartTotals(cart);
    cart.updatedAt = new Date();
    mockCarts.set(userId, cart);

    res.json({
      message: 'Item adicionado ao carrinho com sucesso',
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar item do carrinho
router.put('/items/:itemId', [
  param('itemId').notEmpty().withMessage('ID do item é obrigatório'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantidade deve ser um número não negativo'),
  body('notes').optional().isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { itemId } = req.params;
    const { quantity, notes }: UpdateCartItemData = req.body;

    const cart = mockCarts.get(userId);
    if (!cart) {
      throw createError('Carrinho não encontrado', 404, 'CART_NOT_FOUND');
    }

    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw createError('Item não encontrado no carrinho', 404, 'CART_ITEM_NOT_FOUND');
    }

    const item = cart.items[itemIndex];
    const product = mockProducts.find(p => p.id === item.productId);
    
    if (!product) {
      throw createError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
    }

    // Se quantidade for 0, remover item
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Verificar estoque
      if (product.stock < quantity) {
        throw createError('Estoque insuficiente', 400, 'INSUFFICIENT_STOCK', {
          available: product.stock,
          requested: quantity
        });
      }

      // Atualizar item
      item.quantity = quantity;
      item.totalPrice = item.unitPrice * quantity;
      item.updatedAt = new Date();
      if (notes !== undefined) item.notes = notes;
    }

    // Recalcular totais
    calculateCartTotals(cart);
    cart.updatedAt = new Date();

    res.json({
      message: quantity === 0 ? 'Item removido do carrinho' : 'Item atualizado com sucesso',
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

// Remover item do carrinho
router.delete('/items/:itemId', [
  param('itemId').notEmpty().withMessage('ID do item é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { itemId } = req.params;

    const cart = mockCarts.get(userId);
    if (!cart) {
      throw createError('Carrinho não encontrado', 404, 'CART_NOT_FOUND');
    }

    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw createError('Item não encontrado no carrinho', 404, 'CART_ITEM_NOT_FOUND');
    }

    cart.items.splice(itemIndex, 1);
    calculateCartTotals(cart);
    cart.updatedAt = new Date();

    res.json({
      message: 'Item removido do carrinho com sucesso',
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

// Limpar carrinho
router.delete('/', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    
    const cart = mockCarts.get(userId);
    if (!cart) {
      throw createError('Carrinho não encontrado', 404, 'CART_NOT_FOUND');
    }

    cart.items = [];
    calculateCartTotals(cart);
    cart.updatedAt = new Date();

    res.json({
      message: 'Carrinho limpo com sucesso',
      data: cart
    });
  } catch (error) {
    next(error);
  }
});

// Aplicar cupom
router.post('/coupon', [
  body('code').notEmpty().withMessage('Código do cupom é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { code }: ApplyCouponData = req.body;

    const cart = mockCarts.get(userId);
    if (!cart) {
      throw createError('Carrinho não encontrado', 404, 'CART_NOT_FOUND');
    }

    if (cart.items.length === 0) {
      throw createError('Carrinho está vazio', 400, 'EMPTY_CART');
    }

    // Buscar cupom
    const coupon = mockCoupons.find(c => c.code.toLowerCase() === code.toLowerCase());
    if (!coupon) {
      throw createError('Cupom não encontrado', 404, 'COUPON_NOT_FOUND');
    }

    if (!coupon.isActive) {
      throw createError('Cupom não está ativo', 400, 'COUPON_INACTIVE');
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      throw createError('Cupom expirado ou ainda não válido', 400, 'COUPON_EXPIRED');
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw createError('Cupom esgotado', 400, 'COUPON_EXHAUSTED');
    }

    if (coupon.minOrderAmount && cart.subtotal < coupon.minOrderAmount) {
      throw createError(
        `Valor mínimo do pedido para este cupom é R$ ${coupon.minOrderAmount.toFixed(2)}`,
        400,
        'MIN_ORDER_AMOUNT_NOT_REACHED',
        { minAmount: coupon.minOrderAmount, currentAmount: cart.subtotal }
      );
    }

    // Calcular desconto
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (cart.subtotal * coupon.value) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else if (coupon.type === 'fixed') {
      discountAmount = coupon.value;
    }

    const summary: OrderSummary = {
      subtotal: cart.subtotal,
      shippingCost: 15.90, // Valor fixo para demonstração
      taxAmount: 0,
      discountAmount,
      total: cart.subtotal + 15.90 - discountAmount,
      currency: 'BRL'
    };

    res.json({
      message: 'Cupom aplicado com sucesso',
      data: {
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          discountAmount
        },
        summary
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obter resumo do carrinho
router.get('/summary', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const cart = mockCarts.get(userId);

    if (!cart) {
      throw createError('Carrinho não encontrado', 404, 'CART_NOT_FOUND');
    }

    const summary: OrderSummary = {
      subtotal: cart.subtotal,
      shippingCost: cart.subtotal >= 100 ? 0 : 15.90, // Frete grátis acima de R$ 100
      taxAmount: 0,
      discountAmount: 0,
      total: cart.subtotal + (cart.subtotal >= 100 ? 0 : 15.90),
      currency: 'BRL'
    };

    res.json({
      data: summary
    });
  } catch (error) {
    next(error);
  }
});

export { router as cartRoutes };