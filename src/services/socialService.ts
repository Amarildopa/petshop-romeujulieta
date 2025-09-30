/* eslint-disable */
interface SocialAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube';
  username: string;
  displayName: string;
  profileUrl: string;
  avatarUrl: string;
  isConnected: boolean;
  followers: number;
  posts: number;
  engagement: number;
  lastSync: string;
}

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  scheduledAt?: string;
  publishedAt?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagement: number;
}

interface SocialStats {
  totalFollowers: number;
  totalPosts: number;
  totalEngagement: number;
  averageEngagement: number;
  topPerformingPost: SocialPost;
  growthRate: number;
  reachThisMonth: number;
  impressionsThisMonth: number;
}

interface ShareableContent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  type: 'product' | 'blog' | 'promotion' | 'event';
  tags: string[];
  createdAt: string;
}

interface SocialLoginProvider {
  id: string;
  name: string;
  platform: 'facebook' | 'google' | 'instagram' | 'twitter';
  isEnabled: boolean;
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  scopes: string[];
  users: number;
  conversions: number;
}

interface CreatePostData {
  content: string;
  platforms: string[];
  scheduledAt?: string;
  imageUrl?: string;
  videoUrl?: string;
}

interface SocialMetrics {
  platform: string;
  followers: number;
  posts: number;
  engagement: number;
  reach: number;
  impressions: number;
  clicks: number;
  conversions: number;
  period: string;
}

class SocialService {
  private baseUrl = '/api/social';

  // Mock data for development
  private mockAccounts: SocialAccount[] = [
    {
      id: '1',
      platform: 'facebook',
      username: 'petshopromeo',
      displayName: 'Pet Shop Romeo & Julieta',
      profileUrl: 'https://facebook.com/petshopromeo',
      avatarUrl: 'https://via.placeholder.com/50',
      isConnected: true,
      followers: 15420,
      posts: 342,
      engagement: 4.2,
      lastSync: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      platform: 'instagram',
      username: 'petshopromeo',
      displayName: 'Pet Shop Romeo & Julieta',
      profileUrl: 'https://instagram.com/petshopromeo',
      avatarUrl: 'https://via.placeholder.com/50',
      isConnected: true,
      followers: 28750,
      posts: 567,
      engagement: 6.8,
      lastSync: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      platform: 'twitter',
      username: 'petshopromeo',
      displayName: 'Pet Shop Romeo & Julieta',
      profileUrl: 'https://twitter.com/petshopromeo',
      avatarUrl: 'https://via.placeholder.com/50',
      isConnected: false,
      followers: 0,
      posts: 0,
      engagement: 0,
      lastSync: ''
    },
    {
      id: '4',
      platform: 'youtube',
      username: 'petshopromeo',
      displayName: 'Pet Shop Romeo & Julieta',
      profileUrl: 'https://youtube.com/@petshopromeo',
      avatarUrl: 'https://via.placeholder.com/50',
      isConnected: false,
      followers: 0,
      posts: 0,
      engagement: 0,
      lastSync: ''
    }
  ];

  private mockPosts: SocialPost[] = [
    {
      id: '1',
      platform: 'instagram',
      content: 'Novos brinquedos chegaram! 🐕🎾 Venha conferir nossa seleção especial para seu pet.',
      imageUrl: 'https://via.placeholder.com/400x300',
      status: 'published',
      likes: 245,
      comments: 18,
      shares: 12,
      reach: 3420,
      engagement: 8.1,
      publishedAt: '2024-01-15T08:00:00Z'
    },
    {
      id: '2',
      platform: 'facebook',
      content: 'Dica de cuidados: Como manter a higiene dental do seu cão em dia! 🦷✨',
      imageUrl: 'https://via.placeholder.com/400x300',
      status: 'published',
      likes: 156,
      comments: 23,
      shares: 34,
      reach: 2890,
      engagement: 7.4,
      publishedAt: '2024-01-14T16:30:00Z'
    },
    {
      id: '3',
      platform: 'instagram',
      content: 'Promoção especial: 20% OFF em rações premium! Válido até domingo.',
      imageUrl: 'https://via.placeholder.com/400x300',
      status: 'scheduled',
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0,
      engagement: 0,
      scheduledAt: '2024-01-16T10:00:00Z'
    },
    {
      id: '4',
      platform: 'facebook',
      content: 'Nossos clientes de quatro patas estão sempre felizes! 🐶❤️',
      status: 'draft',
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0,
      engagement: 0
    }
  ];

