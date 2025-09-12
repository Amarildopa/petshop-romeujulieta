import { describe, it, expect, vi, beforeEach } from 'vitest'
import { productsService } from '../productsService'
import { supabase } from '../../lib/supabase'

// Mock do Supabase
vi.mock('../../lib/supabase', () => {
  const mockSelect = vi.fn()
  const mockFrom = vi.fn()
  const mockEq = vi.fn()
  const mockOr = vi.fn()
  const mockOrder = vi.fn()
  const mockSingle = vi.fn()

  return {
    supabase: {
      from: mockFrom
    },
    mockFrom,
    mockSelect,
    mockEq,
    mockOr,
    mockOrder,
    mockSingle
  }
})

const {
  mockFrom,
  mockSelect,
  mockEq,
  mockOr,
  mockOrder,
  mockSingle
} = vi.mocked(await import('../../lib/supabase'))

describe('productsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [
        {
          id: '1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          name: 'Ração Premium',
          description: 'Ração de alta qualidade',
          price: 89.99,
          original_price: 99.99,
          category: 'food',
          image_url: 'https://example.com/image.jpg',
          in_stock: true,
          rating: 4.5,
          reviews_count: 10,
          badge: 'bestseller'
        },
        {
          id: '2',
          created_at: '2024-01-02',
          updated_at: '2024-01-02',
          name: 'Brinquedo Interativo',
          description: 'Brinquedo para estimular o pet',
          price: 29.99,
          original_price: null,
          category: 'toys',
          image_url: null,
          in_stock: true,
          rating: 4.0,
          reviews_count: 5,
          badge: null
        }
      ]

      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: mockProducts, error: null })
        })
      })

      const result = await productsService.getProducts()

      expect(mockFrom).toHaveBeenCalledWith('products_pet')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockProducts)
    })

    it('should throw error when database error occurs', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: null, error: { message: 'Database error' } })
        })
      })

      await expect(productsService.getProducts()).rejects.toThrow(
        'Error fetching products: Database error'
      )
    })

    it('should return empty array when no data', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: null, error: null })
        })
      })

      const result = await productsService.getProducts()

      expect(result).toEqual([])
    })
  })

  describe('getProductsByCategory', () => {
    it('should return products filtered by category', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Ração Premium',
          category: 'food',
          price: 89.99
        }
      ]

      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            order: mockOrder.mockResolvedValue({ data: mockProducts, error: null })
          })
        })
      })

      const result = await productsService.getProductsByCategory('food')

      expect(mockFrom).toHaveBeenCalledWith('products_pet')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('category', 'food')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockProducts)
    })

    it('should throw error when database error occurs', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            order: mockOrder.mockResolvedValue({ data: null, error: { message: 'Category error' } })
          })
        })
      })

      await expect(productsService.getProductsByCategory('food')).rejects.toThrow(
        'Error fetching products by category: Category error'
      )
    })

    it('should return empty array when no products in category', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            order: mockOrder.mockResolvedValue({ data: null, error: null })
          })
        })
      })

      const result = await productsService.getProductsByCategory('nonexistent')

      expect(result).toEqual([])
    })
  })

  describe('searchProducts', () => {
    it('should return products matching search query', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Ração Premium',
          description: 'Ração de alta qualidade',
          price: 89.99
        }
      ]

      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          or: mockOr.mockReturnValue({
            order: mockOrder.mockResolvedValue({ data: mockProducts, error: null })
          })
        })
      })

      const result = await productsService.searchProducts('ração')

      expect(mockFrom).toHaveBeenCalledWith('products_pet')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOr).toHaveBeenCalledWith('name.ilike.%ração%,description.ilike.%ração%')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockProducts)
    })

    it('should throw error when search fails', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          or: mockOr.mockReturnValue({
            order: mockOrder.mockResolvedValue({ data: null, error: { message: 'Search error' } })
          })
        })
      })

      await expect(productsService.searchProducts('test')).rejects.toThrow(
        'Error searching products: Search error'
      )
    })

    it('should return empty array when no matches found', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          or: mockOr.mockReturnValue({
            order: mockOrder.mockResolvedValue({ data: null, error: null })
          })
        })
      })

      const result = await productsService.searchProducts('nonexistent')

      expect(result).toEqual([])
    })

    it('should handle special characters in search query', async () => {
      const mockProducts = []

      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          or: mockOr.mockReturnValue({
            order: mockOrder.mockResolvedValue({ data: mockProducts, error: null })
          })
        })
      })

      const result = await productsService.searchProducts('test & special')

      expect(mockOr).toHaveBeenCalledWith('name.ilike.%test & special%,description.ilike.%test & special%')
      expect(result).toEqual([])
    })
  })

  describe('getProductById', () => {
    it('should return product by ID', async () => {
      const mockProduct = {
        id: '1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        name: 'Ração Premium',
        description: 'Ração de alta qualidade',
        price: 89.99,
        original_price: 99.99,
        category: 'food',
        image_url: 'https://example.com/image.jpg',
        in_stock: true,
        rating: 4.5,
        reviews_count: 10,
        badge: 'bestseller'
      }

      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: mockProduct, error: null })
          })
        })
      })

      const result = await productsService.getProductById('1')

      expect(mockFrom).toHaveBeenCalledWith('products_pet')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(mockSingle).toHaveBeenCalled()
      expect(result).toEqual(mockProduct)
    })

    it('should throw error when product not found', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: null, error: { message: 'Product not found' } })
          })
        })
      })

      await expect(productsService.getProductById('nonexistent')).rejects.toThrow(
        'Error fetching product: Product not found'
      )
    })

    it('should throw error when database error occurs', async () => {
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: null, error: { message: 'Database connection failed' } })
          })
        })
      })

      await expect(productsService.getProductById('1')).rejects.toThrow(
        'Error fetching product: Database connection failed'
      )
    })
  })
})