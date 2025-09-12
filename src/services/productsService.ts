import { supabase } from '../lib/supabase'

export interface Product {
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

export const productsService = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products_pet')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`)
    }

    return data || []
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products_pet')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error fetching products by category: ${error.message}`)
    }

    return data || []
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products_pet')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error searching products: ${error.message}`)
    }

    return data || []
  },

  // Get a single product by ID
  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products_pet')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Error fetching product: ${error.message}`)
    }

    return data
  }
}
