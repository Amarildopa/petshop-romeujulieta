interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'agent' | 'bot';
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: string;
  isRead: boolean;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  agentId?: string;
  agentName?: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'billing' | 'product' | 'complaint';
  createdAt: string;
  updatedAt: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  tags: string[];
  rating?: number;
  feedback?: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  department: string;
  activeConversations: number;
  totalConversations: number;
  averageRating: number;
  responseTime: number;
}

interface QuickReply {
  id: string;
  text: string;
  category: string;
}

interface CreateConversationData {
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: Conversation['category'];
  priority: Conversation['priority'];
}

interface ChatStats {
  totalConversations: number;
  activeConversations: number;
  resolvedConversations: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  messagesPerDay: number;
}

class ChatService {
  private mockConversations: Conversation[] = [
    {
      id: 'conv-1',
      userId: 'user-1',
      userName: 'Maria Silva',
      userEmail: 'maria@email.com',
      agentId: 'agent-1',
      agentName: 'João Suporte',
      subject: 'Problema com pedido #12345',
      status: 'in_progress',
      priority: 'high',
      category: 'product',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
      unreadCount: 2,
      tags: ['pedido', 'urgente'],
      rating: 4
    },
    {
      id: 'conv-2',
      userId: 'user-2',
      userName: 'Carlos Santos',
      userEmail: 'carlos@email.com',
      subject: 'Dúvida sobre produto',
      status: 'open',
      priority: 'medium',
      category: 'general',
      createdAt: '2024-01-15T09:15:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      unreadCount: 1,
      tags: ['produto', 'duvida']
    },
    {
      id: 'conv-3',
      userId: 'user-3',
      userName: 'Ana Costa',
      userEmail: 'ana@email.com',
      agentId: 'agent-2',
      agentName: 'Maria Atendimento',
      subject: 'Problema no pagamento',
      status: 'resolved',
      priority: 'urgent',
      category: 'billing',
      createdAt: '2024-01-14T16:20:00Z',
      updatedAt: '2024-01-15T11:45:00Z',
      unreadCount: 0,
      tags: ['pagamento', 'resolvido'],
      rating: 5,
      feedback: 'Excelente atendimento, problema resolvido rapidamente!'
    }
  ];

