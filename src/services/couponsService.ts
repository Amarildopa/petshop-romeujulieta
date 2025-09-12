import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Coupon = Database['public']['Tables']['coupons_pet']['Row'];
type CouponInsert = Database['public']['Tables']['coupons_pet']['Insert'];
type CouponUpdate = Database['public']['Tables']['coupons_pet']['Update'];

type CouponUsage = Database['public']['Tables']['coupon_usage_pet']['Row'];

export class CouponsService {
  async getActiveCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons_pet')
      .select('*')
      .eq('is_active', true)
      .gte('valid_from', new Date().toISOString())
      .lte('valid_until', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar cupons ativos: ${error.message}`);
    }

    return data || [];
  }

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from('coupons_pet')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar cupom: ${error.message}`);
    }

    return data;
  }

  async validateCoupon(code: string, orderAmount: number, userId: string): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discountAmount: number;
    error?: string;
  }> {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) {
      return {
        valid: false,
        discountAmount: 0,
        error: 'Cupom não encontrado'
      };
    }

    // Verificar se o cupom está dentro do período de validade
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

    if (now < validFrom) {
      return {
        valid: false,
        discountAmount: 0,
        error: 'Cupom ainda não está válido'
      };
    }

    if (validUntil && now > validUntil) {
      return {
        valid: false,
        discountAmount: 0,
        error: 'Cupom expirado'
      };
    }

    // Verificar valor mínimo do pedido
    if (orderAmount < coupon.min_order_amount) {
      return {
        valid: false,
        discountAmount: 0,
        error: `Valor mínimo do pedido deve ser R$ ${coupon.min_order_amount.toFixed(2)}`
      };
    }

    // Verificar limite de uso
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return {
        valid: false,
        discountAmount: 0,
        error: 'Cupom esgotado'
      };
    }

    // Verificar se o usuário já usou este cupom
    const { data: usage, error: usageError } = await supabase
      .from('coupon_usage_pet')
      .select('id')
      .eq('user_id', userId)
      .eq('coupon_id', coupon.id)
      .single();

    if (usage && !usageError) {
      return {
        valid: false,
        discountAmount: 0,
        error: 'Você já utilizou este cupom'
      };
    }

    // Calcular desconto
    let discountAmount = 0;
    
    if (coupon.type === 'percentage') {
      discountAmount = (orderAmount * coupon.value) / 100;
      if (coupon.max_discount_amount) {
        discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
      }
    } else if (coupon.type === 'fixed_amount') {
      discountAmount = coupon.value;
    } else if (coupon.type === 'free_shipping') {
      // Para frete grátis, o desconto será aplicado no valor do frete
      discountAmount = 0; // Será calculado no momento do checkout
    }

    return {
      valid: true,
      coupon,
      discountAmount
    };
  }

  async createCoupon(coupon: CouponInsert): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons_pet')
      .insert({
        ...coupon,
        code: coupon.code.toUpperCase()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar cupom: ${error.message}`);
    }

    return data;
  }

  async updateCoupon(id: string, updates: CouponUpdate): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons_pet')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar cupom: ${error.message}`);
    }

    return data;
  }

  async deleteCoupon(id: string): Promise<void> {
    const { error } = await supabase
      .from('coupons_pet')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar cupom: ${error.message}`);
    }
  }

  async toggleCouponStatus(id: string): Promise<Coupon> {
    const { data: current, error: fetchError } = await supabase
      .from('coupons_pet')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Erro ao buscar status do cupom: ${fetchError.message}`);
    }

    const { data, error } = await supabase
      .from('coupons_pet')
      .update({ is_active: !current.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao alterar status do cupom: ${error.message}`);
    }

    return data;
  }

  async getCouponUsage(couponId: string): Promise<CouponUsage[]> {
    const { data, error } = await supabase
      .from('coupon_usage_pet')
      .select(`
        *,
        profiles_pet (
          full_name,
          email
        )
      `)
      .eq('coupon_id', couponId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar uso do cupom: ${error.message}`);
    }

    return data || [];
  }

  async getUserCouponUsage(userId: string): Promise<CouponUsage[]> {
    const { data, error } = await supabase
      .from('coupon_usage_pet')
      .select(`
        *,
        coupons_pet (
          code,
          name,
          type,
          value
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar uso de cupons do usuário: ${error.message}`);
    }

    return data || [];
  }

  async getCouponStats(couponId: string): Promise<{
    totalUsage: number;
    totalDiscount: number;
    uniqueUsers: number;
  }> {
    const { data, error } = await supabase
      .from('coupon_usage_pet')
      .select('discount_amount, user_id')
      .eq('coupon_id', couponId);

    if (error) {
      throw new Error(`Erro ao buscar estatísticas do cupom: ${error.message}`);
    }

    const totalUsage = data?.length || 0;
    const totalDiscount = data?.reduce((sum, usage) => sum + usage.discount_amount, 0) || 0;
    const uniqueUsers = new Set(data?.map(usage => usage.user_id)).size;

    return {
      totalUsage,
      totalDiscount,
      uniqueUsers
    };
  }

  async generateCouponCode(prefix: string = 'PET'): Promise<string> {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  async createBulkCoupons(
    count: number, 
    type: string, 
    value: number, 
    createdBy: string,
    prefix: string = 'PET'
  ): Promise<Coupon[]> {
    const coupons: CouponInsert[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = await this.generateCouponCode(prefix);
      coupons.push({
        code,
        name: `Cupom ${type} - ${value}`,
        description: `Cupom gerado automaticamente`,
        type,
        value,
        min_order_amount: 0,
        is_active: true,
        created_by: createdBy
      });
    }

    const { data, error } = await supabase
      .from('coupons_pet')
      .insert(coupons)
      .select();

    if (error) {
      throw new Error(`Erro ao criar cupons em lote: ${error.message}`);
    }

    return data || [];
  }
}

export const couponsService = new CouponsService();
export type { Coupon, CouponInsert, CouponUpdate, CouponUsage };
