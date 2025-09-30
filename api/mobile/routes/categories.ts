import express from 'express';
import { query, validationResult } from 'express-validator';
import { Category } from '../types/product';
import { createError } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';

const router = express.Router();

// Aplicar autenticação opcional
router.use(optionalAuth);

// Dados mockados de categorias
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Alimentação',
    slug: 'alimentacao',
    description: 'Rações, petiscos e suplementos para pets',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20food%20bowls%20with%20kibble%20and%20treats%20colorful%20modern%20style&image_size=square',
    parentId: null,
    isActive: true,
    sortOrder: 1,
    productCount: 45,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Ração Seca',
    slug: 'racao-seca',
    description: 'Rações secas para cães e gatos de todas as idades',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=dry%20pet%20food%20kibble%20bags%20premium%20quality&image_size=square',
    parentId: '1',
    isActive: true,
    sortOrder: 1,
    productCount: 25,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Ração Úmida',
    slug: 'racao-umida',
    description: 'Patês e sachês para cães e gatos',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=wet%20pet%20food%20cans%20and%20pouches%20premium%20quality&image_size=square',
    parentId: '1',
    isActive: true,
    sortOrder: 2,
    productCount: 15,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'Petiscos',
    slug: 'petiscos',
    description: 'Petiscos, biscoitos e snacks para pets',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20treats%20and%20snacks%20colorful%20variety&image_size=square',
    parentId: '1',
    isActive: true,
    sortOrder: 3,
    productCount: 5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '5',
    name: 'Brinquedos',
    slug: 'brinquedos',
    description: 'Brinquedos para diversão e exercício dos pets',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20pet%20toys%20balls%20ropes%20squeaky%20toys&image_size=square',
    parentId: null,
    isActive: true,
    sortOrder: 2,
    productCount: 30,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '6',
    name: 'Brinquedos para Cães',
    slug: 'brinquedos-caes',
    description: 'Brinquedos específicos para cães',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=dog%20toys%20balls%20ropes%20chew%20toys&image_size=square',
    parentId: '5',
    isActive: true,
    sortOrder: 1,
    productCount: 20,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '7',
    name: 'Brinquedos para Gatos',
    slug: 'brinquedos-gatos',
    description: 'Brinquedos específicos para gatos',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cat%20toys%20feather%20wands%20mice%20balls&image_size=square',
    parentId: '5',
    isActive: true,
    sortOrder: 2,
    productCount: 10,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '8',
    name: 'Higiene e Cuidados',
    slug: 'higiene-cuidados',
    description: 'Produtos para higiene e cuidados com pets',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20grooming%20products%20shampoo%20brushes%20nail%20clippers&image_size=square',
    parentId: null,
    isActive: true,
    sortOrder: 3,
    productCount: 25,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '9',
    name: 'Shampoos',
    slug: 'shampoos',
    description: 'Shampoos e condicionadores para pets',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20shampoo%20bottles%20grooming%20products&image_size=square',
    parentId: '8',
    isActive: true,
    sortOrder: 1,
    productCount: 12,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '10',
    name: 'Escovas e Pentes',
    slug: 'escovas-pentes',
    description: 'Escovas, pentes e acessórios para escovação',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20brushes%20combs%20grooming%20tools&image_size=square',
    parentId: '8',
    isActive: true,
    sortOrder: 2,
    productCount: 8,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '11',
    name: 'Cortadores de Unha',
    slug: 'cortadores-unha',
    description: 'Cortadores e lixas para unhas de pets',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20nail%20clippers%20grooming%20tools&image_size=square',
    parentId: '8',
    isActive: true,
    sortOrder: 3,
    productCount: 5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '12',
    name: 'Acessórios',
    slug: 'acessorios',
    description: 'Coleiras, guias, camas e outros acessórios',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20accessories%20collars%20leashes%20beds&image_size=square',
    parentId: null,
    isActive: true,
    sortOrder: 4,
    productCount: 40,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '13',
    name: 'Coleiras e Guias',
    slug: 'coleiras-guias',
    description: 'Coleiras, guias e peitorais para passeio',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20collars%20leashes%20harnesses%20colorful&image_size=square',
    parentId: '12',
    isActive: true,
    sortOrder: 1,
    productCount: 18,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '14',
    name: 'Camas e Almofadas',
    slug: 'camas-almofadas',
    description: 'Camas, almofadas e casinhas para pets',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20beds%20cushions%20comfortable%20cozy&image_size=square',
    parentId: '12',
    isActive: true,
    sortOrder: 2,
    productCount: 15,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '15',
    name: 'Comedouros e Bebedouros',
    slug: 'comedouros-bebedouros',
    description: 'Comedouros, bebedouros e dispensadores',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20food%20water%20bowls%20feeders%20modern&image_size=square',
    parentId: '12',
    isActive: true,
    sortOrder: 3,
    productCount: 7,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
];