  private mockMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderName: 'Maria Silva',
      senderType: 'user',
      content: 'Olá, estou com problema no meu pedido #12345. Não recebi ainda.',
      type: 'text',
      timestamp: '2024-01-15T10:00:00Z',
      isRead: true
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'agent-1',
      senderName: 'João Suporte',
      senderType: 'agent',
      content: 'Olá Maria! Vou verificar o status do seu pedido. Pode me informar seu CPF?',
      type: 'text',
      timestamp: '2024-01-15T10:05:00Z',
      isRead: true
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderName: 'Maria Silva',
      senderType: 'user',
      content: '123.456.789-00',
      type: 'text',
      timestamp: '2024-01-15T10:07:00Z',
      isRead: true
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      senderId: 'agent-1',
      senderName: 'João Suporte',
      senderType: 'agent',
      content: 'Encontrei seu pedido! Ele está em trânsito e deve chegar hoje até às 18h. Aqui está o código de rastreamento: BR123456789',
      type: 'text',
      timestamp: '2024-01-15T10:12:00Z',
      isRead: false
    }
  ];

  private mockAgents: Agent[] = [
    {
      id: 'agent-1',
      name: 'João Suporte',
      email: 'joao@petshop.com',
      status: 'online',
      department: 'Atendimento',
      activeConversations: 3,
      totalConversations: 150,
      averageRating: 4.8,
      responseTime: 2
    },
    {
      id: 'agent-2',
      name: 'Maria Atendimento',
      email: 'maria@petshop.com',
      status: 'online',
      department: 'Suporte Técnico',
      activeConversations: 2,
      totalConversations: 200,
      averageRating: 4.9,
      responseTime: 1.5
    },
    {
      id: 'agent-3',
      name: 'Pedro Vendas',
      email: 'pedro@petshop.com',
      status: 'away',
      department: 'Vendas',
      activeConversations: 1,
      totalConversations: 80,
      averageRating: 4.6,
      responseTime: 3
    }
  ];

  private mockQuickReplies: QuickReply[] = [
    { id: 'qr-1', text: 'Obrigado por entrar em contato!', category: 'greeting' },
    { id: 'qr-2', text: 'Como posso ajudá-lo hoje?', category: 'greeting' },
    { id: 'qr-3', text: 'Vou verificar isso para você.', category: 'support' },
    { id: 'qr-4', text: 'Posso ajudá-lo com mais alguma coisa?', category: 'support' },
    { id: 'qr-5', text: 'Obrigado pela sua paciência.', category: 'support' },
    { id: 'qr-6', text: 'Seu pedido está sendo processado.', category: 'orders' },
    { id: 'qr-7', text: 'Vou encaminhar para o setor responsável.', category: 'escalation' },
    { id: 'qr-8', text: 'Problema resolvido! Mais alguma dúvida?', category: 'resolution' }
  ];

  // Conversas
  async getConversations(userId?: string): Promise<Conversation[]> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let conversations = [...this.mockConversations];
    
    if (userId) {
      conversations = conversations.filter(conv => conv.userId === userId);
    }
    
    // Adicionar última mensagem
    conversations = conversations.map(conv => {
      const lastMessage = this.mockMessages
        .filter(msg => msg.conversationId === conv.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      return { ...conv, lastMessage };
    });
    
    return conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const conversation = this.mockConversations.find(conv => conv.id === conversationId);
    if (!conversation) return null;
    
    const lastMessage = this.mockMessages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    return { ...conversation, lastMessage };
  }

  async createConversation(data: CreateConversationData): Promise<Conversation> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      ...data,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadCount: 0,
      tags: []
    };
    
    this.mockConversations.unshift(newConversation);
    return newConversation;
  }

  async updateConversationStatus(conversationId: string, status: Conversation['status']): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const conversationIndex = this.mockConversations.findIndex(conv => conv.id === conversationId);
    if (conversationIndex !== -1) {
      this.mockConversations[conversationIndex] = {
        ...this.mockConversations[conversationIndex],
        status,
        updatedAt: new Date().toISOString()
      };
    }
  }

  async assignAgent(conversationId: string, agentId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const conversationIndex = this.mockConversations.findIndex(conv => conv.id === conversationId);
    const agent = this.mockAgents.find(a => a.id === agentId);
    
    if (conversationIndex !== -1 && agent) {
      this.mockConversations[conversationIndex] = {
        ...this.mockConversations[conversationIndex],
        agentId,
        agentName: agent.name,
        status: 'in_progress',
        updatedAt: new Date().toISOString()
      };
    }
  }

  // Mensagens
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.mockMessages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async sendMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.mockMessages.push(newMessage);
    
    // Atualizar conversa
    const conversationIndex = this.mockConversations.findIndex(conv => conv.id === message.conversationId);
    if (conversationIndex !== -1) {
      this.mockConversations[conversationIndex] = {
        ...this.mockConversations[conversationIndex],
        updatedAt: new Date().toISOString(),
        unreadCount: message.senderType === 'user' ? 
          this.mockConversations[conversationIndex].unreadCount + 1 : 
          this.mockConversations[conversationIndex].unreadCount
      };
    }
    
    return newMessage;
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Marcar mensagens como lidas
    this.mockMessages = this.mockMessages.map(msg => 
      msg.conversationId === conversationId && msg.senderId !== userId
        ? { ...msg, isRead: true }
        : msg
    );
    
    // Zerar contador de não lidas
    const conversationIndex = this.mockConversations.findIndex(conv => conv.id === conversationId);
    if (conversationIndex !== -1) {
      this.mockConversations[conversationIndex] = {
        ...this.mockConversations[conversationIndex],
        unreadCount: 0
      };
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    this.mockMessages = this.mockMessages.filter(msg => msg.id !== messageId);
  }

  // Upload de arquivos
  async uploadFile(file: File): Promise<{ id: string; name: string; url: string; type: string; size: number }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular upload
    const attachment = {
      id: `file-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file), // Em produção, seria a URL do servidor
      type: file.type,
      size: file.size
    };
    
    return attachment;
  }

  // Agentes
  async getAgents(): Promise<Agent[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.mockAgents];
  }

  async getAvailableAgents(): Promise<Agent[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockAgents.filter(agent => 
      agent.status === 'online' && agent.activeConversations < 5
    );
  }

  async updateAgentStatus(agentId: string, status: Agent['status']): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const agentIndex = this.mockAgents.findIndex(agent => agent.id === agentId);
    if (agentIndex !== -1) {
      this.mockAgents[agentIndex] = {
        ...this.mockAgents[agentIndex],
        status
      };
    }
  }

  // Respostas rápidas
  async getQuickReplies(category?: string): Promise<QuickReply[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (category) {
      return this.mockQuickReplies.filter(reply => reply.category === category);
    }
    
    return [...this.mockQuickReplies];
  }

  async createQuickReply(text: string, category: string): Promise<QuickReply> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newReply: QuickReply = {
      id: `qr-${Date.now()}`,
      text,
      category
    };
    
    this.mockQuickReplies.push(newReply);
    return newReply;
  }

  async deleteQuickReply(replyId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.mockQuickReplies.findIndex(reply => reply.id === replyId);
    if (index !== -1) {
      this.mockQuickReplies.splice(index, 1);
    }
  }

  // Avaliações
  async rateConversation(conversationId: string, rating: number, feedback?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const conversationIndex = this.mockConversations.findIndex(conv => conv.id === conversationId);
    if (conversationIndex !== -1) {
      this.mockConversations[conversationIndex] = {
        ...this.mockConversations[conversationIndex],
        rating,
        feedback,
        updatedAt: new Date().toISOString()
      };
    }
  }

  // Estatísticas
  async getChatStats(period: 'day' | 'week' | 'month' = 'day'): Promise<ChatStats> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Dados mockados baseados no período
    const stats: ChatStats = {
      totalConversations: period === 'day' ? 25 : period === 'week' ? 180 : 750,
      activeConversations: 8,
      resolvedConversations: period === 'day' ? 20 : period === 'week' ? 165 : 720,
      averageResponseTime: 2.3, // minutos
      customerSatisfaction: 4.7,
      messagesPerDay: period === 'day' ? 150 : period === 'week' ? 1050 : 4500
    };
    
    return stats;
  }

  // Busca
  async searchConversations(query: string, filters?: {
    status?: Conversation['status'];
    priority?: Conversation['priority'];
    category?: Conversation['category'];
    agentId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Conversation[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let results = [...this.mockConversations];
    
    // Filtro por texto
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(conv => 
        conv.subject.toLowerCase().includes(lowerQuery) ||
        conv.userName.toLowerCase().includes(lowerQuery) ||
        conv.userEmail.toLowerCase().includes(lowerQuery) ||
        conv.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Aplicar filtros
    if (filters) {
      if (filters.status) {
        results = results.filter(conv => conv.status === filters.status);
      }
      if (filters.priority) {
        results = results.filter(conv => conv.priority === filters.priority);
      }
      if (filters.category) {
        results = results.filter(conv => conv.category === filters.category);
      }
      if (filters.agentId) {
        results = results.filter(conv => conv.agentId === filters.agentId);
      }
      if (filters.dateFrom) {
        results = results.filter(conv => conv.createdAt >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        results = results.filter(conv => conv.createdAt <= filters.dateTo!);
      }
    }
    
    return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // Notificações
  async getUnreadCount(userId: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const userConversations = this.mockConversations.filter(conv => conv.userId === userId);
    return userConversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }

  // Exportar conversas
  async exportConversations(conversationIds: string[], format: 'pdf' | 'csv' | 'json' = 'json'): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const conversations = this.mockConversations.filter(conv => 
      conversationIds.includes(conv.id)
    );
    
    // Simular geração de arquivo
    const exportData = {
      exportDate: new Date().toISOString(),
      format,
      conversations: conversations.map(conv => ({
        ...conv,
        messages: this.mockMessages.filter(msg => msg.conversationId === conv.id)
      }))
    };
    
    // Em produção, retornaria a URL do arquivo gerado
    return `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
  }

  // Configurações de chat
  async getChatSettings(): Promise<{
    autoAssignment: boolean;
    businessHours: { start: string; end: string; timezone: string };
    maxConcurrentChats: number;
    responseTimeTarget: number;
    enableBotResponses: boolean;
    allowFileUploads: boolean;
    maxFileSize: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      autoAssignment: true,
      businessHours: {
        start: '08:00',
        end: '18:00',
        timezone: 'America/Sao_Paulo'
      },
      maxConcurrentChats: 5,
      responseTimeTarget: 3, // minutos
      enableBotResponses: true,
      allowFileUploads: true,
      maxFileSize: 10 * 1024 * 1024 // 10MB
    };
  }
}

export const chatService = new ChatService();
export type { ChatMessage, Conversation, Agent, QuickReply, CreateConversationData, ChatStats };