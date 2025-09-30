import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { requestLogger, performanceLogger, errorLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { validateApiKey } from './middleware/apiKey';

// Importar rotas
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { cartRoutes } from './routes/cart';
import { orderRoutes } from './routes/orders';
import { userRoutes } from './routes/users';
import { categoryRoutes } from './routes/categories';
import { notificationRoutes } from './routes/notifications';
import { addressRoutes } from './routes/addresses';
import { paymentRoutes } from './routes/payments';
import { reviewRoutes } from './routes/reviews';
import { couponRoutes } from './routes/coupons';

const app = express();
const PORT = process.env.MOBILE_API_PORT || 3001;

// Configurações de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configurado para aplicativos mobile
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:19006', // Expo development
    'exp://localhost:19000', // Expo development
    /^https:\/\/.*\.expo\.dev$/, // Expo tunneling
    /^https:\/\/.*\.ngrok\.io$/, // ngrok tunneling
    'capacitor://localhost', // Capacitor iOS
    'http://localhost', // Capacitor Android
    'ionic://localhost', // Ionic
    'http://10.0.2.2:3000', // Android emulator
    'http://127.0.0.1:3000' // iOS simulator
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ]
}));

// Middleware de compressão
app.use(compression());

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Limite de 1000 requests por IP por janela
  message: {
    error: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Diferentes limites para diferentes endpoints
  skip: (req) => {
    // Pular rate limiting para health check
    return req.path === '/health';
  }
});

