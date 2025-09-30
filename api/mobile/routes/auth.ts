import express, { Request } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { 
  LoginData, 
  CreateUserData, 
  AuthResponse, 
  RefreshTokenData,
  ChangePasswordData,
  ResetPasswordData,
  VerifyResetTokenData,
  SocialLoginData,
  User
} from '../types/user';
import { createError } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mobile-api-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

// Dados mockados para demonstração
const mockUsers: User[] = [
  {
    id: '1',
    email: 'user@petshop.com',
    name: 'João Silva',
    phone: '(11) 99999-9999',
    avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20of%20a%20man%20with%20friendly%20smile&image_size=square',
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    loyaltyPoints: 150,
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: true
      },
      language: 'pt-BR',
      currency: 'BRL',
      theme: 'light'
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  }
];

const mockPasswords = new Map([
  ['user@petshop.com', '$2a$10$rOzJqKwjyKhVzwK8nKhVzOzJqKwjyKhVzwK8nKhVzOzJqKwjyKhVz'] // password: 123456
]);

// Registro
router.post('/register', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('phone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { email, password, name, phone, dateOfBirth, gender }: CreateUserData = req.body;

    // Verificar se usuário já existe
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw createError('Email já está em uso', 409, 'EMAIL_ALREADY_EXISTS');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar novo usuário
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      email,
      name,
      phone,
      dateOfBirth,
      gender,
      isActive: true,
      isEmailVerified: false,
      isPhoneVerified: false,
      loyaltyPoints: 0,
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: false
        },
        language: 'pt-BR',
        currency: 'BRL',
        theme: 'light'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockUsers.push(newUser);
    mockPasswords.set(email, hashedPassword);

    // Gerar tokens
    const accessToken = jwt.sign(
      { userId: newUser.id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: newUser.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    const response: AuthResponse = {
      user: newUser,
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60 // 7 dias em segundos
    };

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      data: response
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { email, password, deviceInfo }: LoginData = req.body;

    // Buscar usuário
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw createError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw createError('Conta desativada', 401, 'ACCOUNT_DISABLED');
    }

    // Verificar senha
    const hashedPassword = mockPasswords.get(email);
    if (!hashedPassword || !await bcrypt.compare(password, hashedPassword)) {
      throw createError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    // Gerar tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    const response: AuthResponse = {
      user,
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60
    };

    res.json({
      message: 'Login realizado com sucesso',
      data: response
    });
  } catch (error) {
    next(error);
  }
});

// Refresh Token
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { refreshToken }: RefreshTokenData = req.body;

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as Record<string, unknown>;
    
    if (decoded.type !== 'refresh') {
      throw createError('Token inválido', 401, 'INVALID_TOKEN');
    }

    // Buscar usuário
    const user = mockUsers.find(u => u.id === decoded.userId);
    if (!user || !user.isActive) {
      throw createError('Usuário não encontrado ou inativo', 401, 'USER_NOT_FOUND');
    }

    // Gerar novo access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Token renovado com sucesso',
      data: {
        accessToken,
        expiresIn: 7 * 24 * 60 * 60
      }
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authMiddleware, async (req: Request, res, next) => {
  try {
    // Em uma implementação real, você invalidaria o token no banco de dados
    res.json({
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Alterar senha
router.post('/change-password', authMiddleware, async (req: Request, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { currentPassword, newPassword }: ChangePasswordData = req.body;
    const user = req.user;

    // Verificar senha atual
    const hashedPassword = mockPasswords.get(user.email);
    if (!hashedPassword || !await bcrypt.compare(currentPassword, hashedPassword)) {
      throw createError('Senha atual incorreta', 400, 'INVALID_CURRENT_PASSWORD');
    }

    // Hash da nova senha
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    mockPasswords.set(user.email, newHashedPassword);

    res.json({
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Solicitar reset de senha
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Email inválido')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { email }: ResetPasswordData = req.body;

    // Verificar se usuário existe
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      // Por segurança, sempre retorna sucesso mesmo se o email não existir
      res.json({
        message: 'Se o email existir, você receberá instruções para redefinir sua senha'
      });
      return;
    }

    // Em uma implementação real, você enviaria um email com o token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Se o email existir, você receberá instruções para redefinir sua senha',
      // Em produção, remova esta linha - apenas para demonstração
      resetToken
    });
  } catch (error) {
    next(error);
  }
});

// Verificar perfil
router.get('/me', authMiddleware, async (req: Request, res, next) => {
  try {
    const user = req.user;
    res.json({
      data: user
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };