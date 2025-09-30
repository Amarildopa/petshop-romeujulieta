import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { createError } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Aplicar middleware de autenticação
router.use(authMiddleware);

// Interfaces para pagamentos
interface PaymentMethod {
  id: string;
  userId: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'bank_slip' | 'digital_wallet';
  provider: string; // visa, mastercard, pix, etc.
  isDefault: boolean;
  isActive: boolean;
  // Para cartões
  cardNumber?: string; // últimos 4 dígitos
  cardHolderName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  // Para PIX
  pixKey?: string;
  pixKeyType?: 'cpf' | 'email' | 'phone' | 'random';
  // Para carteira digital
  walletProvider?: string;
  walletAccount?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Payment {
  id: string;
  userId: string;
  orderId: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentType: 'credit_card' | 'debit_card' | 'pix' | 'bank_slip' | 'digital_wallet';
  transactionId?: string;
  authorizationCode?: string;
  // Para PIX
  pixQrCode?: string;
  pixCopyPaste?: string;
  pixExpiresAt?: Date;
  // Para boleto
  bankSlipUrl?: string;
  bankSlipBarcode?: string;
  bankSlipExpiresAt?: Date;
  // Dados da transação
  processingFee: number;
  netAmount: number;
  installments?: number;
  installmentAmount?: number;
  // Timestamps
  paidAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Detalhes adicionais
  failureReason?: string;
  refundReason?: string;
  metadata?: any;
}

interface PaymentIntent {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethods: string[];
  clientSecret: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'cancelled';
  metadata?: any;
  expiresAt: Date;
  createdAt: Date;
}

interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  refundedAt?: Date;
  createdAt: Date;
}

// Dados mockados
const mockPaymentMethods: Map<string, PaymentMethod[]> = new Map();
const mockPayments: Map<string, Payment> = new Map();
const mockPaymentIntents: Map<string, PaymentIntent> = new Map();
const mockRefunds: Map<string, Refund[]> = new Map();

// Inicializar dados mockados
const initMockData = () => {
  const userId = '1';
  
  // Métodos de pagamento
  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      userId,
      type: 'credit_card',
      provider: 'visa',
      isDefault: true,
      isActive: true,
      cardNumber: '****1234',
      cardHolderName: 'JOAO SILVA',
      expiryMonth: 12,
      expiryYear: 2027,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      userId,
      type: 'credit_card',
      provider: 'mastercard',
      isDefault: false,
      isActive: true,
      cardNumber: '****5678',
      cardHolderName: 'JOAO SILVA',
      expiryMonth: 8,
      expiryYear: 2026,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      userId,
      type: 'pix',
      provider: 'pix',
      isDefault: false,
      isActive: true,
      pixKey: 'joao@email.com',
      pixKeyType: 'email',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      userId,
      type: 'digital_wallet',
      provider: 'paypal',
      isDefault: false,
      isActive: true,
      walletProvider: 'PayPal',
      walletAccount: 'joao@email.com',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ];

  mockPaymentMethods.set(userId, paymentMethods);

  // Pagamentos de exemplo
  const payments: Payment[] = [
    {
      id: '1',
      userId,
      orderId: 'order_123',
      paymentMethodId: '1',
      amount: 89.90,
      currency: 'BRL',
      status: 'completed',
      paymentType: 'credit_card',
      transactionId: 'txn_abc123',
      authorizationCode: 'auth_456789',
      processingFee: 2.70,
      netAmount: 87.20,
      installments: 1,
      installmentAmount: 89.90,
      paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      userId,
      orderId: 'order_124',
      paymentMethodId: '3',
      amount: 156.50,
      currency: 'BRL',
      status: 'completed',
      paymentType: 'pix',
      transactionId: 'pix_def456',
      processingFee: 0,
      netAmount: 156.50,
      paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      userId,
      orderId: 'order_125',
      paymentMethodId: '1',
      amount: 234.80,
      currency: 'BRL',
      status: 'pending',
      paymentType: 'credit_card',
      processingFee: 7.04,
      netAmount: 227.76,
      installments: 3,
      installmentAmount: 78.27,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  ];

  payments.forEach(payment => {
    mockPayments.set(payment.id, payment);
  });
};

// Inicializar dados mockados
initMockData();

// Listar métodos de pagamento do usuário
router.get('/methods', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const userPaymentMethods = mockPaymentMethods.get(userId) || [];

    // Filtrar apenas métodos ativos e ordenar por padrão primeiro
    const activeMethods = userPaymentMethods
      .filter(method => method.isActive)
      .sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

    res.json({
      data: activeMethods
    });
  } catch (error) {
    next(error);
  }
});