  private mockShareableContent: ShareableContent[] = [
    {
      id: '1',
      title: 'Ração Premium Golden para Cães',
      description: 'Nutrição completa e balanceada para cães adultos de todas as raças.',
      imageUrl: 'https://via.placeholder.com/300x200',
      url: '/produtos/racao-golden-caes',
      type: 'product',
      tags: ['ração', 'cães', 'premium', 'golden'],
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Como Cuidar da Higiene do seu Pet',
      description: 'Dicas essenciais para manter seu animal de estimação sempre limpo e saudável.',
      imageUrl: 'https://via.placeholder.com/300x200',
      url: '/blog/higiene-pet',
      type: 'blog',
      tags: ['higiene', 'cuidados', 'saúde', 'dicas'],
      createdAt: '2024-01-14T15:30:00Z'
    },
    {
      id: '3',
      title: 'Mega Promoção de Janeiro',
      description: 'Descontos de até 50% em produtos selecionados. Não perca!',
      imageUrl: 'https://via.placeholder.com/300x200',
      url: '/promocoes/janeiro-2024',
      type: 'promotion',
      tags: ['promoção', 'desconto', 'janeiro', 'oferta'],
      createdAt: '2024-01-13T12:00:00Z'
    },
    {
      id: '4',
      title: 'Workshop de Adestramento',
      description: 'Participe do nosso workshop gratuito sobre adestramento canino.',
      imageUrl: 'https://via.placeholder.com/300x200',
      url: '/eventos/workshop-adestramento',
      type: 'event',
      tags: ['workshop', 'adestramento', 'evento', 'gratuito'],
      createdAt: '2024-01-12T09:00:00Z'
    }
  ];

  private mockLoginProviders: SocialLoginProvider[] = [
    {
      id: '1',
      name: 'Facebook Login',
      platform: 'facebook',
      isEnabled: true,
      clientId: 'fb_client_id_123',
      clientSecret: 'fb_client_secret_456',
      redirectUrl: 'https://petshop.com/auth/facebook/callback',
      scopes: ['email', 'public_profile'],
      users: 1250,
      conversions: 890
    },
    {
      id: '2',
      name: 'Google Login',
      platform: 'google',
      isEnabled: true,
      clientId: 'google_client_id_789',
      clientSecret: 'google_client_secret_012',
      redirectUrl: 'https://petshop.com/auth/google/callback',
      scopes: ['email', 'profile'],
      users: 2340,
      conversions: 1680
    },
    {
      id: '3',
      name: 'Instagram Login',
      platform: 'instagram',
      isEnabled: false,
      clientId: 'ig_client_id_345',
      clientSecret: 'ig_client_secret_678',
      redirectUrl: 'https://petshop.com/auth/instagram/callback',
      scopes: ['user_profile', 'user_media'],
      users: 0,
      conversions: 0
    },
    {
      id: '4',
      name: 'Twitter Login',
      platform: 'twitter',
      isEnabled: false,
      clientId: 'twitter_client_id_901',
      clientSecret: 'twitter_client_secret_234',
      redirectUrl: 'https://petshop.com/auth/twitter/callback',
      scopes: ['read', 'write'],
      users: 0,
      conversions: 0
    }
  ];

  async getSocialAccounts(): Promise<SocialAccount[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockAccounts;
  }

  async getSocialPosts(filters?: {
    platform?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<SocialPost[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredPosts = [...this.mockPosts];
    
    if (filters?.platform) {
      filteredPosts = filteredPosts.filter(post => post.platform === filters.platform);
    }
    
    if (filters?.status) {
      filteredPosts = filteredPosts.filter(post => post.status === filters.status);
    }
    
    return filteredPosts;
  }

  async getSocialStats(): Promise<SocialStats> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const connectedAccounts = this.mockAccounts.filter(acc => acc.isConnected);
    const totalFollowers = connectedAccounts.reduce((sum, acc) => sum + acc.followers, 0);
    const totalPosts = connectedAccounts.reduce((sum, acc) => sum + acc.posts, 0);
    const publishedPosts = this.mockPosts.filter(post => post.status === 'published');
    const totalEngagement = publishedPosts.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0);
    const averageEngagement = publishedPosts.length > 0 ? totalEngagement / publishedPosts.length : 0;
    const topPerformingPost = publishedPosts.reduce((top, post) => 
      (post.likes + post.comments + post.shares) > (top.likes + top.comments + top.shares) ? post : top
    , publishedPosts[0] || this.mockPosts[0]);
    
    return {
      totalFollowers,
      totalPosts,
      totalEngagement,
      averageEngagement,
      topPerformingPost,
      growthRate: 12.5,
      reachThisMonth: 45680,
      impressionsThisMonth: 128340
    };
  }

  async getShareableContent(filters?: {
    type?: string;
    search?: string;
  }): Promise<ShareableContent[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredContent = [...this.mockShareableContent];
    
    if (filters?.type) {
      filteredContent = filteredContent.filter(content => content.type === filters.type);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredContent = filteredContent.filter(content => 
        content.title.toLowerCase().includes(searchLower) ||
        content.description.toLowerCase().includes(searchLower) ||
        content.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return filteredContent;
  }

  async getLoginProviders(): Promise<SocialLoginProvider[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockLoginProviders;
  }

  async getAuthUrl(platform: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const authUrls = {
      facebook: 'https://www.facebook.com/v18.0/dialog/oauth?client_id=123&redirect_uri=callback&scope=pages_manage_posts,pages_read_engagement',
      instagram: 'https://api.instagram.com/oauth/authorize?client_id=456&redirect_uri=callback&scope=user_profile,user_media',
      twitter: 'https://twitter.com/i/oauth2/authorize?client_id=789&redirect_uri=callback&scope=tweet.read%20tweet.write',
      youtube: 'https://accounts.google.com/oauth2/auth?client_id=012&redirect_uri=callback&scope=https://www.googleapis.com/auth/youtube'
    };
    
    return authUrls[platform as keyof typeof authUrls] || '';
  }

  async connectAccount(platform: string, /* _authCode: string */): Promise<SocialAccount> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const accountIndex = this.mockAccounts.findIndex(acc => acc.platform === platform);
    if (accountIndex !== -1) {
      this.mockAccounts[accountIndex] = {
        ...this.mockAccounts[accountIndex],
        isConnected: true,
        lastSync: new Date().toISOString()
      };
      return this.mockAccounts[accountIndex];
    }
    
    throw new Error('Plataforma não encontrada');
  }

  async disconnectAccount(accountId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const accountIndex = this.mockAccounts.findIndex(acc => acc.id === accountId);
    if (accountIndex !== -1) {
      this.mockAccounts[accountIndex] = {
        ...this.mockAccounts[accountIndex],
        isConnected: false,
        followers: 0,
        posts: 0,
        engagement: 0,
        lastSync: ''
      };
    }
  }

  async createPost(postData: CreatePostData): Promise<SocialPost> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newPost: SocialPost = {
      id: Date.now().toString(),
      platform: postData.platforms[0], // Use first platform for simplicity
      content: postData.content,
      imageUrl: postData.imageUrl,
      videoUrl: postData.videoUrl,
      scheduledAt: postData.scheduledAt,
      publishedAt: postData.scheduledAt ? undefined : new Date().toISOString(),
      status: postData.scheduledAt ? 'scheduled' : 'published',
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0,
      engagement: 0
    };
    
    this.mockPosts.unshift(newPost);
    return newPost;
  }

  async updatePost(postId: string, updates: Partial<SocialPost>): Promise<SocialPost> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const postIndex = this.mockPosts.findIndex(post => post.id === postId);
    if (postIndex !== -1) {
      this.mockPosts[postIndex] = { ...this.mockPosts[postIndex], ...updates };
      return this.mockPosts[postIndex];
    }
    