// Rate limiting mais restritivo para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 tentativas de login por IP
  message: {
    error: 'Muitas tentativas de login, tente novamente em 15 minutos.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Aplicar rate limiting
app.use(limiter);
app.use('/api/mobile/auth/login', authLimiter);
app.use('/api/mobile/auth/register', authLimiter);

// Middleware de logging
app.use(requestLogger);
app.use(performanceLogger);

// Health check endpoint (sem autenticação)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Pet Shop Romeo & Julieta - Mobile API',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Endpoint de informações da API
app.get('/api/mobile', (req, res) => {
  res.json({
    name: 'Pet Shop Romeo & Julieta - Mobile API',
    version: '1.0.0',
    description: 'API REST para aplicativo mobile do Pet Shop Romeo & Julieta',
    endpoints: {
      auth: '/api/mobile/auth',
      products: '/api/mobile/products',
      categories: '/api/mobile/categories',
      cart: '/api/mobile/cart',
      orders: '/api/mobile/orders',
      users: '/api/mobile/users',
      addresses: '/api/mobile/addresses',
      payments: '/api/mobile/payments',
      notifications: '/api/mobile/notifications',
      reviews: '/api/mobile/reviews',
      coupons: '/api/mobile/coupons'
    },
    documentation: '/api/mobile/docs',
    status: 'active'
  });
});

// Middleware de validação de API Key (aplicado a todas as rotas da API)
app.use('/api/mobile', validateApiKey);

// Configurar rotas da API
app.use('/api/mobile/auth', authRoutes);
app.use('/api/mobile/products', productRoutes);
app.use('/api/mobile/categories', categoryRoutes);
app.use('/api/mobile/cart', cartRoutes);
app.use('/api/mobile/orders', orderRoutes);
app.use('/api/mobile/users', userRoutes);
app.use('/api/mobile/addresses', addressRoutes);
app.use('/api/mobile/payments', paymentRoutes);
app.use('/api/mobile/notifications', notificationRoutes);
app.use('/api/mobile/reviews', reviewRoutes);
app.use('/api/mobile/coupons', couponRoutes);

// Documentação da API (endpoint simples)
app.get('/api/mobile/docs', (req, res) => {
  res.json({
    title: 'Pet Shop Romeo & Julieta - Mobile API Documentation',
    version: '1.0.0',
    description: 'API REST completa para aplicativo mobile do Pet Shop Romeo & Julieta',
    baseUrl: `${req.protocol}://${req.get('host')}/api/mobile`,
    authentication: {
      type: 'Bearer Token + API Key',
      description: 'Todas as requisições devem incluir um X-API-Key válido no header. Endpoints protegidos também requerem Authorization: Bearer <token>'
    },
    endpoints: {
      '/auth': {
        description: 'Autenticação e gerenciamento de usuários',
        methods: {
          'POST /login': 'Login do usuário',
          'POST /register': 'Registro de novo usuário',
          'POST /refresh': 'Renovar token de acesso',
          'POST /logout': 'Logout do usuário',
          'POST /change-password': 'Alterar senha',
          'POST /forgot-password': 'Solicitar reset de senha',
          'POST /verify-reset-token': 'Verificar token de reset',
          'GET /profile': 'Obter perfil do usuário'
        }
      },
      '/products': {
        description: 'Catálogo de produtos',
        methods: {
          'GET /': 'Listar produtos com filtros e paginação',
          'GET /:id': 'Obter detalhes de um produto',
          'GET /:id/reviews': 'Obter avaliações de um produto',
          'GET /:id/recommendations': 'Obter produtos recomendados'
        }
      },
      '/categories': {
        description: 'Categorias de produtos',
        methods: {
          'GET /': 'Listar categorias',
          'GET /:id': 'Obter detalhes de uma categoria',
          'GET /:id/breadcrumb': 'Obter breadcrumb de uma categoria',
          'GET /popular': 'Listar categorias populares',
          'GET /search': 'Buscar categorias'
        }
      },
      '/cart': {
        description: 'Carrinho de compras',
        methods: {
          'GET /': 'Obter carrinho do usuário',
          'POST /items': 'Adicionar item ao carrinho',
          'PUT /items/:id': 'Atualizar item do carrinho',
          'DELETE /items/:id': 'Remover item do carrinho',
          'DELETE /clear': 'Limpar carrinho',
          'POST /coupon': 'Aplicar cupom',
          'DELETE /coupon': 'Remover cupom',
          'GET /summary': 'Obter resumo do carrinho'
        }
      },
      '/orders': {
        description: 'Pedidos',
        methods: {
          'GET /': 'Listar pedidos do usuário',
          'GET /:id': 'Obter detalhes de um pedido',
          'POST /': 'Criar novo pedido',
          'POST /:id/cancel': 'Cancelar pedido',
          'GET /:id/tracking': 'Obter rastreamento do pedido',
          'GET /payment-methods': 'Listar métodos de pagamento',
          'GET /shipping-methods': 'Listar métodos de envio'
        }
      },
      '/users': {
        description: 'Perfil do usuário',
        methods: {
          'GET /profile': 'Obter perfil',
          'PUT /profile': 'Atualizar perfil',
          'POST /change-password': 'Alterar senha',
          'GET /preferences': 'Obter preferências',
          'PUT /preferences': 'Atualizar preferências',
          'POST /deactivate': 'Desativar conta'
        }
      },
      '/addresses': {
        description: 'Endereços do usuário',
        methods: {
          'GET /': 'Listar endereços',
          'GET /:id': 'Obter endereço por ID',
          'POST /': 'Adicionar novo endereço',
          'PUT /:id': 'Atualizar endereço',
          'DELETE /:id': 'Remover endereço',
          'POST /:id/set-default': 'Definir endereço padrão',
          'GET /cep/:cep': 'Consultar CEP',
          'POST /validate-delivery': 'Validar possibilidade de entrega'
        }
      },
      '/payments': {
        description: 'Métodos de pagamento',
        methods: {
          'GET /methods': 'Listar métodos de pagamento',
          'POST /methods': 'Adicionar método de pagamento',
          'PUT /methods/:id': 'Atualizar método de pagamento',
          'DELETE /methods/:id': 'Remover método de pagamento',
          'POST /intents': 'Criar intenção de pagamento',
          'POST /intents/:id/confirm': 'Confirmar pagamento',
          'GET /payments': 'Listar pagamentos',
          'GET /payments/:id': 'Obter detalhes de pagamento',
          'POST /refunds': 'Solicitar reembolso',
          'GET /installments': 'Obter taxas de parcelamento'
        }
      },
      '/notifications': {
        description: 'Notificações',
        methods: {
          'GET /': 'Listar notificações',
          'GET /unread-count': 'Obter contagem de não lidas',
          'POST /:id/read': 'Marcar como lida',
          'POST /mark-all-read': 'Marcar todas como lidas',
          'DELETE /:id': 'Excluir notificação',
          'GET /preferences': 'Obter preferências',
          'PUT /preferences': 'Atualizar preferências',
          'POST /device-tokens': 'Registrar token de dispositivo',
          'DELETE /device-tokens/:token': 'Remover token de dispositivo',
          'POST /test': 'Testar envio de notificação'
        }
      },
      '/reviews': {
        description: 'Avaliações',
        methods: {
          'GET /': 'Listar avaliações',
          'GET /summary': 'Obter resumo de avaliações',
          'GET /:id': 'Obter avaliação por ID',
          'POST /': 'Criar nova avaliação',
          'PUT /:id': 'Atualizar avaliação',
          'DELETE /:id': 'Excluir avaliação',
          'POST /:id/helpful': 'Marcar como útil',
          'POST /:id/report': 'Reportar avaliação',
          'GET /user/my-reviews': 'Listar minhas avaliações'
        }
      },
      '/coupons': {
        description: 'Cupons e promoções',
        methods: {
          'GET /public': 'Listar cupons públicos',
          'POST /validate': 'Validar cupom',
          'GET /promotions': 'Listar promoções ativas',
          'GET /promotions/:id': 'Obter detalhes de promoção',
          'GET /loyalty/program': 'Obter programa de fidelidade',
          'GET /loyalty/my-points': 'Obter meus pontos',
          'GET /loyalty/points-history': 'Obter histórico de pontos',
          'POST /loyalty/redeem': 'Resgatar pontos'
        }
      }
    },
    errorCodes: {
      'VALIDATION_ERROR': 'Erro de validação de dados',
      'AUTHENTICATION_REQUIRED': 'Autenticação obrigatória',
      'ACCESS_DENIED': 'Acesso negado',
      'RESOURCE_NOT_FOUND': 'Recurso não encontrado',
      'RATE_LIMIT_EXCEEDED': 'Limite de requisições excedido',
      'INTERNAL_SERVER_ERROR': 'Erro interno do servidor'
    },
    responseFormat: {
      success: {
        data: 'Dados da resposta',
        message: 'Mensagem opcional',
        pagination: 'Informações de paginação (quando aplicável)'
      },
      error: {
        error: 'Mensagem de erro',
        code: 'Código do erro',
        details: 'Detalhes adicionais (opcional)'
      }
    }
  });
});

// Middleware de tratamento de erros
app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Mobile API rodando na porta ${PORT}`);
  console.log(`📱 Documentação disponível em: http://localhost:${PORT}/api/mobile/docs`);
  console.log(`❤️ Health check disponível em: http://localhost:${PORT}/health`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM, encerrando servidor graciosamente...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Recebido SIGINT, encerrando servidor graciosamente...');
  process.exit(0);
});

export default app;