// Função para construir árvore de categorias
const buildCategoryTree = (categories: Category[], parentId: string | null = null): Category[] => {
  return categories
    .filter(cat => cat.parentId === parentId && cat.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(category => ({
      ...category,
      children: buildCategoryTree(categories, category.id)
    }));
};

// Função para obter todas as subcategorias de uma categoria
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAllSubcategories = (categories: Category[], parentId: string): string[] => {
  const subcategories: string[] = [];
  const directChildren = categories.filter(cat => cat.parentId === parentId);
  
  for (const child of directChildren) {
    subcategories.push(child.id);
    subcategories.push(...getAllSubcategories(categories, child.id));
  }
  
  return subcategories;
};

// Listar todas as categorias
router.get('/', [
  query('includeInactive').optional().isBoolean().withMessage('includeInactive deve ser um boolean'),
  query('parentId').optional().isString().withMessage('parentId deve ser uma string'),
  query('tree').optional().isBoolean().withMessage('tree deve ser um boolean'),
  query('withProductCount').optional().isBoolean().withMessage('withProductCount deve ser um boolean')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const {
      includeInactive = false,
      parentId,
      tree = false,
      withProductCount = true
    } = req.query;

    let categories = mockCategories;

    // Filtrar por status ativo
    if (!includeInactive) {
      categories = categories.filter(cat => cat.isActive);
    }

    // Filtrar por categoria pai
    if (parentId !== undefined) {
      categories = categories.filter(cat => cat.parentId === (parentId || null));
    }

    // Construir árvore de categorias se solicitado
    if (tree && parentId === undefined) {
      const categoryTree = buildCategoryTree(categories);
      return res.json({
        data: categoryTree
      });
    }

    // Ordenar por sortOrder
    categories.sort((a, b) => a.sortOrder - b.sortOrder);

    // Remover contagem de produtos se não solicitado
    if (!withProductCount) {
      categories = categories.map(({ productCount, ...cat }) => cat);
    }

    res.json({
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

// Obter categoria por ID
router.get('/:categoryId', async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const category = mockCategories.find(cat => cat.id === categoryId);
    if (!category) {
      throw createError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND');
    }

    if (!category.isActive) {
      throw createError('Categoria não está ativa', 400, 'CATEGORY_INACTIVE');
    }

    // Adicionar subcategorias
    const subcategories = mockCategories
      .filter(cat => cat.parentId === categoryId && cat.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    // Adicionar categoria pai se existir
    let parentCategory = null;
    if (category.parentId) {
      parentCategory = mockCategories.find(cat => cat.id === category.parentId);
    }

    res.json({
      data: {
        ...category,
        subcategories,
        parent: parentCategory
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obter categoria por slug
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = mockCategories.find(cat => cat.slug === slug);
    if (!category) {
      throw createError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND');
    }

    if (!category.isActive) {
      throw createError('Categoria não está ativa', 400, 'CATEGORY_INACTIVE');
    }

    // Adicionar subcategorias
    const subcategories = mockCategories
      .filter(cat => cat.parentId === category.id && cat.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    // Adicionar categoria pai se existir
    let parentCategory = null;
    if (category.parentId) {
      parentCategory = mockCategories.find(cat => cat.id === category.parentId);
    }

    res.json({
      data: {
        ...category,
        subcategories,
        parent: parentCategory
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obter breadcrumb de uma categoria
router.get('/:categoryId/breadcrumb', async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const category = mockCategories.find(cat => cat.id === categoryId);
    if (!category) {
      throw createError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND');
    }

    // Construir breadcrumb
    const breadcrumb: Category[] = [];
    let currentCategory: Category | undefined = category;

    while (currentCategory) {
      breadcrumb.unshift(currentCategory);
      
      if (currentCategory.parentId) {
        currentCategory = mockCategories.find(cat => cat.id === currentCategory!.parentId);
      } else {
        currentCategory = undefined;
      }
    }

    res.json({
      data: breadcrumb
    });
  } catch (error) {
    next(error);
  }
});

// Obter categorias populares (com mais produtos)
router.get('/popular/top', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limite deve ser entre 1 e 20')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { limit = 10 } = req.query;

    const popularCategories = mockCategories
      .filter(cat => cat.isActive)
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, Number(limit));

    res.json({
      data: popularCategories
    });
  } catch (error) {
    next(error);
  }
});

// Buscar categorias
router.get('/search/:query', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve ser entre 1 e 50')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
const { query: searchQuery } = req.params;
    const { limit = 20 } = req.query;

    if (!searchQuery || searchQuery.trim().length < 2) {
      throw createError('Termo de busca deve ter pelo menos 2 caracteres', 400, 'INVALID_SEARCH_QUERY');
    }

    const searchTerm = searchQuery.toLowerCase().trim();

    const matchingCategories = mockCategories
      .filter(cat => 
        cat.isActive && (
          cat.name.toLowerCase().includes(searchTerm) ||
          cat.description.toLowerCase().includes(searchTerm) ||
          cat.slug.toLowerCase().includes(searchTerm)
        )
      )
      .sort((a, b) => {
        // Priorizar matches exatos no nome
        const aNameMatch = a.name.toLowerCase().includes(searchTerm);
        const bNameMatch = b.name.toLowerCase().includes(searchTerm);
        
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        
        // Depois por contagem de produtos
        return b.productCount - a.productCount;
      })
      .slice(0, Number(limit));

    res.json({
      data: matchingCategories,
      query: searchQuery,
      total: matchingCategories.length
    });
  } catch (error) {
    next(error);
  }
});

export { router as categoryRoutes };