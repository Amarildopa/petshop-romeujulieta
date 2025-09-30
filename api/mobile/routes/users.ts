import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { 
  User, 
  UserPreferences, 
  Address, 
  UpdateUserData, 
  ChangePasswordData
} from '../types/user';
import { createError } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Dados mockados
const mockUsers: Map<string, User> = new Map([
  ['1', {
    id: '1',
    email: 'usuario@exemplo.com',
    name: 'João Silva',
    phone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    birthDate: new Date('1990-05-15'),
    gender: 'male',
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      marketing: {
        email: false,
        push: true,
        sms: false
      },
      language: 'pt-BR',
      currency: 'BRL',
      theme: 'light'
    },
    addresses: [
      {
        id: '1',
        userId: '1',
        type: 'home',
        name: 'Casa',
        street: 'Rua das Flores, 123',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        country: 'Brasil',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }]
]);

// Obter perfil do usuário
router.get('/profile', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const user = mockUsers.get(userId);

    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Remover dados sensíveis
    const { password, ...userProfile } = user as any;

    res.json({
      data: userProfile
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar perfil do usuário
router.put('/profile', [
  body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('phone').optional().matches(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/).withMessage('Formato de telefone inválido'),
  body('cpf').optional().matches(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/).withMessage('Formato de CPF inválido'),
  body('birthDate').optional().isISO8601().withMessage('Data de nascimento inválida'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gênero inválido')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const updateData: UpdateUserData = req.body;

    const user = mockUsers.get(userId);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Verificar se CPF já está em uso por outro usuário
    if (updateData.cpf) {
      const existingUser = Array.from(mockUsers.values()).find(
        u => u.cpf === updateData.cpf && u.id !== userId
      );
      if (existingUser) {
        throw createError('CPF já está em uso', 400, 'CPF_ALREADY_EXISTS');
      }
    }

    // Atualizar dados
    Object.assign(user, {
      ...updateData,
      birthDate: updateData.birthDate ? new Date(updateData.birthDate) : user.birthDate,
      updatedAt: new Date()
    });

    mockUsers.set(userId, user);

    // Remover dados sensíveis
    const { password, ...userProfile } = user as any;

    res.json({
      message: 'Perfil atualizado com sucesso',
      data: userProfile
    });
  } catch (error) {
    next(error);
  }
});

// Alterar senha
router.put('/password', [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Confirmação de senha não confere');
    }
    return true;
  })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { currentPassword, newPassword }: ChangePasswordData = req.body;

    const user = mockUsers.get(userId);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Verificar senha atual (simulado)
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, 'hashed_password');
    if (!isCurrentPasswordValid) {
      throw createError('Senha atual incorreta', 400, 'INVALID_CURRENT_PASSWORD');
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Atualizar senha (em um sistema real, seria salva no banco)
    user.updatedAt = new Date();

    res.json({
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Obter preferências do usuário
router.get('/preferences', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const user = mockUsers.get(userId);

    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    res.json({
      data: user.preferences
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar preferências do usuário
router.put('/preferences', [
  body('notifications.email').optional().isBoolean(),
  body('notifications.push').optional().isBoolean(),
  body('notifications.sms').optional().isBoolean(),
  body('marketing.email').optional().isBoolean(),
  body('marketing.push').optional().isBoolean(),
  body('marketing.sms').optional().isBoolean(),
  body('language').optional().isIn(['pt-BR', 'en-US', 'es-ES']),
  body('currency').optional().isIn(['BRL', 'USD', 'EUR']),
  body('theme').optional().isIn(['light', 'dark', 'auto'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const preferencesData: Partial<UserPreferences> = req.body;

    const user = mockUsers.get(userId);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Atualizar preferências
    user.preferences = {
      ...user.preferences,
      ...preferencesData,
      notifications: {
        ...user.preferences.notifications,
        ...preferencesData.notifications
      },
      marketing: {
        ...user.preferences.marketing,
        ...preferencesData.marketing
      }
    };
    user.updatedAt = new Date();

    mockUsers.set(userId, user);

    res.json({
      message: 'Preferências atualizadas com sucesso',
      data: user.preferences
    });
  } catch (error) {
    next(error);
  }
});

// Listar endereços do usuário
router.get('/addresses', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const user = mockUsers.get(userId);

    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    res.json({
      data: user.addresses || []
    });
  } catch (error) {
    next(error);
  }
});

// Adicionar novo endereço
router.post('/addresses', [
  body('type').isIn(['home', 'work', 'other']).withMessage('Tipo de endereço inválido'),
  body('name').notEmpty().withMessage('Nome do endereço é obrigatório'),
  body('street').notEmpty().withMessage('Rua é obrigatória'),
  body('number').notEmpty().withMessage('Número é obrigatório'),
  body('neighborhood').notEmpty().withMessage('Bairro é obrigatório'),
  body('city').notEmpty().withMessage('Cidade é obrigatória'),
  body('state').isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
  body('zipCode').matches(/^[0-9]{5}-[0-9]{3}$/).withMessage('Formato de CEP inválido'),
  body('country').optional().isString(),
  body('isDefault').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const addressData = req.body;

    const user = mockUsers.get(userId);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Se for endereço padrão, remover flag dos outros
    if (addressData.isDefault) {
      user.addresses = user.addresses.map(addr => ({ ...addr, isDefault: false }));
    }

    // Criar novo endereço
    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      userId,
      ...addressData,
      country: addressData.country || 'Brasil',
      isDefault: addressData.isDefault || user.addresses.length === 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    user.addresses.push(newAddress);
    user.updatedAt = new Date();
    mockUsers.set(userId, user);

    res.status(201).json({
      message: 'Endereço adicionado com sucesso',
      data: newAddress
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar endereço
router.put('/addresses/:addressId', [
  param('addressId').notEmpty().withMessage('ID do endereço é obrigatório'),
  body('type').optional().isIn(['home', 'work', 'other']),
  body('name').optional().notEmpty(),
  body('street').optional().notEmpty(),
  body('number').optional().notEmpty(),
  body('neighborhood').optional().notEmpty(),
  body('city').optional().notEmpty(),
  body('state').optional().isLength({ min: 2, max: 2 }),
  body('zipCode').optional().matches(/^[0-9]{5}-[0-9]{3}$/),
  body('isDefault').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { addressId } = req.params;
    const updateData = req.body;

    const user = mockUsers.get(userId);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
    if (addressIndex === -1) {
      throw createError('Endereço não encontrado', 404, 'ADDRESS_NOT_FOUND');
    }

    // Se for endereço padrão, remover flag dos outros
    if (updateData.isDefault) {
      user.addresses = user.addresses.map(addr => ({ ...addr, isDefault: false }));
    }

    // Atualizar endereço
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      ...updateData,
      updatedAt: new Date()
    };

    user.updatedAt = new Date();
    mockUsers.set(userId, user);

    res.json({
      message: 'Endereço atualizado com sucesso',
      data: user.addresses[addressIndex]
    });
  } catch (error) {
    next(error);
  }
});

// Remover endereço
router.delete('/addresses/:addressId', [
  param('addressId').notEmpty().withMessage('ID do endereço é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { addressId } = req.params;

    const user = mockUsers.get(userId);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
    if (addressIndex === -1) {
      throw createError('Endereço não encontrado', 404, 'ADDRESS_NOT_FOUND');
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // Se era o endereço padrão e ainda há outros, definir o primeiro como padrão
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    user.updatedAt = new Date();
    mockUsers.set(userId, user);

    res.json({
      message: 'Endereço removido com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Definir endereço como padrão
router.post('/addresses/:addressId/set-default', [
  param('addressId').notEmpty().withMessage('ID do endereço é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { addressId } = req.params;

    const user = mockUsers.get(userId);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
    if (addressIndex === -1) {
      throw createError('Endereço não encontrado', 404, 'ADDRESS_NOT_FOUND');
    }

    // Remover flag padrão de todos os endereços
    user.addresses = user.addresses.map(addr => ({ ...addr, isDefault: false }));
    
    // Definir o endereço selecionado como padrão
    user.addresses[addressIndex].isDefault = true;
    user.addresses[addressIndex].updatedAt = new Date();
    
    user.updatedAt = new Date();
    mockUsers.set(userId, user);

    res.json({
      message: 'Endereço definido como padrão',
      data: user.addresses[addressIndex]
    });
  } catch (error) {
    next(error);
  }
});

// Desativar conta
router.post('/deactivate', [
  body('reason').optional().isString().withMessage('Motivo deve ser uma string'),
  body('password').notEmpty().withMessage('Senha é obrigatória para desativar a conta')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = (req as any).user.id;
    const { reason, password } = req.body;

    const user = mockUsers.get(userId);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Verificar senha (simulado)
    const isPasswordValid = await bcrypt.compare(password, 'hashed_password');
    if (!isPasswordValid) {
      throw createError('Senha incorreta', 400, 'INVALID_PASSWORD');
    }

    // Desativar conta
    user.isActive = false;
    user.deactivatedAt = new Date();
    user.deactivationReason = reason;
    user.updatedAt = new Date();

    mockUsers.set(userId, user);

    res.json({
      message: 'Conta desativada com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };