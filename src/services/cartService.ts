import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type CartItem = Database['public']['Tables']['cart_items_pet']['Row'];
type CartItemInsert = Database['public']['Tables']['cart_items_pet']['Insert'];
type CartItemUpdate = Database['public']['Tables']['cart_items_pet']['Update'];

export class CartService {
  async getCartItems(userId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('cart_items_pet')
      .select(`
        *,
        products_pet (
          id,
          name,
          description,
          price,
          image_url,
          stock,
          is_active
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar itens do carrinho: ${error.message}`);
    }

    return data || [];
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem> {
    // Primeiro, verificar se o produto existe e está ativo
    const { data: product, error: productError } = await supabase
      .from('products_pet')
      .select('id, name, price, stock, is_active')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error('Produto não encontrado');
    }

    if (!product.is_active) {
      throw new Error('Produto não está disponível');
    }

    if (product.stock < quantity) {
      throw new Error('Quantidade solicitada maior que o estoque disponível');
    }

    // Verificar se o item já existe no carrinho
    const { data: existingItem, error: existingError } = await supabase
      .from('cart_items_pet')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Atualizar quantidade
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new Error('Quantidade solicitada maior que o estoque disponível');
      }

      return this.updateCartItem(existingItem.id, { quantity: newQuantity });
    } else {
      // Adicionar novo item
      const { data, error } = await supabase
        .from('cart_items_pet')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
          price_at_time: product.price
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao adicionar item ao carrinho: ${error.message}`);
      }

      return data;
    }
  }

  async updateCartItem(itemId: string, updates: CartItemUpdate): Promise<CartItem> {
    const { data, error } = await supabase
      .from('cart_items_pet')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar item do carrinho: ${error.message}`);
    }

    return data;
  }

  async removeFromCart(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items_pet')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw new Error(`Erro ao remover item do carrinho: ${error.message}`);
    }
  }

  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items_pet')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao limpar carrinho: ${error.message}`);
    }
  }

  async getCartTotal(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('cart_items_pet')
      .select('quantity, price_at_time')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao calcular total do carrinho: ${error.message}`);
    }

    return data?.reduce((total, item) => total + (item.quantity * item.price_at_time), 0) || 0;
  }

  async getCartItemCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('cart_items_pet')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao contar itens do carrinho: ${error.message}`);
    }

    return count || 0;
  }

  async validateCartItems(userId: string): Promise<{ valid: boolean; errors: string[] }> {
    const cartItems = await this.getCartItems(userId);
    const errors: string[] = [];

    for (const item of cartItems) {
      const product = item.products_pet as any;
      
      if (!product) {
        errors.push(`Produto ${item.product_id} não encontrado`);
        continue;
      }

      if (!product.is_active) {
        errors.push(`Produto ${product.name} não está mais disponível`);
      }

      if (product.stock < item.quantity) {
        errors.push(`Estoque insuficiente para ${product.name}`);
      }

      if (product.price !== item.price_at_time) {
        errors.push(`Preço do produto ${product.name} foi alterado`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async syncCartWithInventory(userId: string): Promise<void> {
    const cartItems = await this.getCartItems(userId);
    
    for (const item of cartItems) {
      const product = item.products_pet as any;
      
      if (!product || !product.is_active || product.stock < item.quantity) {
        await this.removeFromCart(item.id);
      } else if (product.price !== item.price_at_time) {
        await this.updateCartItem(item.id, { price_at_time: product.price });
      }
    }
  }
}

export const cartService = new CartService();
export type { CartItem, CartItemInsert, CartItemUpdate };
