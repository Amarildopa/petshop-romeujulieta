// Dados mock para feedbacks/depoimentos
// Usado quando não há dados reais no banco ou para desenvolvimento

export interface FeedbackData {
  id: string;
  type: 'service' | 'product' | 'app';
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  user_name?: string;
}

export const mockFeedbacks: FeedbackData[] = [
  {
    id: '1',
    type: 'service',
    rating: 5,
    title: 'Excelente atendimento no banho e tosa',
    comment: 'Minha cachorrinha Luna ficou linda depois do banho e tosa! A equipe foi super cuidadosa e carinhosa com ela. Recomendo muito!',
    status: 'resolved',
    priority: 'medium',
    created_at: '2024-01-15T10:30:00Z',
    user_name: 'Maria Silva'
  },
  {
    id: '2',
    type: 'service',
    rating: 5,
    title: 'Veterinário muito competente',
    comment: 'O Dr. Carlos foi excepcional no atendimento do meu gato Max. Diagnóstico preciso e tratamento eficaz. Muito obrigada!',
    status: 'resolved',
    priority: 'medium',
    created_at: '2024-01-14T14:20:00Z',
    user_name: 'João Santos'
  },
  {
    id: '3',
    type: 'product',
    rating: 4,
    title: 'Ração de qualidade excelente',
    comment: 'Comprei a ração premium para meu cachorro Rex e ele adorou! Notei melhora no pelo e na disposição dele.',
    status: 'resolved',
    priority: 'medium',
    created_at: '2024-01-13T16:45:00Z',
    user_name: 'Ana Costa'
  },
  {
    id: '4',
    type: 'service',
    rating: 5,
    title: 'Hospedagem perfeita para minha viagem',
    comment: 'Deixei meu pet no hotel durante as férias e fiquei muito tranquila. Cuidado excepcional e muitas fotos durante a estadia!',
    status: 'resolved',
    priority: 'medium',
    created_at: '2024-01-12T09:15:00Z',
    user_name: 'Carlos Oliveira'
  },
  {
    id: '5',
    type: 'app',
    rating: 4,
    title: 'App muito prático e fácil de usar',
    comment: 'O aplicativo facilitou muito o agendamento dos serviços. Interface intuitiva e notificações úteis.',
    status: 'resolved',
    priority: 'low',
    created_at: '2024-01-11T11:30:00Z',
    user_name: 'Fernanda Lima'
  },
  {
    id: '6',
    type: 'service',
    rating: 5,
    title: 'Adestramento transformou meu cão',
    comment: 'O treinamento comportamental foi incrível! Meu cachorro Bobby agora obedece comandos e está muito mais calmo.',
    status: 'resolved',
    priority: 'medium',
    created_at: '2024-01-10T13:20:00Z',
    user_name: 'Roberto Mendes'
  },
  {
    id: '7',
    type: 'product',
    rating: 5,
    title: 'Brinquedos de ótima qualidade',
    comment: 'Os brinquedos que comprei são resistentes e meu gato adora! Entrega rápida e produto conforme descrito.',
    status: 'resolved',
    priority: 'low',
    created_at: '2024-01-09T15:10:00Z',
    user_name: 'Lucia Ferreira'
  },
  {
    id: '8',
    type: 'service',
    rating: 4,
    title: 'Consulta veterinária completa',
    comment: 'Atendimento profissional e cuidadoso. O veterinário explicou tudo detalhadamente sobre a saúde da minha pet.',
    status: 'resolved',
    priority: 'medium',
    created_at: '2024-01-08T08:45:00Z',
    user_name: 'Pedro Almeida'
  },
  {
    id: '9',
    type: 'app',
    rating: 3,
    title: 'Sugestão de melhoria no agendamento',
    comment: 'O app é bom, mas seria legal ter mais opções de horário disponíveis, especialmente aos finais de semana.',
    status: 'pending',
    priority: 'low',
    created_at: '2024-01-07T12:00:00Z',
    user_name: 'Camila Rocha'
  },
  {
    id: '10',
    type: 'service',
    rating: 5,
    title: 'Serviço de emergência salvou minha pet',
    comment: 'Atendimento de emergência foi rápido e eficiente. A equipe foi muito profissional em um momento difícil. Gratidão eterna!',
    status: 'resolved',
    priority: 'high',
    created_at: '2024-01-06T20:30:00Z',
    user_name: 'Marcos Souza'
  },
  {
    id: '11',
    type: 'product',
    rating: 4,
    title: 'Medicamentos sempre disponíveis',
    comment: 'Sempre encontro os medicamentos que preciso para meus pets. Preços justos e atendimento esclarecedor.',
    status: 'resolved',
    priority: 'medium',
    created_at: '2024-01-05T14:15:00Z',
    user_name: 'Sandra Martins'
  },
  {
    id: '12',
    type: 'service',
    rating: 5,
    title: 'Cirurgia bem-sucedida',
    comment: 'Minha cadela passou por uma cirurgia delicada e tudo correu perfeitamente. Equipe muito competente e cuidadosa.',
    status: 'resolved',
    priority: 'high',
    created_at: '2024-01-04T07:30:00Z',
    user_name: 'Ricardo Barbosa'
  }
];

// Função para filtrar feedbacks por tipo
export const getFeedbacksByType = (type?: 'service' | 'product' | 'app'): FeedbackData[] => {
  if (!type) return mockFeedbacks;
  return mockFeedbacks.filter(feedback => feedback.type === type);
};

// Função para obter feedbacks com rating alto (4-5 estrelas)
export const getHighRatingFeedbacks = (): FeedbackData[] => {
  return mockFeedbacks.filter(feedback => feedback.rating >= 4);
};

// Função para obter feedbacks recentes (últimos 30 dias)
export const getRecentFeedbacks = (days: number = 30): FeedbackData[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return mockFeedbacks.filter(feedback => {
    const feedbackDate = new Date(feedback.created_at);
    return feedbackDate >= cutoffDate;
  });
};

// Função para calcular estatísticas dos feedbacks
export const getFeedbackStats = () => {
  const total = mockFeedbacks.length;
  const avgRating = mockFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / total;
  
  const byType = {
    service: mockFeedbacks.filter(f => f.type === 'service').length,
    product: mockFeedbacks.filter(f => f.type === 'product').length,
    app: mockFeedbacks.filter(f => f.type === 'app').length
  };
  
  const byRating = {
    5: mockFeedbacks.filter(f => f.rating === 5).length,
    4: mockFeedbacks.filter(f => f.rating === 4).length,
    3: mockFeedbacks.filter(f => f.rating === 3).length,
    2: mockFeedbacks.filter(f => f.rating === 2).length,
    1: mockFeedbacks.filter(f => f.rating === 1).length
  };
  
  return {
    total,
    avgRating: Math.round(avgRating * 10) / 10,
    byType,
    byRating
  };
};