import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  Paperclip,
  Smile,
  Search,
  CheckCheck,
  Users,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: Date;
  isRead: boolean;
  isAgent: boolean;
}

interface ChatConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  agentId?: string;
  agentName?: string;
  status: 'waiting' | 'active' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  tags: string[];
  rating?: number;
  createdAt: Date;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  activeChats: number;
  totalChats: number;
  avgResponseTime: number;
  rating: number;
}

interface QuickReply {
  id: string;
  title: string;
  content: string;
  category: string;
}

const LiveChat: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // const [activeTab, setActiveTab] = useState('chats');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data
  const mockConversations: ChatConversation[] = [
    {
      id: '1',
      customerId: 'cust-1',
      customerName: 'Maria Silva',
      customerEmail: 'maria@email.com',
      customerAvatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20woman%20avatar%20friendly&image_size=square',
      agentId: 'agent-1',
      agentName: 'João Suporte',
      status: 'active',
      priority: 'high',
      subject: 'Problema com entrega',
      lastMessage: 'Meu pedido ainda não chegou, podem verificar?',
      lastMessageTime: new Date('2024-01-15T14:30:00'),
      unreadCount: 2,
      tags: ['entrega', 'urgente'],
      createdAt: new Date('2024-01-15T14:00:00')
    },
    {
      id: '2',
      customerId: 'cust-2',
      customerName: 'Carlos Santos',
      customerEmail: 'carlos@email.com',
      status: 'waiting',
      priority: 'medium',
      subject: 'Dúvida sobre produto',
      lastMessage: 'Qual a diferença entre essas duas rações?',
      lastMessageTime: new Date('2024-01-15T14:15:00'),
      unreadCount: 1,
      tags: ['produto', 'duvida'],
      createdAt: new Date('2024-01-15T14:10:00')
    },
    {
      id: '3',
      customerId: 'cust-3',
      customerName: 'Ana Costa',
      customerEmail: 'ana@email.com',
      agentId: 'agent-2',
      agentName: 'Paula Atendimento',
      status: 'resolved',
      priority: 'low',
      subject: 'Troca de produto',
      lastMessage: 'Perfeito! Muito obrigada pela ajuda.',
      lastMessageTime: new Date('2024-01-15T13:45:00'),
      unreadCount: 0,
      tags: ['troca', 'resolvido'],
      rating: 5,
      createdAt: new Date('2024-01-15T13:00:00')
    }
  ];

  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      chatId: '1',
      senderId: 'cust-1',
      senderName: 'Maria Silva',
      content: 'Olá, fiz um pedido há 3 dias e ainda não recebi.',
      type: 'text',
      timestamp: new Date('2024-01-15T14:00:00'),
      isRead: true,
      isAgent: false
    },
    {
      id: '2',
      chatId: '1',
      senderId: 'agent-1',
      senderName: 'João Suporte',
      content: 'Olá Maria! Vou verificar o status do seu pedido. Pode me informar o número?',
      type: 'text',
      timestamp: new Date('2024-01-15T14:02:00'),
      isRead: true,
      isAgent: true
    },
    {
      id: '3',
      chatId: '1',
      senderId: 'cust-1',
      senderName: 'Maria Silva',
      content: 'É o pedido #12345',
      type: 'text',
      timestamp: new Date('2024-01-15T14:03:00'),
      isRead: true,
      isAgent: false
    },
    {
      id: '4',
      chatId: '1',
      senderId: 'agent-1',
      senderName: 'João Suporte',
      content: 'Encontrei seu pedido! Ele está em trânsito e deve chegar amanhã. Vou enviar o código de rastreamento.',
      type: 'text',
      timestamp: new Date('2024-01-15T14:05:00'),
      isRead: true,
      isAgent: true
    },
    {
      id: '5',
      chatId: '1',
      senderId: 'cust-1',
      senderName: 'Maria Silva',
      content: 'Meu pedido ainda não chegou, podem verificar?',
      type: 'text',
      timestamp: new Date('2024-01-15T14:30:00'),
      isRead: false,
      isAgent: false
    }
  ];

  const mockAgents: Agent[] = [
    {
      id: 'agent-1',
      name: 'João Suporte',
      email: 'joao@petshop.com',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20man%20support%20agent%20friendly&image_size=square',
      status: 'online',
      activeChats: 3,
      totalChats: 45,
      avgResponseTime: 2.5,
      rating: 4.8
    },
    {
      id: 'agent-2',
      name: 'Paula Atendimento',
      email: 'paula@petshop.com',
      status: 'away',
      activeChats: 1,
      totalChats: 32,
      avgResponseTime: 3.2,
      rating: 4.9
    },
    {
      id: 'agent-3',
      name: 'Carlos Vendas',
      email: 'carlos@petshop.com',
      status: 'busy',
      activeChats: 5,
      totalChats: 67,
      avgResponseTime: 1.8,
      rating: 4.7
    }
  ];

  const mockQuickReplies: QuickReply[] = [
    {
      id: '1',
      title: 'Saudação',
      content: 'Olá! Como posso ajudá-lo hoje?',
      category: 'geral'
    },
    {
      id: '2',
      title: 'Verificar Pedido',
      content: 'Vou verificar o status do seu pedido. Pode me informar o número?',
      category: 'pedidos'
    },
    {
      id: '3',
      title: 'Política de Troca',
      content: 'Nossa política permite trocas em até 30 dias com o produto em perfeito estado.',
      category: 'trocas'
    },
    {
      id: '4',
      title: 'Prazo de Entrega',
      content: 'O prazo de entrega varia de 3 a 7 dias úteis, dependendo da sua localização.',
      category: 'entrega'
    }
  ];

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setConversations(mockConversations);
      setMessages(mockMessages);
      setAgents(mockAgents);
      setQuickReplies(mockQuickReplies);
      setSelectedChat('1');
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Auto scroll para a última mensagem
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId: selectedChat,
      senderId: 'agent-1',
      senderName: 'João Suporte',
      content: newMessage,
      type: 'text',
      timestamp: new Date(),
      isRead: false,
      isAgent: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Atualizar última mensagem na conversa
    setConversations(prev => prev.map(conv => 
      conv.id === selectedChat 
        ? { ...conv, lastMessage: newMessage, lastMessageTime: new Date() }
        : conv
    ));

    toast.success('Mensagem enviada!');
  };

  const handleQuickReply = (reply: QuickReply) => {
    setNewMessage(reply.content);
  };

  const handleStatusChange = (chatId: string, newStatus: ChatConversation['status']) => {
    setConversations(prev => prev.map(conv => 
      conv.id === chatId ? { ...conv, status: newStatus } : conv
    ));
    toast.success(`Status alterado para ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);
  const chatMessages = messages.filter(msg => msg.chatId === selectedChat);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat ao Vivo</h1>
        <p className="text-gray-600">Gerencie conversas e forneça suporte em tempo real</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[800px]">
        {/* Sidebar - Lista de Conversas */}
        <div className="col-span-4">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Conversas
                </CardTitle>
                <Badge variant="secondary">
                  {conversations.filter(c => c.status === 'waiting').length} aguardando
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 p-4">
                  {filteredConversations.map(conversation => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedChat(conversation.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChat === conversation.id 
                          ? 'bg-blue-50 border-blue-200 border' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.customerAvatar} />
                            <AvatarFallback>
                              {conversation.customerName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">
                              {conversation.customerName}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessageTime.toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.subject}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessage}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getStatusColor(conversation.status)} variant="secondary">
                              {conversation.status === 'waiting' ? 'Aguardando' :
                               conversation.status === 'active' ? 'Ativo' :
                               conversation.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                            </Badge>
                            <Badge className={getPriorityColor(conversation.priority)} variant="secondary">
                              {conversation.priority === 'urgent' ? 'Urgente' :
                               conversation.priority === 'high' ? 'Alta' :
                               conversation.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Principal */}
        <div className="col-span-8">
          {selectedConversation ? (
            <Card className="h-full flex flex-col">
              {/* Header do Chat */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.customerAvatar} />
                      <AvatarFallback>
                        {selectedConversation.customerName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedConversation.customerName}</h3>
                      <p className="text-sm text-gray-500">{selectedConversation.customerEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedConversation.status)}>
                    {selectedConversation.status === 'waiting' ? 'Aguardando' :
                     selectedConversation.status === 'active' ? 'Ativo' :
                     selectedConversation.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                  </Badge>
                  <Badge className={getPriorityColor(selectedConversation.priority)}>
                    {selectedConversation.priority === 'urgent' ? 'Urgente' :
                     selectedConversation.priority === 'high' ? 'Alta' :
                     selectedConversation.priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                  {selectedConversation.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardHeader>

              {/* Mensagens */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[500px] p-4">
                  <div className="space-y-4">
                    {chatMessages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.isAgent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${
                          message.isAgent 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        } rounded-lg p-3`}>
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-between mt-2 text-xs ${
                            message.isAgent ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span>
                              {message.timestamp.toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {message.isAgent && (
                              <CheckCheck className={`h-3 w-3 ${
                                message.isRead ? 'text-blue-200' : 'text-blue-300'
                              }`} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Input de Mensagem */}
              <div className="border-t p-4">
                {/* Respostas Rápidas */}
                <div className="mb-3">
                  <div className="flex gap-2 flex-wrap">
                    {quickReplies.slice(0, 4).map(reply => (
                      <Button
                        key={reply.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply)}
                      >
                        {reply.title}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Ações do Chat */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(selectedChat!, 'resolved')}
                    >
                      Resolver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(selectedChat!, 'closed')}
                    >
                      Fechar
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedConversation.agentName && (
                      <span>Atendido por {selectedConversation.agentName}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma conversa</h3>
                <p className="text-gray-500">Escolha uma conversa da lista para começar a atender</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Painel de Agentes */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Agentes Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agents.map(agent => (
                <div key={agent.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={agent.avatar} />
                      <AvatarFallback>
                        {agent.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getAgentStatusColor(agent.status)}`}></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{agent.name}</div>
                    <div className="text-xs text-gray-500">
                      {agent.activeChats} chats ativos • {agent.avgResponseTime}min resp.
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs">{agent.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveChat;