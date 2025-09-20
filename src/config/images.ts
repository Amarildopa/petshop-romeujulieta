/**
 * Configuração centralizada de imagens externas
 * 
 * Este arquivo permite trocar facilmente as URLs das imagens
 * usadas em toda a aplicação. Substitua as URLs do Unsplash
 * por suas próprias imagens quando necessário.
 */

export const IMAGE_CONFIG = {
  // Imagens da página Home
  // 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80'

  home: {
    hero: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',  
    about: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80'
  },

  // Imagens padrão para fallback
  defaults: {
    // Avatar padrão para usuários
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
    
    // Imagem padrão para pets
    petImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop&crop=face',
    
    // Imagem padrão para produtos
    productImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop',
    
    // Imagem padrão para serviços
    serviceImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop'
  },

  // Imagens específicas para diferentes contextos
  avatars: {
    // Avatar pequeno (32x32) - usado no header
    small: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    
    // Avatar médio (40x40) - usado no dashboard
    medium: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    
    // Avatar grande (120x120) - usado no perfil
    large: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face'
  },

  // Imagens de pets em diferentes tamanhos
  pets: {
    // Pet pequeno (100x100) - usado em listas
    small: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop&crop=face',
    
    // Pet médio (200x200) - usado em perfis
    medium: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop&crop=face',
    
    // Pet grande (300x300) - usado em detalhes
    large: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop&crop=face'
  },

  // Imagens específicas para Growth Journey
  growthJourney: {
    pet1: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop&crop=face',
    pet2: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop&crop=face'
  }
};

/**
 * Função utilitária para obter imagens com fallback
 */
export const getImageUrl = {
  /**
   * Retorna URL do avatar do usuário ou fallback
   */
  userAvatar: (url?: string | null, size: 'small' | 'medium' | 'large' = 'large') => {
    return url || IMAGE_CONFIG.avatars[size];
  },

  /**
   * Retorna URL da imagem do pet ou fallback
   */
  petImage: (avatar_url?: string | null, size: 'small' | 'medium' | 'large' = 'medium') => {
    return avatar_url || IMAGE_CONFIG.pets[size];
  },

  /**
   * Retorna URL da imagem do produto ou fallback
   */
  productImage: (url?: string | null) => {
    return url || IMAGE_CONFIG.defaults.productImage;
  },

  /**
   * Retorna URL da imagem do serviço ou fallback
   */
  serviceImage: (url?: string | null) => {
    return url || IMAGE_CONFIG.defaults.serviceImage;
  }
};

/**
 * Instruções para personalização:
 * 
 * 1. Para trocar as imagens, substitua as URLs nas constantes acima
 * 2. Mantenha as dimensões e parâmetros de crop para consistência
 * 3. Use um CDN próprio ou storage do Supabase para melhor performance
 * 4. Considere usar WebP para melhor compressão
 * 
 * Exemplo de uso:
 * import { IMAGE_CONFIG, getImageUrl } from '../config/images';
 * 
 * // Usar imagem específica
 * <img src={IMAGE_CONFIG.home.hero} alt="Hero" />
 * 
 * // Usar com fallback
 * <img src={getImageUrl.userAvatar(user.avatar_url, 'small')} alt="Avatar" />
 */
