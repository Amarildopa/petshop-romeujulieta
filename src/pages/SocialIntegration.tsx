import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { socialService } from '@/services/socialService';
import { Share2, Facebook, Instagram, Twitter, Youtube, TrendingUp, Users, Heart, MessageCircle } from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube';
  username: string;
  followers: number;
  isConnected: boolean;
  lastSync: Date;
}

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  imageUrl?: string;
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'published';
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
}

interface SocialMetrics {
  totalFollowers: number;
  totalEngagement: number;
  postsThisMonth: number;
  topPerformingPost: string;
}

const SocialIntegration: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null);
  const [newPost, setNewPost] = useState({ content: '', platform: 'facebook', scheduledFor: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    try {
      setLoading(true);
      const [accountsData, postsData, metricsData] = await Promise.all([
        socialService.getConnectedAccounts(),
        socialService.getPosts(),
        socialService.getMetrics()
      ]);
      setAccounts(accountsData);
      setPosts(postsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Erro ao carregar dados sociais:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (platform: string) => {
    try {
      await socialService.connectAccount(platform);
      await loadSocialData();
    } catch (error) {
      console.error('Erro ao conectar conta:', error);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      await socialService.disconnectAccount(accountId);
      await loadSocialData();
    } catch (error) {
      console.error('Erro ao desconectar conta:', error);
    }
  };

  const schedulePost = async () => {
    try {
      await socialService.schedulePost({
        content: newPost.content,
        platform: newPost.platform,
        scheduledFor: newPost.scheduledFor ? new Date(newPost.scheduledFor) : undefined
      });
      setNewPost({ content: '', platform: 'facebook', scheduledFor: '' });
      await loadSocialData();
    } catch (error) {
      console.error('Erro ao agendar post:', error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-5 w-5" />;
      case 'instagram': return <Instagram className="h-5 w-5" />;
      case 'twitter': return <Twitter className="h-5 w-5" />;
      case 'youtube': return <Youtube className="h-5 w-5" />;
      default: return <Share2 className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando integração social...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Integração Social</h1>
        <p className="text-gray-600">Gerencie suas redes sociais e agende posts</p>
      </div>

      {/* Métricas Gerais */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Seguidores</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalFollowers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engajamento Total</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalEngagement.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Posts este Mês</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.postsThisMonth}</p>
                </div>
                <Share2 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Post</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{metrics.topPerformingPost}</p>
                </div>
                <Heart className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">Contas Conectadas</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="schedule">Agendar Post</TabsTrigger>
        </TabsList>

        {/* Contas Conectadas */}
        <TabsContent value="accounts">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['facebook', 'instagram', 'twitter', 'youtube'].map((platform) => {
              const account = accounts.find(acc => acc.platform === platform);
              return (
                <Card key={platform}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getPlatformIcon(platform)}
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {account ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">@{account.username}</p>
                          <p className="text-lg font-semibold">{account.followers.toLocaleString()} seguidores</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disconnectAccount(account.id)}
                          >
                            Desconectar
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Última sincronização: {account.lastSync.toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">Conta não conectada</p>
                        <Button
                          onClick={() => connectAccount(platform)}
                          className="w-full"
                        >
                          Conectar {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Posts */}
        <TabsContent value="posts">
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(post.platform)}
                      <span className="font-medium">{post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}</span>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status === 'published' ? 'Publicado' : 
                         post.status === 'scheduled' ? 'Agendado' : 'Rascunho'}
                      </Badge>
                    </div>
                    {post.scheduledFor && (
                      <span className="text-sm text-gray-500">
                        {post.scheduledFor.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-900 mb-4">{post.content}</p>
                  
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt="Post image" 
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.engagement.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.engagement.comments}
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      {post.engagement.shares}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Agendar Post */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Agendar Novo Post</CardTitle>
              <CardDescription>
                Crie e agende posts para suas redes sociais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="platform">Plataforma</Label>
                <select
                  id="platform"
                  value={newPost.platform}
                  onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              <div>
                <Label htmlFor="content">Conteúdo do Post</Label>
                <textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Digite o conteúdo do seu post..."
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="scheduledFor">Agendar para (opcional)</Label>
                <Input
                  id="scheduledFor"
                  type="datetime-local"
                  value={newPost.scheduledFor}
                  onChange={(e) => setNewPost({ ...newPost, scheduledFor: e.target.value })}
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={schedulePost}
                disabled={!newPost.content.trim()}
                className="w-full"
              >
                {newPost.scheduledFor ? 'Agendar Post' : 'Publicar Agora'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialIntegration;