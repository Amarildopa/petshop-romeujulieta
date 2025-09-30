import { Request, Response, NextFunction } from 'express';
import { ValidationError, validationResult } from 'express-validator';

// Interface para erros customizados
export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
  isOperational?: boolean;
  errorCode?: string;
}

// Classe para erros de API
export class ApiError extends Error implements CustomError {
  statusCode: number;
  isOperational: boolean;
  details: unknown;
  errorCode: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    this.errorCode = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Erros específicos da aplicação
export class ValidationApiError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Autenticação obrigatória') {
    super(message, 401, 'AUTHENTICATION_REQUIRED');
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403, 'ACCESS_DENIED');
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404, 'RESOURCE_NOT_FOUND');
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Conflito de dados') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Limite de requisições excedido') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Erro interno do servidor') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

// Middleware para tratar erros de validação do express-validator
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error: ValidationError) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
      location: error.type === 'field' ? error.location : undefined
    }));

    const validationError = new ValidationApiError(
      'Dados de entrada inválidos',
      formattedErrors
    );

    next(validationError);
    return;
  }

  next();
};

// Middleware principal de tratamento de erros
export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Log do erro
  console.error('Erro capturado pelo errorHandler:', {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    code: error.code,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Determinar status code e código de erro
  let statusCode = error.statusCode || 500;
  let errorCode = error.code || 'INTERNAL_SERVER_ERROR';
  let message = error.message || 'Erro interno do servidor';
  let details = error.details;

  // Tratar diferentes tipos de erro
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Dados de entrada inválidos';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID_FORMAT';
    message = 'Formato de ID inválido';
  } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    statusCode = 500;
    errorCode = 'DATABASE_ERROR';
    message = 'Erro de banco de dados';
    details = undefined; // Não expor detalhes do banco
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Token inválido';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Token expirado';
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    errorCode = 'FILE_UPLOAD_ERROR';
    message = 'Erro no upload de arquivo';
    
    // Tratar erros específicos do Multer
    if (error.message.includes('File too large')) {
      message = 'Arquivo muito grande';
      errorCode = 'FILE_TOO_LARGE';
    } else if (error.message.includes('Unexpected field')) {
      message = 'Campo de arquivo inesperado';
      errorCode = 'UNEXPECTED_FILE_FIELD';
    }
  }

  // Resposta de erro padronizada
  const errorResponse: Record<string, unknown> = {
    error: message,
    code: errorCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Adicionar detalhes apenas em desenvolvimento ou para erros operacionais
  if (process.env.NODE_ENV === 'development' || error.isOperational) {
    if (details) {
      errorResponse.details = details;
    }
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }
  }

  // Adicionar ID de rastreamento para erros 500
  if (statusCode >= 500) {
    errorResponse.traceId = generateTraceId();
  }

  res.status(statusCode).json(errorResponse);
};

// Middleware para capturar rotas não encontradas
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(
    `Endpoint ${req.method} ${req.path} não encontrado`
  );
  next(error);
};

// Middleware para capturar erros assíncronos
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Função para gerar ID de rastreamento
function generateTraceId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Função utilitária para criar respostas de sucesso padronizadas
export const successResponse = (
  res: Response,
  data: unknown,
  message?: string,
  statusCode: number = 200,
  pagination?: unknown
): void => {
  const response: Record<string, unknown> = {
    data,
    timestamp: new Date().toISOString()
  };

  if (message) {
    response.message = message;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  res.status(statusCode).json(response);
};

// Função utilitária para criar respostas de erro padronizadas
export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: unknown
): void => {
  const response: Record<string, unknown> = {
    error: message,
    code: code || 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  };

  if (details) {
    response.details = details;
  }

  if (statusCode >= 500) {
    response.traceId = generateTraceId();
  }

  res.status(statusCode).json(response);
};

// Middleware para log de requisições com erro
export const logErrorRequests = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log detalhado para análise
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      name: error.name,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack
    },
    request: {
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      params: req.params,
      headers: {
        'user-agent': req.get('User-Agent'),
        'content-type': req.get('Content-Type'),
        'authorization': req.get('Authorization') ? '[REDACTED]' : undefined,
        'x-api-key': req.get('X-API-Key') ? '[REDACTED]' : undefined
      },
      ip: req.ip,
      body: sanitizeRequestBody(req.body)
    }
  };

  console.error('Request Error Log:', JSON.stringify(errorLog, null, 2));
  next(error);
};

// Função para sanitizar dados sensíveis do body da requisição
function sanitizeRequestBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = [
    'password',
    'confirmPassword',
    'currentPassword',
    'newPassword',
    'token',
    'refreshToken',
    'accessToken',
    'apiKey',
    'secret',
    'creditCard',
    'cardNumber',
    'cvv',
    'securityCode'
  ];

  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

// Função utilitária para criar erros customizados
export const createError = (
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_SERVER_ERROR',
  details?: unknown
): ApiError => {
  return new ApiError(message, statusCode, code, details);
};

// Classes de erro já exportadas individualmente acima