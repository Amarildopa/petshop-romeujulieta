import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { createError } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';
import { Address } from '../types/user';

const router = express.Router();

// Aplicar middleware de autenticação
router.use(authMiddleware);

// Interface para validação de CEP
interface CepInfo {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

// Dados mockados para endereços
const mockAddresses: Map<string, Address[]> = new Map();

// Inicializar dados mockados
const initMockData = () => {
  const userId = '1';
  const addresses: Address[] = [
    {
      id: '1',
      userId,
      type: 'home',
      label: 'Casa',
      recipientName: 'João Silva',
      recipientPhone: '(11) 99999-9999',
      street: 'Rua das Flores, 123',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Jardim das Rosas',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil',
      isDefault: true,
      coordinates: {
        latitude: -23.5505,
        longitude: -46.6333
      },
      deliveryInstructions: 'Portão azul, interfone 45',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      userId,
      type: 'work',
      label: 'Trabalho',
      recipientName: 'João Silva',
      recipientPhone: '(11) 88888-8888',
      street: 'Av. Paulista, 1000',
      number: '1000',
      complement: 'Sala 1205',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      country: 'Brasil',
      isDefault: false,
      coordinates: {
        latitude: -23.5618,
        longitude: -46.6565
      },
      deliveryInstructions: 'Recepção do 12º andar',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      userId,
      type: 'other',
      label: 'Casa da Mãe',
      recipientName: 'Maria Silva',
      recipientPhone: '(11) 77777-7777',
      street: 'Rua dos Lírios, 456',
      number: '456',
      complement: '',
      neighborhood: 'Vila Madalena',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05433-000',
      country: 'Brasil',
      isDefault: false,
      coordinates: {
        latitude: -23.5440,
        longitude: -46.6929
      },
      deliveryInstructions: 'Casa com portão verde',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  mockAddresses.set(userId, addresses);
};

// Inicializar dados mockados
initMockData();

// Função para simular consulta de CEP
const getCepInfo = async (cep: string): Promise<CepInfo | null> => {
  // Simular dados de CEP
  const mockCepData: { [key: string]: CepInfo } = {
    '01234567': {
      cep: '01234-567',
      logradouro: 'Rua das Flores',
      complemento: '',
      bairro: 'Jardim das Rosas',
      localidade: 'São Paulo',
      uf: 'SP',
      ibge: '3550308',
      gia: '1004',
      ddd: '11',
      siafi: '7107'
    },
    '01310100': {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      complemento: '',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
      ibge: '3550308',
      gia: '1004',
      ddd: '11',
      siafi: '7107'
    },
    '05433000': {
      cep: '05433-000',
      logradouro: 'Rua dos Lírios',
      complemento: '',
      bairro: 'Vila Madalena',
      localidade: 'São Paulo',
      uf: 'SP',
      ibge: '3550308',
      gia: '1004',
      ddd: '11',
      siafi: '7107'
    }
  };

  const cleanCep = cep.replace(/\D/g, '');
  return mockCepData[cleanCep] || null;
};

// Listar endereços do usuário
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user?.id as string;
    const userAddresses = mockAddresses.get(userId) || [];

    // Ordenar por padrão primeiro, depois por data de criação
    const sortedAddresses = userAddresses.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    res.json({
      data: sortedAddresses
    });
  } catch (error) {
    next(error);
  }
});

// Obter endereço por ID
router.get('/:addressId', [
  param('addressId').notEmpty().withMessage('ID do endereço é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = req.user?.id as string;
    const { addressId } = req.params;

    const userAddresses = mockAddresses.get(userId) || [];
    const address = userAddresses.find(addr => addr.id === addressId);

    if (!address) {
      throw createError('Endereço não encontrado', 404, 'ADDRESS_NOT_FOUND');
    }

    res.json({
      data: address
    });
  } catch (error) {
    next(error);
  }
});

// Consultar CEP
router.get('/cep/:cep', [
  param('cep').matches(/^\d{5}-?\d{3}$/).withMessage('CEP inválido')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('CEP inválido', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { cep } = req.params;
    const cepInfo = await getCepInfo(cep);

    if (!cepInfo) {
      throw createError('CEP não encontrado', 404, 'CEP_NOT_FOUND');
    }

    res.json({
      data: cepInfo
    });
  } catch (error) {
    next(error);
  }
});