    throw new Error('Post não encontrado');
  }

  async deletePost(postId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const postIndex = this.mockPosts.findIndex(post => post.id === postId);
    if (postIndex !== -1) {
      this.mockPosts.splice(postIndex, 1);
    }
  }

  async shareContent(contentId: string, platforms: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const content = this.mockShareableContent.find(c => c.id === contentId);
    if (!content) {
      throw new Error('Conteúdo não encontrado');
    }
    
    // Create posts for each platform
    for (const platform of platforms) {
      const newPost: SocialPost = {
        id: `${Date.now()}-${platform}`,
        platform,
        content: `${content.title}\n\n${content.description}\n\n${content.tags.map(tag => `#${tag}`).join(' ')}`,
        imageUrl: content.imageUrl,
        status: 'published',
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0,
        engagement: 0,
        publishedAt: new Date().toISOString()
      };
      
      this.mockPosts.unshift(newPost);
    }
  }

  async generateShareUrl(contentId: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const content = this.mockShareableContent.find(c => c.id === contentId);
    if (!content) {
      throw new Error('Conteúdo não encontrado');
    }
    
    return `https://petshop.com/share/${contentId}?utm_source=social&utm_medium=share`;
  }

  async getSocialMetrics(_period: string = '30d'): Promise<SocialMetrics[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return this.mockAccounts.filter(acc => acc.isConnected).map(account => ({
      platform: account.platform,
      followers: account.followers,
      posts: account.posts,
      engagement: account.engagement,
      reach: Math.floor(account.followers * 0.3),
      impressions: Math.floor(account.followers * 0.8),
      clicks: Math.floor(account.followers * 0.05),
      conversions: Math.floor(account.followers * 0.01),
      period: _period
    }));
  }

  async updateLoginProvider(providerId: string, updates: Partial<SocialLoginProvider>): Promise<SocialLoginProvider> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const providerIndex = this.mockLoginProviders.findIndex(p => p.id === providerId);
    if (providerIndex !== -1) {
      this.mockLoginProviders[providerIndex] = { ...this.mockLoginProviders[providerIndex], ...updates };
      return this.mockLoginProviders[providerIndex];
    }
    
    throw new Error('Provedor não encontrado');
  }

  async syncAccount(accountId: string): Promise<SocialAccount> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const accountIndex = this.mockAccounts.findIndex(acc => acc.id === accountId);
    if (accountIndex !== -1) {
      // Simulate data sync with random updates
      const account = this.mockAccounts[accountIndex];
      const followerGrowth = Math.floor(Math.random() * 100) - 50;
      const postGrowth = Math.floor(Math.random() * 10);
      
      this.mockAccounts[accountIndex] = {
        ...account,
        followers: Math.max(0, account.followers + followerGrowth),
        posts: account.posts + postGrowth,
        engagement: Math.max(0, account.engagement + (Math.random() - 0.5)),
        lastSync: new Date().toISOString()
      };
      
      return this.mockAccounts[accountIndex];
    }
    
    throw new Error('Conta não encontrada');
  }

  async getPostAnalytics(/* _postId: string */): Promise<{
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
    saves: number;
    demographics: {
      age: { [key: string]: number };
      gender: { [key: string]: number };
      location: { [key: string]: number };
    };
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      impressions: Math.floor(Math.random() * 10000) + 1000,
      reach: Math.floor(Math.random() * 5000) + 500,
      engagement: Math.floor(Math.random() * 500) + 50,
      clicks: Math.floor(Math.random() * 200) + 20,
      saves: Math.floor(Math.random() * 100) + 10,
      demographics: {
        age: {
          '18-24': 25,
          '25-34': 35,
          '35-44': 20,
          '45-54': 15,
          '55+': 5
        },
        gender: {
          'Feminino': 60,
          'Masculino': 35,
          'Outros': 5
        },
        location: {
          'São Paulo': 40,
          'Rio de Janeiro': 25,
          'Belo Horizonte': 15,
          'Brasília': 10,
          'Outros': 10
        }
      }
    };
  }

  async exportSocialReport(format: 'pdf' | 'excel', /* _period: string */): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate report generation
    const reportId = `social_report_${Date.now()}`;
    const downloadUrl = `/api/reports/download/${reportId}.${format}`;
    
    return downloadUrl;
  }

  async getHashtagSuggestions(_content: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const suggestions = [
      'petshop', 'pets', 'cães', 'gatos', 'animais', 'cuidados',
      'saúde', 'alimentação', 'brinquedos', 'acessórios', 'veterinário',
      'adestramento', 'higiene', 'amor', 'família', 'companhia'
    ];
    
    // Return random suggestions based on content
    return suggestions.sort(() => 0.5 - Math.random()).slice(0, 8);
  }

  async schedulePost(postData: CreatePostData & { scheduledAt: string }): Promise<SocialPost> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const scheduledPost: SocialPost = {
      id: Date.now().toString(),
      platform: postData.platforms[0],
      content: postData.content,
      imageUrl: postData.imageUrl,
      videoUrl: postData.videoUrl,
      scheduledAt: postData.scheduledAt,
      status: 'scheduled',
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0,
      engagement: 0
    };
    
    this.mockPosts.unshift(scheduledPost);
    return scheduledPost;
  }

  async getScheduledPosts(): Promise<SocialPost[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockPosts.filter(post => post.status === 'scheduled');
  }

  async cancelScheduledPost(postId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const postIndex = this.mockPosts.findIndex(post => post.id === postId);
    if (postIndex !== -1) {
      this.mockPosts[postIndex].status = 'draft';
      this.mockPosts[postIndex].scheduledAt = undefined;
    }
  }
}

export const socialService = new SocialService();
export type { SocialAccount, SocialPost, SocialStats, ShareableContent, SocialLoginProvider, CreatePostData, SocialMetrics };