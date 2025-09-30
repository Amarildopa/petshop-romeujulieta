import express from 'express';
import { body, query, param } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { handleValidationErrors, successResponse, NotFoundError } from '../middleware/errorHandler';

const router = express.Router();

// Interface para notificações
interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'reminder' | 'delivery';
  isRead: boolean;
  data?: any;
  createdAt: Date;
  readAt?: Date;
}

// Dados mockados
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Pedido Confirmado',
    message: 'Seu pedido foi confirmado e está sendo preparado.',
    type: 'order',
    isRead: false,
    data: { orderId: '12345' },
    createdAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: '2',
    userId: '1',
    title: 'Promoção Especial',
    message: 'Desconto de 20% em todos os produtos para cães!',
    type: 'promotion',
    isRead: true,
    data: { discount: 20 },
    createdAt: new Date('2024-01-14T15:00:00Z'),
    readAt: new Date('2024-01-14T16:00:00Z')
  }
];

// Listar notificações do usuário
router.get('/',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100')
  ],
  handleValidationErrors,
  (req: any, res) => {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const userNotifications = mockNotifications.filter(n => n.userId === userId);
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedNotifications = userNotifications.slice(startIndex, endIndex);

    successResponse(res, paginatedNotifications, 'Notificações obtidas com sucesso');
  }
);

// Marcar notificação como lida
router.patch('/:id/read',
  authMiddleware,
  [
    param('id').notEmpty().withMessage('ID da notificação é obrigatório')
  ],
  handleValidationErrors,
  (req: any, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = mockNotifications.find(n => n.id === id && n.userId === userId);
    if (!notification) {
      throw new NotFoundError('Notificação não encontrada');
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
    }

    successResponse(res, notification, 'Notificação marcada como lida');
  }
);

export const notificationRoutes = router;
export default router;