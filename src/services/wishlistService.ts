import { supabase } from "../lib/supabase";
import { Product } from './productsService';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

class WishlistService {
  // Buscar lista de desejos do usuário
  async getUserWishlist(userId: string): Promise<WishlistItem[]> {
    try {
      const { data, error } = await supabase
        .from('wishlist_pet')
        .select(`
          *,
          products_pet!product_id (
            id,
            name,
            price,
            images,
            category,
            stock,
            is_active
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar lista de desejos:', error);
        throw error;
      }

      return data?.map(item => ({
        id: item.id,
        userId: item.user_id,
        productId: item.product_id,
        product: {
          id: item.products_pet.id,
          name: item.products_pet.name,
          price: item.products_pet.price,
          image_url: item.products_pet.images?.[0] || '',
          category: item.products_pet.category,
          in_stock: item.products_pet.stock > 0 && item.products_pet.is_active
        },
        createdAt: item.created_at
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar lista de desejos:', error);
      throw error;
    }
  }

  // Adicionar produto à lista de desejos
  async addToWishlist(userId: string, productId: string): Promise<WishlistItem | null> {
    try {
      // Verificar se o produto já está na lista de desejos
      const { data: existingItem } = await supabase
        .from('wishlist_pet')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        throw new Error('Produto já está na lista de desejos');
      }

      const { data, error } = await supabase
        .from('wishlist_pet')
        .insert({
          user_id: userId,
          product_id: productId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao adicionar à lista de desejos:', error);
      throw error;
    }
  }

  // Remover produto da lista de desejos
  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wishlist_pet')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao remover da lista de desejos:', error);
      return false;
    }
  }

  // Verificar se produto está na lista de desejos
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('wishlist_pet')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Erro ao verificar lista de desejos:', error);
      return false;
    }
  }

  // Limpar lista de desejos
  async clearWishlist(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wishlist_pet')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao limpar lista de desejos:', error);
      return false;
    }
  }

  // Contar itens na lista de desejos
  async getWishlistCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('wishlist_pet')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar itens da lista de desejos:', error);
      return 0;
    }
  }

  // Mover itens da wishlist para o carrinho
  async moveToCart(userId: string, productIds: string[]): Promise<boolean> {
    try {
      // Aqui você pode integrar com o serviço do carrinho
      // Por enquanto, apenas remove da wishlist
      const { error } = await supabase
        .from('wishlist_pet')
        .delete()
        .eq('user_id', userId)
        .in('product_id', productIds);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao mover para o carrinho:', error);
      return false;
    }
  }

  // Buscar produtos mais desejados (estatísticas)
  async getMostWishedProducts(limit: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('wishlist_pet')
        .select(`
          product_id,
          products_pet!product_id (
            id,
            name,
            price,
            images,
            category,
            stock,
            is_active
          )
        `)
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar produtos mais desejados:', error);
        throw error;
      }

      // Contar ocorrências de cada produto
      const productCounts = data?.reduce((acc, item) => {
        const productId = item.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            count: 0,
            product: {
              id: item.products_pet.id,
              name: item.products_pet.name,
              price: item.products_pet.price,
              image_url: item.products_pet.images?.[0] || '',
              category: item.products_pet.category,
              in_stock: item.products_pet.stock > 0 && item.products_pet.is_active
            }
          };
        }
        acc[productId].count++;
        return acc;
      }, {} as Record<string, { count: number; product: Product }>);

      // Ordenar por contagem e retornar apenas os produtos
      return Object.values(productCounts || {})
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(item => item.product);
    } catch (error) {
      console.error('Erro ao buscar produtos mais desejados:', error);
      throw error;
    }
  }
}

export const wishlistService = new WishlistService();
export default wishlistService;