// Adicionar método de pagamento
router.post('/methods', [
  body('type').isIn(['credit_card', 'debit_card', 'pix', 'digital_wallet']).withMessage('Tipo de pagamento inválido'),
  body('provider').notEmpty().withMessage('Provedor é obrigatório'),
  // Validações para cartão
  body('cardNumber').if(body('type').isIn(['credit_card', 'debit_card'])).matches(/^\d{16}$/).withMessage('Número do cartão inválido'),
  body('cardHolderName').if(body('type').isIn(['credit_card', 'debit_card'])).notEmpty().withMessage('Nome do portador é obrigatório'),
  body('expiryMonth').if(body('type').isIn(['credit_card', 'debit_card'])).isInt({ min: 1, max: 12 }).withMessage('Mês de expiração inválido'),
  body('expiryYear').if(body('type').isIn(['credit_card', 'debit_card'])).isInt({ min: new Date().getFullYear() }).withMessage('Ano de expiração inválido'),
  body('cvv').if(body('type').isIn(['credit_card', 'debit_card'])).matches(/^\d{3,4}$/).withMessage('CVV inválido'),
  // Validações para PIX
  body('pixKey').if(body('type').equals('pix')).notEmpty().withMessage('Chave PIX é obrigatória'),
  body('pixKeyType').if(body('type').equals('pix')).isIn(['cpf', 'email', 'phone', 'random']).withMessage('Tipo de chave PIX inválido'),
  // Validações para carteira digital
  body('walletProvider').if(body('type').equals('digital_wallet')).notEmpty().withMessage('Provedor da carteira é obrigatório'),
  body('walletAccount').if(body('type').equals('digital_wallet')).notEmpty().withMessage('Conta da carteira é obrigatória')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const methodData = req.body;

    let userPaymentMethods = mockPaymentMethods.get(userId) || [];

    // Verificar se já existe um método padrão
    const hasDefault = userPaymentMethods.some(method => method.isDefault && method.isActive);
    const isDefault = !hasDefault || methodData.isDefault;

    // Se este será o padrão, remover padrão dos outros
    if (isDefault) {
      userPaymentMethods = userPaymentMethods.map(method => ({ ...method, isDefault: false }));
    }

    // Criar novo método de pagamento
    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      userId,
      type: methodData.type,
      provider: methodData.provider,
      isDefault,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Adicionar campos específicos do tipo
    if (methodData.type === 'credit_card' || methodData.type === 'debit_card') {
      newMethod.cardNumber = `****${methodData.cardNumber.slice(-4)}`;
      newMethod.cardHolderName = methodData.cardHolderName.toUpperCase();
      newMethod.expiryMonth = methodData.expiryMonth;
      newMethod.expiryYear = methodData.expiryYear;
    } else if (methodData.type === 'pix') {
      newMethod.pixKey = methodData.pixKey;
      newMethod.pixKeyType = methodData.pixKeyType;
    } else if (methodData.type === 'digital_wallet') {
      newMethod.walletProvider = methodData.walletProvider;
      newMethod.walletAccount = methodData.walletAccount;
    }

    userPaymentMethods.push(newMethod);
    mockPaymentMethods.set(userId, userPaymentMethods);

    res.status(201).json({
      message: 'Método de pagamento adicionado com sucesso',
      data: newMethod
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar método de pagamento
router.put('/methods/:methodId', [
  param('methodId').notEmpty().withMessage('ID do método é obrigatório'),
  body('isDefault').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { methodId } = req.params;
    const updateData = req.body;

    let userPaymentMethods = mockPaymentMethods.get(userId) || [];
    const methodIndex = userPaymentMethods.findIndex(method => method.id === methodId);

    if (methodIndex === -1) {
      throw createError('Método de pagamento não encontrado', 404, 'PAYMENT_METHOD_NOT_FOUND');
    }

    // Se está definindo como padrão, remover padrão dos outros
    if (updateData.isDefault) {
      userPaymentMethods = userPaymentMethods.map(method => 
        method.id === methodId ? method : { ...method, isDefault: false }
      );
    }

    // Atualizar método
    const updatedMethod = {
      ...userPaymentMethods[methodIndex],
      ...updateData,
      updatedAt: new Date()
    };

    userPaymentMethods[methodIndex] = updatedMethod;
    mockPaymentMethods.set(userId, userPaymentMethods);

    res.json({
      message: 'Método de pagamento atualizado com sucesso',
      data: updatedMethod
    });
  } catch (error) {
    next(error);
  }
});

// Remover método de pagamento
router.delete('/methods/:methodId', [
  param('methodId').notEmpty().withMessage('ID do método é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { methodId } = req.params;

    const userPaymentMethods = mockPaymentMethods.get(userId) || [];
    const methodIndex = userPaymentMethods.findIndex(method => method.id === methodId);

    if (methodIndex === -1) {
      throw createError('Método de pagamento não encontrado', 404, 'PAYMENT_METHOD_NOT_FOUND');
    }

    const methodToRemove = userPaymentMethods[methodIndex];
    
    // Marcar como inativo ao invés de remover
    methodToRemove.isActive = false;
    methodToRemove.isDefault = false;
    methodToRemove.updatedAt = new Date();

    // Se era o padrão, definir outro como padrão
    if (methodToRemove.isDefault) {
      const activeMethod = userPaymentMethods.find(method => method.isActive && method.id !== methodId);
      if (activeMethod) {
        activeMethod.isDefault = true;
        activeMethod.updatedAt = new Date();
      }
    }

    mockPaymentMethods.set(userId, userPaymentMethods);

    res.json({
      message: 'Método de pagamento removido com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Criar intenção de pagamento
router.post('/intents', [
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
  body('currency').equals('BRL').withMessage('Moeda deve ser BRL'),
  body('paymentMethods').isArray({ min: 1 }).withMessage('Pelo menos um método de pagamento deve ser especificado'),
  body('metadata').optional().isObject()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { amount, currency, paymentMethods, metadata } = req.body;

    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}`,
      userId,
      amount,
      currency,
      paymentMethods,
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
      status: 'requires_payment_method',
      metadata,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      createdAt: new Date()
    };

    mockPaymentIntents.set(paymentIntent.id, paymentIntent);

    res.status(201).json({
      message: 'Intenção de pagamento criada com sucesso',
      data: paymentIntent
    });
  } catch (error) {
    next(error);
  }
});

// Confirmar pagamento
router.post('/intents/:intentId/confirm', [
  param('intentId').notEmpty().withMessage('ID da intenção é obrigatório'),
  body('paymentMethodId').notEmpty().withMessage('Método de pagamento é obrigatório'),
  body('orderId').optional().notEmpty().withMessage('ID do pedido não pode estar vazio'),
  body('installments').optional().isInt({ min: 1, max: 12 }).withMessage('Parcelas devem ser entre 1 e 12')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { intentId } = req.params;
    const { paymentMethodId, orderId, installments = 1 } = req.body;

    const intent = mockPaymentIntents.get(intentId);
    if (!intent) {
      throw createError('Intenção de pagamento não encontrada', 404, 'PAYMENT_INTENT_NOT_FOUND');
    }

    if (intent.userId !== userId) {
      throw createError('Acesso negado', 403, 'ACCESS_DENIED');
    }

    if (intent.expiresAt < new Date()) {
      throw createError('Intenção de pagamento expirada', 400, 'PAYMENT_INTENT_EXPIRED');
    }

    // Verificar método de pagamento
    const userPaymentMethods = mockPaymentMethods.get(userId) || [];
    const paymentMethod = userPaymentMethods.find(method => method.id === paymentMethodId && method.isActive);
    
    if (!paymentMethod) {
      throw createError('Método de pagamento não encontrado', 404, 'PAYMENT_METHOD_NOT_FOUND');
    }

    // Simular processamento do pagamento
    const processingFee = paymentMethod.type === 'pix' ? 0 : intent.amount * 0.03; // 3% para cartão
    const netAmount = intent.amount - processingFee;
    const installmentAmount = intent.amount / installments;

    const payment: Payment = {
      id: `pay_${Date.now()}`,
      userId,
      orderId: orderId || `order_${Date.now()}`,
      paymentMethodId,
      amount: intent.amount,
      currency: intent.currency,
      status: 'processing',
      paymentType: paymentMethod.type,
      processingFee,
      netAmount,
      installments,
      installmentAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: intent.metadata
    };

    // Simular diferentes tipos de pagamento
    if (paymentMethod.type === 'pix') {
      payment.pixQrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
      payment.pixCopyPaste = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(7)}520400005303986540${intent.amount.toFixed(2)}5802BR6009SAO PAULO62070503***6304`;
      payment.pixExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
    } else if (paymentMethod.type === 'bank_slip') {
      payment.bankSlipUrl = `https://example.com/boleto/${payment.id}.pdf`;
      payment.bankSlipBarcode = `34191.79001 01043.510047 91020.150008 1 84560000${intent.amount.toString().replace('.', '')}`;
      payment.bankSlipExpiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 dias
    } else {
      // Cartão - simular aprovação/rejeição
      const isApproved = Math.random() > 0.1; // 90% de aprovação
      if (isApproved) {
        payment.status = 'completed';
        payment.transactionId = `txn_${Math.random().toString(36).substring(7)}`;
        payment.authorizationCode = `auth_${Math.random().toString(36).substring(7)}`;
        payment.paidAt = new Date();
      } else {
        payment.status = 'failed';
        payment.failedAt = new Date();
        payment.failureReason = 'Cartão recusado pelo banco emissor';
      }
    }

    mockPayments.set(payment.id, payment);

    // Atualizar intenção
    intent.status = payment.status === 'failed' ? 'cancelled' : 'processing';
    mockPaymentIntents.set(intentId, intent);

    res.json({
      message: 'Pagamento processado com sucesso',
      data: payment
    });
  } catch (error) {
    next(error);
  }
});

// Listar pagamentos do usuário
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve ser entre 1 e 50'),
  query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']),
  query('orderId').optional().notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const {
      page = 1,
      limit = 20,
      status,
      orderId
    } = req.query;

    // Filtrar pagamentos do usuário
    let userPayments = Array.from(mockPayments.values())
      .filter(payment => payment.userId === userId);

    // Aplicar filtros
    if (status) {
      userPayments = userPayments.filter(p => p.status === status);
    }
    if (orderId) {
      userPayments = userPayments.filter(p => p.orderId === orderId);
    }

    // Ordenar por data de criação (mais recente primeiro)
    userPayments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Paginação
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedPayments = userPayments.slice(offset, offset + Number(limit));

    res.json({
      data: paginatedPayments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: userPayments.length,
        totalPages: Math.ceil(userPayments.length / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obter detalhes de um pagamento
router.get('/:paymentId', [
  param('paymentId').notEmpty().withMessage('ID do pagamento é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { paymentId } = req.params;

    const payment = mockPayments.get(paymentId);
    if (!payment) {
      throw createError('Pagamento não encontrado', 404, 'PAYMENT_NOT_FOUND');
    }

    if (payment.userId !== userId) {
      throw createError('Acesso negado', 403, 'ACCESS_DENIED');
    }

    res.json({
      data: payment
    });
  } catch (error) {
    next(error);
  }
});

// Solicitar reembolso
router.post('/:paymentId/refund', [
  param('paymentId').notEmpty().withMessage('ID do pagamento é obrigatório'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
  body('reason').notEmpty().withMessage('Motivo do reembolso é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const payment = mockPayments.get(paymentId);
    if (!payment) {
      throw createError('Pagamento não encontrado', 404, 'PAYMENT_NOT_FOUND');
    }

    if (payment.userId !== userId) {
      throw createError('Acesso negado', 403, 'ACCESS_DENIED');
    }

    if (payment.status !== 'completed') {
      throw createError('Apenas pagamentos concluídos podem ser reembolsados', 400, 'INVALID_PAYMENT_STATUS');
    }

    const refundAmount = amount || payment.amount;
    if (refundAmount > payment.amount) {
      throw createError('Valor do reembolso não pode ser maior que o valor do pagamento', 400, 'INVALID_REFUND_AMOUNT');
    }

    const refund: Refund = {
      id: `ref_${Date.now()}`,
      paymentId,
      amount: refundAmount,
      reason,
      status: 'pending',
      createdAt: new Date()
    };

    const paymentRefunds = mockRefunds.get(paymentId) || [];
    paymentRefunds.push(refund);
    mockRefunds.set(paymentId, paymentRefunds);

    // Simular processamento do reembolso
    setTimeout(() => {
      refund.status = 'completed';
      refund.refundedAt = new Date();
      
      // Atualizar status do pagamento
      payment.status = 'refunded';
      payment.refundedAt = new Date();
      payment.refundReason = reason;
      payment.updatedAt = new Date();
      
      mockPayments.set(paymentId, payment);
    }, 1000);

    res.json({
      message: 'Solicitação de reembolso criada com sucesso',
      data: refund
    });
  } catch (error) {
    next(error);
  }
});

// Obter taxas de parcelamento
router.get('/installments/fees', [
  query('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
  query('paymentMethodId').notEmpty().withMessage('Método de pagamento é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { amount, paymentMethodId } = req.query;

    const userPaymentMethods = mockPaymentMethods.get(userId) || [];
    const paymentMethod = userPaymentMethods.find(method => method.id === paymentMethodId);
    
    if (!paymentMethod) {
      throw createError('Método de pagamento não encontrado', 404, 'PAYMENT_METHOD_NOT_FOUND');
    }

    if (paymentMethod.type !== 'credit_card') {
      throw createError('Parcelamento disponível apenas para cartão de crédito', 400, 'INVALID_PAYMENT_METHOD');
    }

    const baseAmount = Number(amount);
    const installmentOptions = [];

    // Gerar opções de parcelamento (1x a 12x)
    for (let i = 1; i <= 12; i++) {
      const interestRate = i === 1 ? 0 : 0.02 * (i - 1); // 2% ao mês a partir da 2ª parcela
      const totalAmount = baseAmount * (1 + interestRate);
      const installmentAmount = totalAmount / i;
      
      installmentOptions.push({
        installments: i,
        installmentAmount: Number(installmentAmount.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
        interestRate: Number((interestRate * 100).toFixed(2)),
        hasInterest: i > 1
      });
    }

    res.json({
      data: installmentOptions
    });
  } catch (error) {
    next(error);
  }
});

export { router as paymentRoutes };