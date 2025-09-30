import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { createError } from '../middleware/errorHandler';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Interfaces para avaliações
interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId?: string;
  serviceId?: string;
  orderId?: string;
  appointmentId?: string;
  type: 'product' | 'service' | 'order' | 'appointment' | 'store';
  rating: number; // 1-5
  title: string;
  comment: string;
  images?: string[];
  pros?: string[];
  cons?: string[];
  wouldRecommend: boolean;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  reportCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  moderatorNote?: string;
  // Resposta da loja
  storeResponse?: {
    message: string;
    respondedAt: Date;
    respondedBy: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verifiedPurchasePercentage: number;
  recommendationPercentage: number;
}

interface ReviewHelpful {
  id: string;
  reviewId: string;
  userId: string;
  isHelpful: boolean;
  createdAt: Date;
}

interface ReviewReport {
  id: string;
  reviewId: string;
  userId: string;
  reason: 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
}

// Dados mockados
const mockReviews: Map<string, Review> = new Map();
const mockReviewHelpful: Map<string, ReviewHelpful[]> = new Map();
const mockReviewReports: Map<string, ReviewReport[]> = new Map();

// Inicializar dados mockados
const initMockData = () => {
  const reviews: Review[] = [
    {
      id: '1',
      userId: '1',
      userName: 'João Silva',
      userAvatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20of%20a%20man%20with%20friendly%20smile&image_size=square',
      productId: '1',
      orderId: 'order_123',
      type: 'product',
      rating: 5,
      title: 'Excelente ração para meu Golden!',
      comment: 'Meu Golden Retriever adorou essa ração. Notei melhora no pelo e na disposição dele. A entrega foi rápida e o produto chegou bem embalado. Recomendo!',
      images: [
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=happy%20golden%20retriever%20eating%20premium%20dog%20food&image_size=landscape_4_3',
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20dog%20food%20package%20opened%20showing%20kibble&image_size=square'
      ],
      pros: ['Melhora no pelo', 'Cão gostou muito', 'Entrega rápida'],
      cons: ['Preço um pouco alto'],
      wouldRecommend: true,
      isVerifiedPurchase: true,
      helpfulCount: 12,
      reportCount: 0,
      status: 'approved',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      userId: '2',
      userName: 'Maria Santos',
      userAvatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20of%20a%20woman%20with%20kind%20smile&image_size=square',
      productId: '1',
      orderId: 'order_124',
      type: 'product',
      rating: 4,
      title: 'Boa ração, mas poderia ser mais barata',
      comment: 'A qualidade da ração é muito boa, meus dois cães se adaptaram bem. O único ponto negativo é o preço, que está um pouco salgado.',
      pros: ['Boa qualidade', 'Cães gostaram'],
      cons: ['Preço elevado'],
      wouldRecommend: true,
      isVerifiedPurchase: true,
      helpfulCount: 8,
      reportCount: 0,
      status: 'approved',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      userId: '3',
      userName: 'Carlos Oliveira',
      userAvatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20of%20a%20middle%20aged%20man&image_size=square',
      serviceId: 'service_1',
      appointmentId: 'apt_1',
      type: 'service',
      rating: 5,
      title: 'Excelente atendimento veterinário!',
      comment: 'Dr. Ana foi muito atenciosa com minha gata Luna. Explicou tudo detalhadamente e o tratamento foi muito eficaz. A clínica é limpa e bem organizada.',
      wouldRecommend: true,
      isVerifiedPurchase: true,
      helpfulCount: 15,
      reportCount: 0,
      status: 'approved',
      storeResponse: {
        message: 'Muito obrigado pelo feedback, Carlos! Ficamos felizes em saber que a Luna está bem. Conte sempre conosco!',
        respondedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        respondedBy: 'Pet Shop Romeo & Julieta'
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      userId: '4',
      userName: 'Ana Costa',
      userAvatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20of%20a%20young%20woman&image_size=square',
      productId: '2',
      orderId: 'order_125',
      type: 'product',
      rating: 3,
      title: 'Produto OK, mas esperava mais',
      comment: 'O brinquedo é resistente, mas meu cão perdeu o interesse rapidamente. Para o preço, esperava algo mais interativo.',
      pros: ['Resistente', 'Boa qualidade do material'],
      cons: ['Pouco interativo', 'Cão perdeu interesse'],
      wouldRecommend: false,
      isVerifiedPurchase: true,
      helpfulCount: 3,
      reportCount: 0,
      status: 'approved',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '5',
      userId: '5',
      userName: 'Pedro Lima',
      userAvatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20of%20a%20man%20with%20glasses&image_size=square',
      type: 'store',
      rating: 5,
      title: 'Melhor pet shop da região!',
      comment: 'Atendimento excepcional, produtos de qualidade e preços justos. Já sou cliente há 2 anos e sempre fui bem atendido. Recomendo de olhos fechados!',
      wouldRecommend: true,
      isVerifiedPurchase: true,
      helpfulCount: 25,
      reportCount: 0,
      status: 'approved',
      storeResponse: {
        message: 'Pedro, muito obrigado pelas palavras carinhosas! É um prazer tê-lo como cliente. Continuaremos trabalhando para manter a qualidade do nosso atendimento!',
        respondedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        respondedBy: 'Pet Shop Romeo & Julieta'
      },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    }
  ];

  reviews.forEach(review => {
    mockReviews.set(review.id, review);
  });

  // Dados de "útil" para algumas avaliações
  const helpfulData: ReviewHelpful[] = [
    {
      id: '1',
      reviewId: '1',
      userId: '2',
      isHelpful: true,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      reviewId: '1',
      userId: '3',
      isHelpful: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      reviewId: '3',
      userId: '1',
      isHelpful: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

  helpfulData.forEach(helpful => {
    const reviewHelpful = mockReviewHelpful.get(helpful.reviewId) || [];
    reviewHelpful.push(helpful);
    mockReviewHelpful.set(helpful.reviewId, reviewHelpful);
  });
};

// Inicializar dados mockados
initMockData();

// Função para calcular resumo de avaliações
const calculateReviewSummary = (reviews: Review[]): ReviewSummary => {
  const totalReviews = reviews.length;
  
  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      verifiedPurchasePercentage: 0,
      recommendationPercentage: 0
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / totalReviews;

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(review => {
    ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
  });

  const verifiedPurchases = reviews.filter(r => r.isVerifiedPurchase).length;
  const verifiedPurchasePercentage = (verifiedPurchases / totalReviews) * 100;

  const recommendations = reviews.filter(r => r.wouldRecommend).length;
  const recommendationPercentage = (recommendations / totalReviews) * 100;

  return {
    totalReviews,
    averageRating: Number(averageRating.toFixed(1)),
    ratingDistribution,
    verifiedPurchasePercentage: Number(verifiedPurchasePercentage.toFixed(1)),
    recommendationPercentage: Number(recommendationPercentage.toFixed(1))
  };
};

// Listar avaliações
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve ser entre 1 e 50'),
  query('productId').optional().notEmpty(),
  query('serviceId').optional().notEmpty(),
  query('type').optional().isIn(['product', 'service', 'order', 'appointment', 'store']),
  query('rating').optional().isInt({ min: 1, max: 5 }),
  query('verified').optional().isBoolean(),
  query('sortBy').optional().isIn(['newest', 'oldest', 'rating_high', 'rating_low', 'helpful'])
], optionalAuth, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const {
      page = 1,
      limit = 20,
      productId,
      serviceId,
      type,
      rating,
      verified,
      sortBy = 'newest'
    } = req.query;

    // Filtrar avaliações aprovadas
    let reviews = Array.from(mockReviews.values())
      .filter(review => review.status === 'approved');

    // Aplicar filtros
    if (productId) {
      reviews = reviews.filter(r => r.productId === productId);
    }
    if (serviceId) {
      reviews = reviews.filter(r => r.serviceId === serviceId);
    }
    if (type) {
      reviews = reviews.filter(r => r.type === type);
    }
    if (rating) {
      reviews = reviews.filter(r => r.rating === Number(rating));
    }
    if (verified !== undefined) {
      reviews = reviews.filter(r => r.isVerifiedPurchase === verified);
    }

    // Ordenação
    switch (sortBy) {
      case 'oldest':
        reviews.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'rating_high':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_low':
        reviews.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        reviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      default: // newest
        reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // Paginação
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedReviews = reviews.slice(offset, offset + Number(limit));

    // Calcular resumo se houver filtro específico
    let summary: ReviewSummary | undefined;
    if (productId || serviceId || type) {
      summary = calculateReviewSummary(reviews);
    }

    res.json({
      data: paginatedReviews,
      summary,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: reviews.length,
        totalPages: Math.ceil(reviews.length / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obter resumo de avaliações
router.get('/summary', [
  query('productId').optional().notEmpty(),
  query('serviceId').optional().notEmpty(),
  query('type').optional().isIn(['product', 'service', 'order', 'appointment', 'store'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { productId, serviceId, type } = req.query;

    // Filtrar avaliações aprovadas
    let reviews = Array.from(mockReviews.values())
      .filter(review => review.status === 'approved');

    // Aplicar filtros
    if (productId) {
      reviews = reviews.filter(r => r.productId === productId);
    }
    if (serviceId) {
      reviews = reviews.filter(r => r.serviceId === serviceId);
    }
    if (type) {
      reviews = reviews.filter(r => r.type === type);
    }

    const summary = calculateReviewSummary(reviews);

    res.json({
      data: summary
    });
  } catch (error) {
    next(error);
  }
});

// Obter avaliação por ID
router.get('/:reviewId', [
  param('reviewId').notEmpty().withMessage('ID da avaliação é obrigatório')
], optionalAuth, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { reviewId } = req.params;
    const review = mockReviews.get(reviewId);

    if (!review || review.status !== 'approved') {
      throw createError('Avaliação não encontrada', 404, 'REVIEW_NOT_FOUND');
    }

    res.json({
      data: review
    });
  } catch (error) {
    next(error);
  }
});

// Criar nova avaliação
router.post('/', [
  body('type').isIn(['product', 'service', 'order', 'appointment', 'store']).withMessage('Tipo de avaliação inválido'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Avaliação deve ser entre 1 e 5'),
  body('title').notEmpty().withMessage('Título é obrigatório'),
  body('comment').isLength({ min: 10, max: 1000 }).withMessage('Comentário deve ter entre 10 e 1000 caracteres'),
  body('productId').if(body('type').equals('product')).notEmpty().withMessage('ID do produto é obrigatório'),
  body('serviceId').if(body('type').equals('service')).notEmpty().withMessage('ID do serviço é obrigatório'),
  body('orderId').optional().notEmpty(),
  body('appointmentId').optional().notEmpty(),
  body('images').optional().isArray({ max: 5 }).withMessage('Máximo 5 imagens'),
  body('pros').optional().isArray({ max: 10 }).withMessage('Máximo 10 pontos positivos'),
  body('cons').optional().isArray({ max: 10 }).withMessage('Máximo 10 pontos negativos'),
  body('wouldRecommend').isBoolean().withMessage('Campo de recomendação é obrigatório')
], authMiddleware, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = req.user?.id as string;
    const user = req.user;
    const reviewData = req.body;

    // Verificar se o usuário já avaliou este item
    const existingReview = Array.from(mockReviews.values()).find(review => {
      if (review.userId !== userId) return false;
      
      switch (reviewData.type) {
        case 'product':
          return review.productId === reviewData.productId;
        case 'service':
          return review.serviceId === reviewData.serviceId;
        case 'order':
          return review.orderId === reviewData.orderId;
        case 'appointment':
          return review.appointmentId === reviewData.appointmentId;
        case 'store':
          return review.type === 'store';
        default:
          return false;
      }
    });

    if (existingReview) {
      throw createError('Você já avaliou este item', 400, 'REVIEW_ALREADY_EXISTS');
    }

    // Verificar se é uma compra/serviço verificado (simulado)
    const isVerifiedPurchase = reviewData.orderId || reviewData.appointmentId || Math.random() > 0.3;

    const newReview: Review = {
      id: `review_${Date.now()}`,
      userId,
      userName: user.name,
      userAvatar: user.avatar,
      productId: reviewData.productId,
      serviceId: reviewData.serviceId,
      orderId: reviewData.orderId,
      appointmentId: reviewData.appointmentId,
      type: reviewData.type,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      images: reviewData.images || [],
      pros: reviewData.pros || [],
      cons: reviewData.cons || [],
      wouldRecommend: reviewData.wouldRecommend,
      isVerifiedPurchase,
      helpfulCount: 0,
      reportCount: 0,
      status: 'pending', // Avaliações precisam ser aprovadas
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockReviews.set(newReview.id, newReview);

    res.status(201).json({
      message: 'Avaliação criada com sucesso. Aguarde aprovação.',
      data: newReview
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar avaliação
router.put('/:reviewId', [
  param('reviewId').notEmpty().withMessage('ID da avaliação é obrigatório'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Avaliação deve ser entre 1 e 5'),
  body('title').optional().notEmpty().withMessage('Título não pode estar vazio'),
  body('comment').optional().isLength({ min: 10, max: 1000 }).withMessage('Comentário deve ter entre 10 e 1000 caracteres'),
  body('images').optional().isArray({ max: 5 }).withMessage('Máximo 5 imagens'),
  body('pros').optional().isArray({ max: 10 }).withMessage('Máximo 10 pontos positivos'),
  body('cons').optional().isArray({ max: 10 }).withMessage('Máximo 10 pontos negativos'),
  body('wouldRecommend').optional().isBoolean()
], authMiddleware, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = req.user?.id as string;
    const { reviewId } = req.params;
    const updateData = req.body;

    const review = mockReviews.get(reviewId);
    if (!review) {
      throw createError('Avaliação não encontrada', 404, 'REVIEW_NOT_FOUND');
    }

    if (review.userId !== userId) {
      throw createError('Acesso negado', 403, 'ACCESS_DENIED');
    }

    // Não permitir edição de avaliações aprovadas há mais de 30 dias
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (review.status === 'approved' && review.createdAt < thirtyDaysAgo) {
      throw createError('Não é possível editar avaliações antigas', 400, 'REVIEW_TOO_OLD');
    }

    // Atualizar avaliação
    const updatedReview: Review = {
      ...review,
      ...updateData,
      status: 'pending', // Volta para pendente após edição
      updatedAt: new Date()
    };

    mockReviews.set(reviewId, updatedReview);

    res.json({
      message: 'Avaliação atualizada com sucesso. Aguarde nova aprovação.',
      data: updatedReview
    });
  } catch (error) {
    next(error);
  }
});

// Excluir avaliação
router.delete('/:reviewId', [
  param('reviewId').notEmpty().withMessage('ID da avaliação é obrigatório')
], authMiddleware, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = req.user?.id as string;
    const { reviewId } = req.params;

    const review = mockReviews.get(reviewId);
    if (!review) {
      throw createError('Avaliação não encontrada', 404, 'REVIEW_NOT_FOUND');
    }

    if (review.userId !== userId) {
      throw createError('Acesso negado', 403, 'ACCESS_DENIED');
    }

    mockReviews.delete(reviewId);
    
    // Remover dados relacionados
    mockReviewHelpful.delete(reviewId);
    mockReviewReports.delete(reviewId);

    res.json({
      message: 'Avaliação excluída com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Marcar avaliação como útil/não útil
router.post('/:reviewId/helpful', [
  param('reviewId').notEmpty().withMessage('ID da avaliação é obrigatório'),
  body('isHelpful').isBoolean().withMessage('Campo isHelpful é obrigatório')
], authMiddleware, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = req.user?.id as string;
    const { reviewId } = req.params;
    const { isHelpful } = req.body;

    const review = mockReviews.get(reviewId);
    if (!review || review.status !== 'approved') {
      throw createError('Avaliação não encontrada', 404, 'REVIEW_NOT_FOUND');
    }

    if (review.userId === userId) {
      throw createError('Não é possível avaliar sua própria avaliação', 400, 'CANNOT_RATE_OWN_REVIEW');
    }

    const reviewHelpful = mockReviewHelpful.get(reviewId) || [];
    const existingHelpful = reviewHelpful.find(h => h.userId === userId);

    if (existingHelpful) {
      // Atualizar voto existente
      existingHelpful.isHelpful = isHelpful;
    } else {
      // Criar novo voto
      const newHelpful: ReviewHelpful = {
        id: `helpful_${Date.now()}`,
        reviewId,
        userId,
        isHelpful,
        createdAt: new Date()
      };
      reviewHelpful.push(newHelpful);
    }

    mockReviewHelpful.set(reviewId, reviewHelpful);

    // Atualizar contador na avaliação
    const helpfulCount = reviewHelpful.filter(h => h.isHelpful).length;
    review.helpfulCount = helpfulCount;
    mockReviews.set(reviewId, review);

    res.json({
      message: 'Voto registrado com sucesso',
      data: { helpfulCount }
    });
  } catch (error) {
    next(error);
  }
});

// Reportar avaliação
router.post('/:reviewId/report', [
  param('reviewId').notEmpty().withMessage('ID da avaliação é obrigatório'),
  body('reason').isIn(['spam', 'inappropriate', 'fake', 'offensive', 'other']).withMessage('Motivo inválido'),
  body('description').optional().isLength({ max: 500 }).withMessage('Descrição deve ter no máximo 500 caracteres')
], authMiddleware, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = req.user?.id as string;
    const { reviewId } = req.params;
    const { reason, description } = req.body;

    const review = mockReviews.get(reviewId);
    if (!review) {
      throw createError('Avaliação não encontrada', 404, 'REVIEW_NOT_FOUND');
    }

    if (review.userId === userId) {
      throw createError('Não é possível reportar sua própria avaliação', 400, 'CANNOT_REPORT_OWN_REVIEW');
    }

    const reviewReports = mockReviewReports.get(reviewId) || [];
    const existingReport = reviewReports.find(r => r.userId === userId);

    if (existingReport) {
      throw createError('Você já reportou esta avaliação', 400, 'ALREADY_REPORTED');
    }

    const newReport: ReviewReport = {
      id: `report_${Date.now()}`,
      reviewId,
      userId,
      reason,
      description,
      status: 'pending',
      createdAt: new Date()
    };

    reviewReports.push(newReport);
    mockReviewReports.set(reviewId, reviewReports);

    // Atualizar contador na avaliação
    review.reportCount = reviewReports.length;
    mockReviews.set(reviewId, review);

    res.json({
      message: 'Denúncia registrada com sucesso. Obrigado por nos ajudar a manter a qualidade das avaliações.'
    });
  } catch (error) {
    next(error);
  }
});

// Listar avaliações do usuário
router.get('/user/my-reviews', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve ser entre 1 e 50'),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'hidden'])
], authMiddleware, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = req.user?.id as string;
    const {
      page = 1,
      limit = 20,
      status
    } = req.query;

    // Filtrar avaliações do usuário
    let userReviews = Array.from(mockReviews.values())
      .filter(review => review.userId === userId);

    // Aplicar filtro de status
    if (status) {
      userReviews = userReviews.filter(r => r.status === status);
    }

    // Ordenar por data de criação (mais recente primeiro)
    userReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Paginação
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedReviews = userReviews.slice(offset, offset + Number(limit));

    res.json({
      data: paginatedReviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: userReviews.length,
        totalPages: Math.ceil(userReviews.length / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

export { router as reviewRoutes };