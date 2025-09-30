import { Request, Response, NextFunction } from 'express';

interface LogData {
  method: string;
  url: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip: string;
  userId?: string;
  timestamp: string;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Capturar dados da requisição
  const logData: LogData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent'),
    timestamp,
    ...(req.body && Object.keys(req.body).length > 0 && { body: sanitizeBody(req.body) }),
    ...(req.query && Object.keys(req.query).length > 0 && { query: req.query }),
    ...(req.params && Object.keys(req.params).length > 0 && { params: req.params })
  };

  // Adicionar userId se disponível
  if ((req as Record<string, unknown>).user && typeof (req as Record<string, unknown>).user === 'object') {
    const user = (req as Record<string, unknown>).user as Record<string, unknown>;
    if (user.id) {
      logData.userId = user.id as string;
    }
  }

  // Log da requisição
  console.log('📱 Mobile API Request:', {
    method: logData.method,
    url: logData.url,
    ip: logData.ip,
    userId: logData.userId,
    timestamp: logData.timestamp
  });

  // Interceptar a resposta
  const originalSend = res.send;
  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    
    // Log da resposta
    console.log('📱 Mobile API Response:', {
      method: logData.method,
      url: logData.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: logData.ip,
      userId: logData.userId,
      timestamp: new Date().toISOString()
    });

    // Log detalhado para erros
    if (res.statusCode >= 400) {
      console.error('📱 Mobile API Error Response:', {
        ...logData,
        statusCode: res.statusCode,
        responseTime,
        responseBody: body ? JSON.parse(body) : null
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

// Sanitizar dados sensíveis do body
const sanitizeBody = (body: Record<string, unknown>): Record<string, unknown> => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = [
    'password',
    'confirmPassword',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secret',
    'creditCard',
    'cardNumber',
    'cvv',
    'pin'
  ];

  const sanitized = { ...body };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
};

export const performanceLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    if (duration > 1000) { // Log slow requests (> 1s)
      console.warn('🐌 Slow Mobile API Request:', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  next();
};

export const errorLogger = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('📱 Mobile API Error:', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    body: sanitizeBody(req.body),
    query: req.query,
    params: req.params,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as Record<string, unknown>).user && typeof (req as Record<string, unknown>).user === 'object' 
      ? ((req as Record<string, unknown>).user as Record<string, unknown>).id as string 
      : undefined,
    timestamp: new Date().toISOString()
  });
  
  next(error);
};