import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Order = Database['public']['Tables']['orders_pet']['Row'];
type OrderInsert = Database['public']['Tables']['orders_pet']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders_pet']['Update'];

type OrderItem = Database['public']['Tables']['order_items_pet']['Row'];
type OrderItemInsert = Database['public']['Tables']['order_items_pet']['Insert'];

export class OrdersService {
  async getOrders(userId: string, limit: number = 50): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders_pet')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar pedidos: ${error.message}`);
    }

    return data || [];
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders_pet')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar pedido: ${error.message}`);
    }

    return data;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const { data, error } = await supabase
      .from('order_items_pet')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar itens do pedido: ${error.message}`);
    }

    return data || [];
  }

  async createOrder(orderData: OrderInsert, orderItems: OrderItemInsert[]): Promise<Order> {
    const { data: order, error: orderError } = await supabase
      .from('orders_pet')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      throw new Error(`Erro ao criar pedido: ${orderError.message}`);
    }

    // Adicionar itens do pedido
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabase
      .from('order_items_pet')
      .insert(itemsWithOrderId);

    if (itemsError) {
      // Se falhar ao adicionar itens, deletar o pedido
      await supabase.from('orders_pet').delete().eq('id', order.id);
      throw new Error(`Erro ao adicionar itens ao pedido: ${itemsError.message}`);
    }

    return order;
  }

  async updateOrder(orderId: string, updates: OrderUpdate): Promise<Order> {
    const { data, error } = await supabase
      .from('orders_pet')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar pedido: ${error.message}`);
    }

    return data;
  }

  async cancelOrder(orderId: string): Promise<Order> {
    return this.updateOrder(orderId, { 
      status: 'cancelled',
      payment_status: 'refunded'
    });
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return this.updateOrder(orderId, { status });
  }

  async updatePaymentStatus(orderId: string, paymentStatus: string): Promise<Order> {
    return this.updateOrder(orderId, { payment_status: paymentStatus });
  }

  async addTrackingCode(orderId: string, trackingCode: string): Promise<Order> {
    return this.updateOrder(orderId, { 
      tracking_code: trackingCode,
      status: 'shipped'
    });
  }

  async markAsDelivered(orderId: string): Promise<Order> {
    return this.updateOrder(orderId, { 
      status: 'delivered',
      delivered_at: new Date().toISOString()
    });
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders_pet')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar pedido por número: ${error.message}`);
    }

    return data;
  }

  async getOrdersByStatus(userId: string, status: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders_pet')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar pedidos por status: ${error.message}`);
    }

    return data || [];
  }

  async getOrderStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    completedOrders: number;
  }> {
    const { data: orders, error } = await supabase
      .from('orders_pet')
      .select('status, final_amount')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao buscar estatísticas do pedido: ${error.message}`);
    }

    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, order) => sum + order.final_amount, 0) || 0;
    const pendingOrders = orders?.filter(order => ['pending', 'confirmed', 'processing'].includes(order.status)).length || 0;
    const completedOrders = orders?.filter(order => order.status === 'delivered').length || 0;

    return {
      totalOrders,
      totalSpent,
      pendingOrders,
      completedOrders
    };
  }

  async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PET${timestamp.slice(-6)}${random}`;
  }

  async createOrderFromCart(
    userId: string, 
    cartItems: unknown[], 
    shippingAddress: unknown, 
    billingAddress?: unknown,
    couponCode?: string
  ): Promise<Order> {
    // Validar itens do carrinho
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Carrinho vazio');
    }

    // Calcular totais
    const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.price_at_time), 0);
    const shippingCost = subtotal >= 100 ? 0 : 15; // Frete grátis acima de R$ 100
    
    // Aplicar cupom se fornecido
    let discountAmount = 0;
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from('coupons_pet')
        .select('*')
        .eq('code', couponCode)
        .eq('is_active', true)
        .single();

      if (coupon && !couponError) {
        if (subtotal >= coupon.min_order_amount) {
          if (coupon.type === 'percentage') {
            discountAmount = (subtotal * coupon.value) / 100;
            if (coupon.max_discount_amount) {
              discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
            }
          } else if (coupon.type === 'fixed_amount') {
            discountAmount = coupon.value;
          } else if (coupon.type === 'free_shipping') {
            discountAmount = shippingCost;
          }
        }
      }
    }

    const finalAmount = subtotal + shippingCost - discountAmount;

    // Criar pedido
    const orderNumber = await this.generateOrderNumber();
    const orderData: OrderInsert = {
      user_id: userId,
      order_number: orderNumber,
      status: 'pending',
      total_amount: subtotal,
      shipping_cost: shippingCost,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      payment_status: 'pending',
      shipping_address: shippingAddress,
      billing_address: billingAddress || shippingAddress
    };

    // Criar itens do pedido
    const orderItems: OrderItemInsert[] = cartItems.map(item => ({
      product_id: item.product_id,
      product_name: item.products_pet?.name || 'Produto',
      product_description: item.products_pet?.description || '',
      product_image_url: item.products_pet?.image_url || '',
      quantity: item.quantity,
      unit_price: item.price_at_time,
      total_price: item.quantity * item.price_at_time
    }));

    // Criar pedido
    const order = await this.createOrder(orderData, orderItems);

    // Limpar carrinho
    await supabase.from('cart_items_pet').delete().eq('user_id', userId);

    // Registrar uso do cupom se aplicado
    if (couponCode && discountAmount > 0) {
      const { data: coupon } = await supabase
        .from('coupons_pet')
        .select('id')
        .eq('code', couponCode)
        .single();

      if (coupon) {
        await supabase.from('coupon_usage_pet').insert({
          user_id: userId,
          coupon_id: coupon.id,
          order_id: order.id,
          discount_amount: discountAmount
        });

        // Atualizar contador de uso do cupom
        await supabase
          .from('coupons_pet')
          .update({ used_count: supabase.raw('used_count + 1') })
          .eq('id', coupon.id);
      }
    }

    return order;
  }
}

export const ordersService = new OrdersService();
export type { Order, OrderInsert, OrderUpdate, OrderItem, OrderItemInsert };
