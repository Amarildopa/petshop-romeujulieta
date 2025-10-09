import express from 'express';
import { query, param, validationResult } from 'express-validator';
 
 
import { 
  Product, 
  Category, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ProductListQuery, 
  ProductListResponse,
  ProductReview,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreateReviewData,
  ProductRecommendation
} from '../types/product';
import { createError } from '../middleware/errorHandler';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { optionalAuth, authMiddleware } from '../middleware/auth';

const router = express.Router();

// Dados mockados
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Ração',
    slug: 'racao',
    description: 'Ração para cães e gatos',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20food%20bag%20icon&image_size=square',
    isActive: true,
    sortOrder: 1,
    productCount: 25,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Brinquedos',
    slug: 'brinquedos',
    description: 'Brinquedos para pets',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20pet%20toys%20icon&image_size=square',
    isActive: true,
    sortOrder: 2,
    productCount: 18,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Higiene',
    slug: 'higiene',
    description: 'Produtos de higiene e cuidado',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20hygiene%20products%20icon&image_size=square',
    isActive: true,
    sortOrder: 3,
    productCount: 12,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Ração Premium para Cães Adultos',
    description: 'Ração super premium para cães adultos de todas as raças. Rica em proteínas e nutrientes essenciais.',
    shortDescription: 'Ração premium para cães adultos',
    sku: 'RAC001',
    barcode: '7891234567890',
    categoryId: '1',
    category: mockCategories[0],
    brand: 'PetNutri',
    price: 89.90,
    salePrice: 79.90,
    stock: 50,
    minStock: 10,
    weight: 15,
    dimensions: {
      length: 40,
      width: 25,
      height: 60
    },
    images: [
      {
        id: '1',
        productId: '1',
        url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20dog%20food%20bag%20package&image_size=square',
        alt: 'Ração Premium para Cães',
        sortOrder: 1,
        isMain: true,
        createdAt: new Date()
      }
    ],
    tags: ['ração', 'premium', 'cães', 'adultos'],
    attributes: [
      {
        id: '1',
        name: 'Peso',
        value: '15kg',
        type: 'text',
        isRequired: true,
        isVisible: true,
        sortOrder: 1
      },
      {
        id: '2',
        name: 'Idade',
        value: 'Adulto',
        type: 'select',
        isRequired: true,
        isVisible: true,
        sortOrder: 2
      }
    ],
    isActive: true,
    isFeatured: true,
    isDigital: false,
    allowBackorder: false,
    trackStock: true,
    seoTitle: 'Ração Premium para Cães Adultos - PetNutri',
    seoDescription: 'Compre ração premium para cães adultos com desconto. Entrega rápida e segura.',
    rating: 4.8,
    reviewCount: 127,
    salesCount: 89,
    viewCount: 1250,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Bola de Borracha Resistente',
    description: 'Bola de borracha super resistente para cães de grande porte. Ideal para brincadeiras e exercícios.',
    shortDescription: 'Bola resistente para cães',
    sku: 'BRI001',
    categoryId: '2',
    category: mockCategories[1],
    brand: 'PlayPet',
    price: 24.90,
    stock: 30,
    weight: 0.3,
    images: [
      {
        id: '2',
        productId: '2',
        url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20rubber%20ball%20dog%20toy&image_size=square',
        alt: 'Bola de Borracha para Cães',
        sortOrder: 1,
        isMain: true,
        createdAt: new Date()
      }
    ],
    tags: ['brinquedo', 'bola', 'borracha', 'resistente'],
    attributes: [
      {
        id: '3',
        name: 'Material',
        value: 'Borracha',
        type: 'text',
        isRequired: true,
        isVisible: true,
        sortOrder: 1
      },
      {
        id: '4',
        name: 'Tamanho',
        value: 'Grande',
        type: 'select',
        isRequired: true,
        isVisible: true,
        sortOrder: 2
      }
    ],
    isActive: true,
    isFeatured: false,
    isDigital: false,
    allowBackorder: true,
    trackStock: true,
    rating: 4.5,
    reviewCount: 43,
    salesCount: 156,
    viewCount: 890,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date()
  }
];

