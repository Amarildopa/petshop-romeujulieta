import { supabase } from '../lib/supabase';

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

export interface CreateProductData {
  name: string
  description: string
  price: number
  original_price?: number
  category: string
  image_url?: string
  in_stock?: boolean
  badge?: string
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string
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
  },

  // Create a new product
  async createProduct(productData: CreateProductData): Promise<Product> {
    const { data, error } = await supabase
      .from('products_pet')
      .insert({
        ...productData,
        in_stock: productData.in_stock ?? true,
        rating: 0,
        reviews_count: 0
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating product: ${error.message}`)
    }

    return data
  },

  // Update a product
  async updateProduct(id: string, updates: Partial<CreateProductData>): Promise<Product> {
    const { data, error } = await supabase
      .from('products_pet')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating product: ${error.message}`)
    }

    return data
  },

  // Delete a product
  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products_pet')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting product: ${error.message}`)
    }
  },

  // Get product categories
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products_pet')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      throw new Error(`Error fetching categories: ${error.message}`)
    }

    const categories = [...new Set(data?.map(item => item.category) || [])]
    return categories.sort()
  },

  // Upload product image
  async uploadProductImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      throw new Error(`Error uploading image: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicUrl
  }
}
