import { Request, Response, NextFunction } from 'express';

// Interface para estender o Request com informações da API Key
export interface AuthenticatedRequest extends Request {
  apiKey?: {
    id: string;
    name: string;
    permissions: string[];
    rateLimit?: {
      requests: number;
      window: number;
    };
  };
}

// Dados mockados de API Keys (em produção, isso viria do banco de dados)
const API_KEYS = [
  {
    id: '1',
    key: 'pk_mobile_dev_12345678901234567890',
    name: 'Mobile App Development',
    permissions: ['read', 'write', 'delete'],
    active: true,
    rateLimit: {
      requests: 1000,
      window: 15 * 60 * 1000 // 15 minutos
    },
    createdAt: new Date('2024-01-01'),
    lastUsed: new Date()
  },
  {
    id: '2',
    key: 'pk_mobile_prod_09876543210987654321',
    name: 'Mobile App Production',
    permissions: ['read', 'write'],
    active: true,
    rateLimit: {
      requests: 5000,
      window: 15 * 60 * 1000 // 15 minutos
    },
    createdAt: new Date('2024-01-01'),
    lastUsed: new Date()
  },
  {
    id: '3',
    key: 'pk_mobile_test_11111111111111111111',
    name: 'Mobile App Testing',
    permissions: ['read'],
    active: true,
    rateLimit: {
      requests: 100,
      window: 15 * 60 * 1000 // 15 minutos
    },
    createdAt: new Date('2024-01-01'),
    lastUsed: new Date()
  }
];

// Middleware para validar API Key
export const validateApiKey = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Obter API Key do header
    const apiKey = req.headers['x-api-key'] as string;

    // Verificar se a API Key foi fornecida
    if (!apiKey) {
      res.status(401).json({
        error: 'API Key obrigatória',
        code: 'API_KEY_REQUIRED',
        message: 'Forneça uma API Key válida no header X-API-Key'
      });
      return;
    }

    // Buscar API Key nos dados mockados
    const keyData = API_KEYS.find(k => k.key === apiKey && k.active);

    if (!keyData) {
      res.status(401).json({
        error: 'API Key inválida',
        code: 'INVALID_API_KEY',
        message: 'A API Key fornecida é inválida ou foi desativada'
      });
      return;
    }

    // Verificar se a API Key tem permissões para o método HTTP
    const method = req.method.toLowerCase();
    const requiredPermission = getRequiredPermission(method);

    if (requiredPermission && !keyData.permissions.includes(requiredPermission)) {
      res.status(403).json({
        error: 'Permissão insuficiente',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Esta API Key não tem permissão para ${method.toUpperCase()} requests`
      });
      return;
    }

    // Adicionar informações da API Key ao request
    req.apiKey = {
      id: keyData.id,
      name: keyData.name,
      permissions: keyData.permissions,
      rateLimit: keyData.rateLimit
    };

    // Atualizar último uso (em produção, isso seria feito de forma assíncrona)
    keyData.lastUsed = new Date();

    next();
  } catch (error) {
    console.error('Erro na validação da API Key:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Erro ao validar API Key'
    });
  }
};

// Função para determinar a permissão necessária baseada no método HTTP
function getRequiredPermission(method: string): string | null {
  switch (method) {
    case 'get':
    case 'head':
    case 'options':
      return 'read';
    case 'post':
    case 'put':
    case 'patch':
      return 'write';
    case 'delete':
      return 'delete';
    default:
      return null;
  }
}

// Middleware opcional para verificar permissões específicas
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.apiKey) {
      res.status(401).json({
        error: 'API Key não validada',
        code: 'API_KEY_NOT_VALIDATED',
        message: 'Execute o middleware validateApiKey primeiro'
      });
      return;
    }

    if (!req.apiKey.permissions.includes(permission)) {
      res.status(403).json({
        error: 'Permissão insuficiente',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Esta API Key não tem a permissão '${permission}'`
      });
      return;
    }

    next();
  };
};

// Middleware para verificar se a API Key tem rate limit personalizado
export const checkApiKeyRateLimit = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.apiKey?.rateLimit) {
    // Aqui você poderia implementar lógica de rate limiting específica para a API Key
    // Por exemplo, usando Redis para armazenar contadores por API Key
    console.log(`Rate limit para API Key ${req.apiKey.id}: ${req.apiKey.rateLimit.requests} requests por ${req.apiKey.rateLimit.window}ms`);
  }
  
  next();
};

// Função utilitária para obter informações da API Key atual
export const getApiKeyInfo = (req: AuthenticatedRequest) => {
  return req.apiKey || null;
};

// Função para validar se uma API Key existe (para uso em outros middlewares)
export const isValidApiKey = (apiKey: string): boolean => {
  return API_KEYS.some(k => k.key === apiKey && k.active);
};

// Função para obter estatísticas de uso da API Key
export const getApiKeyStats = (apiKeyId: string) => {
  const keyData = API_KEYS.find(k => k.id === apiKeyId);
  
  if (!keyData) {
    return null;
  }

  return {
    id: keyData.id,
    name: keyData.name,
    permissions: keyData.permissions,
    active: keyData.active,
    createdAt: keyData.createdAt,
    lastUsed: keyData.lastUsed,
    rateLimit: keyData.rateLimit
  };
};

// Exportar tipos para uso em outros arquivos
export type ApiKeyPermission = 'read' | 'write' | 'delete';

export interface ApiKeyData {
  id: string;
  key: string;
  name: string;
  permissions: ApiKeyPermission[];
  active: boolean;
  rateLimit?: {
    requests: number;
    window: number;
  };
  createdAt: Date;
  lastUsed: Date;
}