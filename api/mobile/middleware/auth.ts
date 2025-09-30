import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from './errorHandler';

// Interface para estender o Request com informações do usuário
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
    isActive: boolean;
    emailVerified: boolean;
  };
}

// Configurações JWT
const JWT_SECRET = process.env.JWT_SECRET || 'petshop_mobile_secret_key_2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'petshop_mobile_refresh_secret_key_2024';

// Dados mockados de usuários (em produção, isso viria do banco de dados)
const USERS = [
  {
    id: '1',
    email: 'user@petshop.com',
    name: 'Usuário Teste',
    role: 'customer',
    permissions: ['read', 'write'],
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: '2',
    email: 'admin@petshop.com',
    name: 'Administrador',
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin'],
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: '3',
    email: 'moderator@petshop.com',
    name: 'Moderador',
    role: 'moderator',
    permissions: ['read', 'write', 'moderate'],
    isActive: true,
    emailVerified: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  }
];

// Middleware principal de autenticação
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AuthenticationError('Token de acesso obrigatório');
    }

    // Verificar formato do token (Bearer <token>)
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      throw new AuthenticationError('Formato de token inválido. Use: Bearer <token>');
    }

    const token = tokenParts[1];

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Buscar usuário pelos dados do token
    const user = USERS.find(u => u.id === decoded.userId && u.isActive);

    if (!user) {
      throw new AuthenticationError('Usuário não encontrado ou inativo');
    }

    // Verificar se o email foi verificado (opcional, dependendo da regra de negócio)
    if (!user.emailVerified) {
      throw new AuthenticationError('Email não verificado');
    }

    // Adicionar informações do usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
      emailVerified: user.emailVerified
    };

    // Atualizar último login (em produção, isso seria feito de forma assíncrona)
    user.lastLogin = new Date();

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Token inválido'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expirado'));
    } else if (error instanceof AuthenticationError) {
      next(error);
    } else {
      console.error('Erro na autenticação:', error);
      next(new AuthenticationError('Erro na validação do token'));
    }
  }
};

// Middleware de autenticação opcional (não falha se não houver token)
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // Sem token, continua sem usuário autenticado
      next();
      return;
    }

    // Se há token, tenta autenticar
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      // Token mal formatado, continua sem usuário
      next();
      return;
    }

    const token = tokenParts[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = USERS.find(u => u.id === decoded.userId && u.isActive);

    if (user && user.emailVerified) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive,
        emailVerified: user.emailVerified
      };
      
      user.lastLogin = new Date();
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem usuário autenticado
    next();
  }
};

// Middleware para verificar permissões específicas
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError('Autenticação obrigatória'));
      return;
    }

    if (!req.user.permissions.includes(permission)) {
      next(new AuthorizationError(`Permissão '${permission}' obrigatória`));
      return;
    }

    next();
  };
};

// Middleware para verificar role específica
export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError('Autenticação obrigatória'));
      return;
    }

    if (req.user.role !== role) {
      next(new AuthorizationError(`Role '${role}' obrigatória`));
      return;
    }

    next();
  };
};

// Middleware para verificar se o usuário é admin
export const requireAdmin = requireRole('admin');

// Middleware para verificar se o usuário é moderador ou admin
export const requireModerator = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(new AuthenticationError('Autenticação obrigatória'));
    return;
  }

  if (!['admin', 'moderator'].includes(req.user.role)) {
    next(new AuthorizationError('Permissão de moderador ou administrador obrigatória'));
    return;
  }

  next();
};

// Middleware para verificar se o usuário pode acessar recurso próprio ou é admin
export const requireOwnershipOrAdmin = (userIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError('Autenticação obrigatória'));
      return;
    }

    const resourceUserId = req.params[userIdParam] || req.body.userId || req.query.userId;
    
    // Admin pode acessar qualquer recurso
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Usuário só pode acessar seus próprios recursos
    if (req.user.id !== resourceUserId) {
      next(new AuthorizationError('Acesso negado: você só pode acessar seus próprios recursos'));
      return;
    }

    next();
  };
};

// Função utilitária para gerar tokens JWT
export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' } // Token de acesso expira em 15 minutos
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Refresh token expira em 7 dias
  );

  return { accessToken, refreshToken };
};

// Função para verificar refresh token
export const verifyRefreshToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    
    if (decoded.type !== 'refresh') {
      return null;
    }

    return { userId: decoded.userId };
  } catch (error) {
    return null;
  }
};

// Função para obter informações do usuário atual
export const getCurrentUser = (req: AuthenticatedRequest) => {
  return req.user || null;
};

// Função para verificar se o usuário tem uma permissão específica
export const hasPermission = (req: AuthenticatedRequest, permission: string): boolean => {
  return req.user?.permissions.includes(permission) || false;
};

// Função para verificar se o usuário tem uma role específica
export const hasRole = (req: AuthenticatedRequest, role: string): boolean => {
  return req.user?.role === role || false;
};

// Função para verificar se o usuário é admin
export const isAdmin = (req: AuthenticatedRequest): boolean => {
  return hasRole(req, 'admin');
};

// Função para verificar se o usuário é moderador ou admin
export const isModerator = (req: AuthenticatedRequest): boolean => {
  return req.user ? ['admin', 'moderator'].includes(req.user.role) : false;
};

// Middleware para log de ações autenticadas
export const logAuthenticatedAction = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user) {
    console.log(`Ação autenticada: ${req.method} ${req.path} por usuário ${req.user.id} (${req.user.email})`);
  }
  next();
};

// Exportar tipos para uso em outros arquivos
export type UserRole = 'customer' | 'admin' | 'moderator';
export type UserPermission = 'read' | 'write' | 'delete' | 'admin' | 'moderate';

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: UserPermission[];
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
}