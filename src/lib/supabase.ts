import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificar se as variáveis existem
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      profiles_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          email: string
          phone: string
          address: string
          cep: string
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          email: string
          phone: string
          address: string
          cep: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          email?: string
          phone?: string
          address?: string
          cep?: string
          avatar_url?: string | null
        }
      }
      pets_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          owner_id: string
          name: string
          species: string
          breed: string
          age: string
          weight: string
          height: string
          color: string
          gender: string
          image_url: string | null
          personality: string[]
          allergies: string[]
          medications: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          owner_id: string
          name: string
          species: string
          breed: string
          age: string
          weight: string
          height: string
          color: string
          gender: string
          image_url?: string | null
          personality?: string[]
          allergies?: string[]
          medications?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          owner_id?: string
          name?: string
          species?: string
          breed?: string
          age?: string
          weight?: string
          height?: string
          color?: string
          gender?: string
          image_url?: string | null
          personality?: string[]
          allergies?: string[]
          medications?: string[]
        }
      }
      services_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          price: number
          duration: string
          category: string
          image_url: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          price: number
          duration: string
          category: string
          image_url?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          price?: number
          duration?: string
          category?: string
          image_url?: string | null
          is_active?: boolean
        }
      }
      appointments_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          pet_id: string
          service_id: string
          appointment_date: string
          appointment_time: string
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          notes: string | null
          total_price: number
          extras: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          pet_id: string
          service_id: string
          appointment_date: string
          appointment_time: string
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          total_price: number
          extras?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          pet_id?: string
          service_id?: string
          appointment_date?: string
          appointment_time?: string
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          total_price?: number
          extras?: string[]
        }
      }
      products_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          price: number
          original_price: number | null
          category: string
          image_url: string | null
          in_stock: boolean
          rating: number
          reviews_count: number
          badge: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          price: number
          original_price?: number | null
          category: string
          image_url?: string | null
          in_stock?: boolean
          rating?: number
          reviews_count?: number
          badge?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          price?: number
          original_price?: number | null
          category?: string
          image_url?: string | null
          in_stock?: boolean
          rating?: number
          reviews_count?: number
          badge?: string | null
        }
      }
      subscriptions_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          plan_type: 'basic' | 'premium' | 'vip'
          status: 'active' | 'inactive' | 'cancelled'
          billing_cycle: 'monthly' | 'yearly'
          next_billing_date: string
          services_used: number
          services_limit: number
          cashback_accumulated: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          plan_type: 'basic' | 'premium' | 'vip'
          status?: 'active' | 'inactive' | 'cancelled'
          billing_cycle: 'monthly' | 'yearly'
          next_billing_date: string
          services_used?: number
          services_limit: number
          cashback_accumulated?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          plan_type?: 'basic' | 'premium' | 'vip'
          status?: 'active' | 'inactive' | 'cancelled'
          billing_cycle?: 'monthly' | 'yearly'
          next_billing_date?: string
          services_used?: number
          services_limit?: number
          cashback_accumulated?: number
        }
      }
      available_slots_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          service_id: string
          date: string
          start_time: string
          end_time: string
          is_available: boolean
          max_appointments: number
          current_appointments: number
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          service_id: string
          date: string
          start_time: string
          end_time: string
          is_available?: boolean
          max_appointments?: number
          current_appointments?: number
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          service_id?: string
          date?: string
          start_time?: string
          end_time?: string
          is_available?: boolean
          max_appointments?: number
          current_appointments?: number
          created_by?: string
        }
      }
      care_extras_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          price: number
          duration_minutes: number
          is_active: boolean
          category: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          price?: number
          duration_minutes?: number
          is_active?: boolean
          category?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          price?: number
          duration_minutes?: number
          is_active?: boolean
          category?: string
        }
      }
      service_history_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          appointment_id: string
          pet_id: string
          service_id: string
          service_name: string
          service_price: number
          rating: number | null
          notes: string | null
          photos: string[] | null
          completed_at: string | null
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          appointment_id: string
          pet_id: string
          service_id: string
          service_name: string
          service_price: number
          rating?: number | null
          notes?: string | null
          photos?: string[] | null
          completed_at?: string | null
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          appointment_id?: string
          pet_id?: string
          service_id?: string
          service_name?: string
          service_price?: number
          rating?: number | null
          notes?: string | null
          photos?: string[] | null
          completed_at?: string | null
          created_by?: string
        }
      }
      notifications_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          read_at: string | null
          data: unknown | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          read_at?: string | null
          data?: unknown | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          read_at?: string | null
          data?: unknown | null
          expires_at?: string | null
        }
      }
      notification_settings_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          email_enabled: boolean
          push_enabled: boolean
          sms_enabled: boolean
          whatsapp_enabled: boolean
          appointment_reminders: boolean
          promotion_notifications: boolean
          system_notifications: boolean
          reminder_hours_before: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          email_enabled?: boolean
          push_enabled?: boolean
          sms_enabled?: boolean
          whatsapp_enabled?: boolean
          appointment_reminders?: boolean
          promotion_notifications?: boolean
          system_notifications?: boolean
          reminder_hours_before?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          email_enabled?: boolean
          push_enabled?: boolean
          sms_enabled?: boolean
          whatsapp_enabled?: boolean
          appointment_reminders?: boolean
          promotion_notifications?: boolean
          system_notifications?: boolean
          reminder_hours_before?: number
        }
      }
      cart_items_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          product_id: string
          quantity: number
          price_at_time: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          product_id: string
          quantity?: number
          price_at_time: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          product_id?: string
          quantity?: number
          price_at_time?: number
        }
      }
      orders_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          order_number: string
          status: string
          total_amount: number
          shipping_cost: number
          discount_amount: number
          final_amount: number
          payment_method: string | null
          payment_status: string
          shipping_address: Record<string, unknown>
          billing_address: Record<string, unknown> | null
          notes: string | null
          tracking_code: string | null
          estimated_delivery: string | null
          delivered_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          order_number: string
          status?: string
          total_amount: number
          shipping_cost?: number
          discount_amount?: number
          final_amount: number
          payment_method?: string | null
          payment_status?: string
          shipping_address: Record<string, unknown>
          billing_address?: Record<string, unknown> | null
          notes?: string | null
          tracking_code?: string | null
          estimated_delivery?: string | null
          delivered_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          order_number?: string
          status?: string
          total_amount?: number
          shipping_cost?: number
          discount_amount?: number
          final_amount?: number
          payment_method?: string | null
          payment_status?: string
          shipping_address?: Record<string, unknown>
          billing_address?: Record<string, unknown> | null
          notes?: string | null
          tracking_code?: string | null
          estimated_delivery?: string | null
          delivered_at?: string | null
        }
      }
      order_items_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          order_id: string
          product_id: string
          product_name: string
          product_description: string | null
          product_image_url: string | null
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          order_id: string
          product_id: string
          product_name: string
          product_description?: string | null
          product_image_url?: string | null
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_description?: string | null
          product_image_url?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
      coupons_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          code: string
          name: string
          description: string | null
          type: string
          value: number
          min_order_amount: number
          max_discount_amount: number | null
          usage_limit: number | null
          used_count: number
          is_active: boolean
          valid_from: string
          valid_until: string | null
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          code: string
          name: string
          description?: string | null
          type: string
          value: number
          min_order_amount?: number
          max_discount_amount?: number | null
          usage_limit?: number | null
          used_count?: number
          is_active?: boolean
          valid_from?: string
          valid_until?: string | null
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          code?: string
          name?: string
          description?: string | null
          type?: string
          value?: number
          min_order_amount?: number
          max_discount_amount?: number | null
          usage_limit?: number | null
          used_count?: number
          is_active?: boolean
          valid_from?: string
          valid_until?: string | null
          created_by?: string
        }
      }
      product_reviews_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          product_id: string
          user_id: string
          order_id: string
          rating: number
          title: string | null
          comment: string | null
          is_verified_purchase: boolean
          is_helpful_count: number
          is_approved: boolean
          response: string | null
          response_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          product_id: string
          user_id: string
          order_id: string
          rating: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          is_helpful_count?: number
          is_approved?: boolean
          response?: string | null
          response_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          product_id?: string
          user_id?: string
          order_id?: string
          rating?: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          is_helpful_count?: number
          is_approved?: boolean
          response?: string | null
          response_date?: string | null
        }
      }
      wishlist_pet: {
        Row: {
          id: string
          created_at: string
          user_id: string
          product_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          product_id: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          product_id?: string
        }
      }
      product_categories_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          meta_title: string | null
          meta_description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
        }
      }
      inventory_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          product_id: string
          current_stock: number
          reserved_stock: number
          min_stock_level: number
          max_stock_level: number | null
          reorder_point: number
          last_restocked_at: string | null
          last_sold_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          product_id: string
          current_stock?: number
          reserved_stock?: number
          min_stock_level?: number
          max_stock_level?: number | null
          reorder_point?: number
          last_restocked_at?: string | null
          last_sold_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          product_id?: string
          current_stock?: number
          reserved_stock?: number
          min_stock_level?: number
          max_stock_level?: number | null
          reorder_point?: number
          last_restocked_at?: string | null
          last_sold_at?: string | null
        }
      }
      subscription_plans_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          price: number
          billing_cycle: string
          features: Record<string, unknown>
          max_pets: number
          max_appointments: number
          max_products_discount: number
          free_delivery: boolean
          priority_support: boolean
          is_active: boolean
          sort_order: number
          stripe_price_id: string | null
          pagseguro_plan_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          price: number
          billing_cycle: string
          features: Record<string, unknown>
          max_pets?: number
          max_appointments?: number
          max_products_discount?: number
          free_delivery?: boolean
          priority_support?: boolean
          is_active?: boolean
          sort_order?: number
          stripe_price_id?: string | null
          pagseguro_plan_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          price?: number
          billing_cycle?: string
          features?: Record<string, unknown>
          max_pets?: number
          max_appointments?: number
          max_products_discount?: number
          free_delivery?: boolean
          priority_support?: boolean
          is_active?: boolean
          sort_order?: number
          stripe_price_id?: string | null
          pagseguro_plan_id?: string | null
        }
      }
      user_subscriptions_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          plan_id: string
          status: string
          start_date: string
          end_date: string | null
          next_billing_date: string | null
          billing_cycle: string
          price: number
          payment_method: string | null
          auto_renew: boolean
          cancelled_at: string | null
          cancellation_reason: string | null
          stripe_subscription_id: string | null
          pagseguro_subscription_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          plan_id: string
          status?: string
          start_date?: string
          end_date?: string | null
          next_billing_date?: string | null
          billing_cycle: string
          price: number
          payment_method?: string | null
          auto_renew?: boolean
          cancelled_at?: string | null
          cancellation_reason?: string | null
          stripe_subscription_id?: string | null
          pagseguro_subscription_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          plan_id?: string
          status?: string
          start_date?: string
          end_date?: string | null
          next_billing_date?: string | null
          billing_cycle?: string
          price?: number
          payment_method?: string | null
          auto_renew?: boolean
          cancelled_at?: string | null
          cancellation_reason?: string | null
          stripe_subscription_id?: string | null
          pagseguro_subscription_id?: string | null
        }
      }
      payment_history_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          subscription_id: string | null
          order_id: string | null
          amount: number
          currency: string
          payment_method: string
          payment_status: string
          payment_provider: string
          external_payment_id: string | null
          transaction_id: string | null
          payment_date: string | null
          failure_reason: string | null
          refund_amount: number
          refund_date: string | null
          metadata: Record<string, unknown> | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          subscription_id?: string | null
          order_id?: string | null
          amount: number
          currency?: string
          payment_method: string
          payment_status: string
          payment_provider: string
          external_payment_id?: string | null
          transaction_id?: string | null
          payment_date?: string | null
          failure_reason?: string | null
          refund_amount?: number
          refund_date?: string | null
          metadata?: Record<string, unknown> | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          subscription_id?: string | null
          order_id?: string | null
          amount?: number
          currency?: string
          payment_method?: string
          payment_status?: string
          payment_provider?: string
          external_payment_id?: string | null
          transaction_id?: string | null
          payment_date?: string | null
          failure_reason?: string | null
          refund_amount?: number
          refund_date?: string | null
          metadata?: Record<string, unknown> | null
        }
      }
      saved_payment_methods_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          type: string
          provider: string
          external_id: string
          last_four_digits: string | null
          brand: string | null
          expiry_month: number | null
          expiry_year: number | null
          is_default: boolean
          is_active: boolean
          metadata: Record<string, unknown> | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          type: string
          provider: string
          external_id: string
          last_four_digits?: string | null
          brand?: string | null
          expiry_month?: number | null
          expiry_year?: number | null
          is_default?: boolean
          is_active?: boolean
          metadata?: Record<string, unknown> | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          type?: string
          provider?: string
          external_id?: string
          last_four_digits?: string | null
          brand?: string | null
          expiry_month?: number | null
          expiry_year?: number | null
          is_default?: boolean
          is_active?: boolean
          metadata?: Record<string, unknown> | null
        }
      }
      cashback_transactions_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          order_id: string
          amount: number
          percentage: number
          status: string
          expires_at: string | null
          used_at: string | null
          used_order_id: string | null
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          order_id: string
          amount: number
          percentage: number
          status?: string
          expires_at?: string | null
          used_at?: string | null
          used_order_id?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          order_id?: string
          amount?: number
          percentage?: number
          status?: string
          expires_at?: string | null
          used_at?: string | null
          used_order_id?: string | null
          description?: string | null
        }
      }
      promotions_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          type: string
          value: number
          value_type: string
          min_order_amount: number
          max_discount_amount: number | null
          applicable_to: string
          target_audience: string
          start_date: string
          end_date: string | null
          usage_limit: number | null
          used_count: number
          is_active: boolean
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          type: string
          value: number
          value_type: string
          min_order_amount?: number
          max_discount_amount?: number | null
          applicable_to?: string
          target_audience?: string
          start_date?: string
          end_date?: string | null
          usage_limit?: number | null
          used_count?: number
          is_active?: boolean
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          type?: string
          value?: number
          value_type?: string
          min_order_amount?: number
          max_discount_amount?: number | null
          applicable_to?: string
          target_audience?: string
          start_date?: string
          end_date?: string | null
          usage_limit?: number | null
          used_count?: number
          is_active?: boolean
          created_by?: string
        }
      }
      chat_messages_pet: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          chat_room_id: string
          sender_id: string
          message_type: string
          content: string
          file_url: string | null
          file_name: string | null
          file_size: number | null
          is_read: boolean
          read_at: string | null
          is_edited: boolean
          edited_at: string | null
          reply_to_id: string | null
          metadata: Record<string, unknown> | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          chat_room_id: string
          sender_id: string
          message_type?: string
          content: string
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          is_read?: boolean
          read_at?: string | null
          is_edited?: boolean
          edited_at?: string | null
          reply_to_id?: string | null
          metadata?: Record<string, unknown> | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          chat_room_id?: string
          sender_id?: string
          message_type?: string
          content?: string
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          is_read?: boolean
          read_at?: string | null
          is_edited?: boolean
          edited_at?: string | null
          reply_to_id?: string | null
          metadata?: Record<string, unknown> | null
        }
      }
      // =============================================
      // TABELAS ADMINISTRATIVAS
      // =============================================
      admin_users_pet: {
        Row: {
          id: string
          user_id: string
          role: string
          permissions: Record<string, unknown>
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: string
          permissions?: Record<string, unknown>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          permissions?: Record<string, unknown>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admin_logs_pet: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          details: Record<string, unknown>
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          details?: Record<string, unknown>
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          details?: Record<string, unknown>
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      system_settings_pet: {
        Row: {
          id: string
          key: string
          value: unknown
          description: string | null
          category: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: unknown
          description?: string | null
          category?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: unknown
          description?: string | null
          category?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admin_reports_pet: {
        Row: {
          id: string
          name: string
          type: string
          parameters: Record<string, unknown>
          data: unknown
          generated_by: string | null
          generated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          parameters?: Record<string, unknown>
          data?: unknown
          generated_by?: string | null
          generated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          parameters?: Record<string, unknown>
          data?: unknown
          generated_by?: string | null
          generated_at?: string
          expires_at?: string | null
        }
      }
      admin_notifications_pet: {
        Row: {
          id: string
          title: string
          message: string
          type: string
          priority: string
          is_read: boolean
          admin_id: string
          action_url: string | null
          metadata: Record<string, unknown>
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          title: string
          message: string
          type: string
          priority?: string
          is_read?: boolean
          admin_id: string
          action_url?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          message?: string
          type?: string
          priority?: string
          is_read?: boolean
          admin_id?: string
          action_url?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          read_at?: string | null
        }
      }
      support_tickets_pet: {
        Row: {
          id: string
          user_id: string
          subject: string
          description: string
          status: string
          priority: string
          category: string
          assigned_to: string | null
          resolution: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          description: string
          status?: string
          priority?: string
          category: string
          assigned_to?: string | null
          resolution?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          description?: string
          status?: string
          priority?: string
          category?: string
          assigned_to?: string | null
          resolution?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
      support_messages_pet: {
        Row: {
          id: string
          ticket_id: string
          sender_id: string
          sender_type: string
          message: string
          attachments: unknown[]
          is_internal: boolean
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_id: string
          sender_type: string
          message: string
          attachments?: unknown[]
          is_internal?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          sender_id?: string
          sender_type?: string
          message?: string
          attachments?: unknown[]
          is_internal?: boolean
          created_at?: string
        }
      }
    }
  }
}