const mockReviews: ProductReview[] = [
  {
    id: '1',
    productId: '1',
    userId: '1',
    user: {
      id: '1',
      name: 'João Silva',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20of%20a%20man&image_size=square'
    },
    rating: 5,
    title: 'Excelente ração!',
    comment: 'Meu cão adorou esta ração. Muito nutritiva e ele ficou com o pelo mais brilhante.',
    isVerifiedPurchase: true,
    helpfulCount: 12,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
];

// Listar produtos
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('categoryId').optional().isString(),
  query('search').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sortBy').optional().isIn(['name', 'price', 'rating', 'salesCount', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const {
      page = 1,
      limit = 20,
      categoryId,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query as Record<string, string>;

    let filteredProducts = [...mockProducts];

    // Filtrar por categoria
    if (categoryId) {
      filteredProducts = filteredProducts.filter(p => p.categoryId === categoryId);
    }

    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por preço
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => (p.salePrice || p.price) >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => (p.salePrice || p.price) <= parseFloat(maxPrice));
    }

    // Ordenar
    filteredProducts.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = a.salePrice || a.price;
          bValue = b.salePrice || b.price;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'salesCount':
          aValue = a.salesCount;
          bValue = b.salesCount;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1;
      }
      return aValue < bValue ? -1 : 1;
    });

    // Paginação
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const response: ProductListResponse = {
      products: paginatedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        categories: mockCategories,
        brands: [...new Set(mockProducts.map(p => p.brand).filter(Boolean))],
        priceRange: {
          min: Math.min(...mockProducts.map(p => p.salePrice || p.price)),
          max: Math.max(...mockProducts.map(p => p.salePrice || p.price))
        },
        attributes: []
      }
    };

    res.json({
      data: response
    });
  } catch (error) {
    next(error);
  }
});

// Obter produto por ID
router.get('/:id', optionalAuth, [
  param('id').notEmpty().withMessage('ID do produto é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { id } = req.params;
    const product = mockProducts.find(p => p.id === id);

    if (!product) {
      throw createError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
    }

    // Incrementar contador de visualizações
    product.viewCount++;

    res.json({
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// Obter avaliações do produto
router.get('/:id/reviews', [
  param('id').notEmpty().withMessage('ID do produto é obrigatório'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query as Record<string, string>;

    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      throw createError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
    }

    const productReviews = mockReviews.filter(r => r.productId === id);
    const total = productReviews.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedReviews = productReviews.slice(startIndex, startIndex + limit);

    res.json({
      data: {
        reviews: paginatedReviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        summary: {
          averageRating: product.rating,
          totalReviews: product.reviewCount,
          ratingDistribution: {
            5: Math.floor(product.reviewCount * 0.6),
            4: Math.floor(product.reviewCount * 0.25),
            3: Math.floor(product.reviewCount * 0.1),
            2: Math.floor(product.reviewCount * 0.03),
            1: Math.floor(product.reviewCount * 0.02)
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obter recomendações
router.get('/:id/recommendations', [
  param('id').notEmpty().withMessage('ID do produto é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { id } = req.params;
    const product = mockProducts.find(p => p.id === id);

    if (!product) {
      throw createError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
    }

    const recommendations: ProductRecommendation[] = [
      {
        type: 'related',
        products: mockProducts.filter(p => p.id !== id && p.categoryId === product.categoryId).slice(0, 4),
        reason: 'Produtos da mesma categoria'
      },
      {
        type: 'similar',
        products: mockProducts.filter(p => p.id !== id && p.brand === product.brand).slice(0, 4),
        reason: 'Produtos da mesma marca'
      }
    ];

    res.json({
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
});

// Listar categorias
router.get('/categories/list', async (req, res, next) => {
  try {
    res.json({
      data: mockCategories
    });
  } catch (error) {
    next(error);
  }
});

export { router as productRoutes };