// Adicionar novo endereço
router.post('/', [
  body('type').isIn(['home', 'work', 'other']).withMessage('Tipo de endereço inválido'),
  body('label').notEmpty().withMessage('Rótulo é obrigatório'),
  body('recipientName').notEmpty().withMessage('Nome do destinatário é obrigatório'),
  body('recipientPhone').matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).withMessage('Telefone inválido'),
  body('street').notEmpty().withMessage('Logradouro é obrigatório'),
  body('number').notEmpty().withMessage('Número é obrigatório'),
  body('neighborhood').notEmpty().withMessage('Bairro é obrigatório'),
  body('city').notEmpty().withMessage('Cidade é obrigatória'),
  body('state').isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
  body('zipCode').matches(/^\d{5}-\d{3}$/).withMessage('CEP inválido'),
  body('country').notEmpty().withMessage('País é obrigatório'),
  body('coordinates.latitude').optional().isFloat({ min: -90, max: 90 }),
  body('coordinates.longitude').optional().isFloat({ min: -180, max: 180 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = req.user?.id as string;
    const addressData = req.body;

    let userAddresses = mockAddresses.get(userId) || [];

    // Verificar se já existe um endereço padrão
    const hasDefault = userAddresses.some(addr => addr.isDefault);
    
    // Se não há endereço padrão ou se foi especificado como padrão
    const isDefault = !hasDefault || addressData.isDefault;
    
    // Se este será o padrão, remover padrão dos outros
    if (isDefault) {
      userAddresses = userAddresses.map(addr => ({ ...addr, isDefault: false }));
    }

    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      userId,
      type: addressData.type,
      label: addressData.label,
      recipientName: addressData.recipientName,
      recipientPhone: addressData.recipientPhone,
      street: addressData.street,
      number: addressData.number,
      complement: addressData.complement || '',
      neighborhood: addressData.neighborhood,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      country: addressData.country,
      isDefault,
      coordinates: addressData.coordinates,
      deliveryInstructions: addressData.deliveryInstructions || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    userAddresses.push(newAddress);
    mockAddresses.set(userId, userAddresses);

    res.status(201).json({
      message: 'Endereço adicionado com sucesso',
      data: newAddress
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar endereço
router.put('/:addressId', [
  param('addressId').notEmpty().withMessage('ID do endereço é obrigatório'),
  body('type').optional().isIn(['home', 'work', 'other']).withMessage('Tipo de endereço inválido'),
  body('label').optional().notEmpty().withMessage('Rótulo não pode estar vazio'),
  body('recipientName').optional().notEmpty().withMessage('Nome do destinatário não pode estar vazio'),
  body('recipientPhone').optional().matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).withMessage('Telefone inválido'),
  body('street').optional().notEmpty().withMessage('Logradouro não pode estar vazio'),
  body('number').optional().notEmpty().withMessage('Número não pode estar vazio'),
  body('neighborhood').optional().notEmpty().withMessage('Bairro não pode estar vazio'),
  body('city').optional().notEmpty().withMessage('Cidade não pode estar vazia'),
  body('state').optional().isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
  body('zipCode').optional().matches(/^\d{5}-\d{3}$/).withMessage('CEP inválido'),
  body('country').optional().notEmpty().withMessage('País não pode estar vazio'),
  body('coordinates.latitude').optional().isFloat({ min: -90, max: 90 }),
  body('coordinates.longitude').optional().isFloat({ min: -180, max: 180 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Dados inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = req.user?.id as string;
    const { addressId } = req.params;
    const updateData = req.body;

    let userAddresses = mockAddresses.get(userId) || [];
    const addressIndex = userAddresses.findIndex(addr => addr.id === addressId);

    if (addressIndex === -1) {
      throw createError('Endereço não encontrado', 404, 'ADDRESS_NOT_FOUND');
    }

    const currentAddress = userAddresses[addressIndex];

    // Se está definindo como padrão, remover padrão dos outros
    if (updateData.isDefault && !currentAddress.isDefault) {
      userAddresses = userAddresses.map(addr => 
        addr.id === addressId ? addr : { ...addr, isDefault: false }
      );
    }

    // Atualizar endereço
    const updatedAddress: Address = {
      ...currentAddress,
      ...updateData,
      updatedAt: new Date()
    };

    userAddresses[addressIndex] = updatedAddress;
    mockAddresses.set(userId, userAddresses);

    res.json({
      message: 'Endereço atualizado com sucesso',
      data: updatedAddress
    });
  } catch (error) {
    next(error);
  }
});

// Definir endereço como padrão
router.put('/:addressId/set-default', [
  param('addressId').notEmpty().withMessage('ID do endereço é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = req.user?.id as string;
    const { addressId } = req.params;

    let userAddresses = mockAddresses.get(userId) || [];
    const addressIndex = userAddresses.findIndex(addr => addr.id === addressId);

    if (addressIndex === -1) {
      throw createError('Endereço não encontrado', 404, 'ADDRESS_NOT_FOUND');
    }

    // Remover padrão de todos os endereços e definir o selecionado como padrão
    userAddresses = userAddresses.map((addr, index) => ({
      ...addr,
      isDefault: index === addressIndex,
      updatedAt: index === addressIndex ? new Date() : addr.updatedAt
    }));

    mockAddresses.set(userId, userAddresses);

    res.json({
      message: 'Endereço definido como padrão',
      data: userAddresses[addressIndex]
    });
  } catch (error) {
    next(error);
  }
});

// Remover endereço
router.delete('/:addressId', [
  param('addressId').notEmpty().withMessage('ID do endereço é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = req.user?.id as string;
    const { addressId } = req.params;

    const userAddresses = mockAddresses.get(userId) || [];
    const addressIndex = userAddresses.findIndex(addr => addr.id === addressId);

    if (addressIndex === -1) {
      throw createError('Endereço não encontrado', 404, 'ADDRESS_NOT_FOUND');
    }

    const addressToRemove = userAddresses[addressIndex];
    
    // Verificar se é o único endereço
    if (userAddresses.length === 1) {
      throw createError('Não é possível remover o único endereço', 400, 'CANNOT_REMOVE_ONLY_ADDRESS');
    }

    // Remover endereço
    userAddresses.splice(addressIndex, 1);

    // Se o endereço removido era o padrão, definir o primeiro como padrão
    if (addressToRemove.isDefault && userAddresses.length > 0) {
      userAddresses[0].isDefault = true;
      userAddresses[0].updatedAt = new Date();
    }

    mockAddresses.set(userId, userAddresses);

    res.json({
      message: 'Endereço removido com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Validar endereço (verificar se pode ser entregue)
router.post('/:addressId/validate', [
  param('addressId').notEmpty().withMessage('ID do endereço é obrigatório')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError('Parâmetros inválidos', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = req.user?.id as string;
    const { addressId } = req.params;

    const userAddresses = mockAddresses.get(userId) || [];
    const address = userAddresses.find(addr => addr.id === addressId);

    if (!address) {
      throw createError('Endereço não encontrado', 404, 'ADDRESS_NOT_FOUND');
    }

    // Simular validação de entrega
    const deliveryZones = ['01000-000', '01999-999', '05000-000', '05999-999'];
    const addressZone = address.zipCode.substring(0, 5) + '-000';
    
    const canDeliver = deliveryZones.some(zone => {
      const zoneStart = zone.substring(0, 5);
      const addressStart = addressZone.substring(0, 5);
      return addressStart >= zoneStart && addressStart <= zoneStart;
    });

    const estimatedDeliveryTime = canDeliver ? 
      Math.floor(Math.random() * 3) + 1 : // 1-3 dias
      null;

    const deliveryFee = canDeliver ? 
      address.zipCode.startsWith('01') ? 8.90 : 12.90 : // Taxa baseada na região
      null;

    res.json({
      data: {
        canDeliver,
        estimatedDeliveryTime,
        deliveryFee,
        message: canDeliver ? 
          `Entregamos neste endereço em ${estimatedDeliveryTime} dia${estimatedDeliveryTime > 1 ? 's' : ''}` :
          'Infelizmente não entregamos nesta região'
      }
    });
  } catch (error) {
    next(error);
  }
});

export { router as addressRoutes };