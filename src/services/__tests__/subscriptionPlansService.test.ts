import { describe, it, expect, vi, beforeEach } from 'vitest'
import { subscriptionPlansService } from '../subscriptionPlansService'
import { supabase } from '../../lib/supabase'

// Mock do Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      then: vi.fn()
    }))
  }
}))

// Interfaces para tipagem dos mocks
interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>
}

const mockSupabase = supabase as MockSupabaseClient

describe('SubscriptionPlansService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getActivePlans', () => {
    it('should return active subscription plans', async () => {
      const mockPlans = [
        {
          id: 'plan1',
          name: 'Basic Plan',
          price: 29.99,
          billing_cycle: 'monthly',
          is_active: true,
          sort_order: 1
        },
        {
          id: 'plan2',
          name: 'Premium Plan',
          price: 59.99,
          billing_cycle: 'monthly',
          is_active: true,
          sort_order: 2
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockPlans,
              error: null
            })
          })
        })
      })

      const result = await subscriptionPlansService.getActivePlans()

      expect(mockSupabase.from).toHaveBeenCalledWith('subscription_plans_pet')
      expect(result).toEqual(mockPlans)
    })

    it('should throw error when database query fails', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      })

      await expect(subscriptionPlansService.getActivePlans()).rejects.toThrow('Erro ao buscar planos de assinatura: Database error')
    })

    it('should return empty array when no plans found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      })

      const result = await subscriptionPlansService.getActivePlans()
      expect(result).toEqual([])
    })
  })

  describe('getPlanById', () => {
    it('should return specific plan', async () => {
      const mockPlan = {
        id: 'plan1',
        name: 'Basic Plan',
        price: 29.99,
        billing_cycle: 'monthly'
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockPlan,
              error: null
            })
          })
        })
      })

      const result = await subscriptionPlansService.getPlanById('plan1')

      expect(mockSupabase.from).toHaveBeenCalledWith('subscription_plans_pet')
      expect(result).toEqual(mockPlan)
    })

    it('should return null when plan not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      })

      const result = await subscriptionPlansService.getPlanById('nonexistent')
      expect(result).toBeNull()
    })

    it('should throw error for other database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error', code: 'OTHER' }
            })
          })
        })
      })

      await expect(subscriptionPlansService.getPlanById('plan1')).rejects.toThrow('Erro ao buscar plano de assinatura: Database error')
    })
  })

  describe('getPlansByBillingCycle', () => {
    it('should return plans filtered by billing cycle', async () => {
      const mockPlans = [
        {
          id: 'plan1',
          name: 'Monthly Basic',
          billing_cycle: 'monthly',
          price: 29.99
        },
        {
          id: 'plan2',
          name: 'Monthly Premium',
          billing_cycle: 'monthly',
          price: 59.99
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockPlans,
                error: null
              })
            })
          })
        })
      })

      const result = await subscriptionPlansService.getPlansByBillingCycle('monthly')

      expect(mockSupabase.from).toHaveBeenCalledWith('subscription_plans_pet')
      expect(result).toEqual(mockPlans)
    })

    it('should throw error when query fails', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Query failed' }
              })
            })
          })
        })
      })

      await expect(subscriptionPlansService.getPlansByBillingCycle('monthly')).rejects.toThrow('Erro ao buscar planos por ciclo de cobrança: Query failed')
    })

    it('should return empty array when no plans found for billing cycle', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: null
              })
            })
          })
        })
      })

      const result = await subscriptionPlansService.getPlansByBillingCycle('yearly')
      expect(result).toEqual([])
    })
  })

  describe('createPlan', () => {
    it('should create new subscription plan', async () => {
      const planData = {
        name: 'New Plan',
        description: 'A new subscription plan',
        price: 39.99,
        billing_cycle: 'monthly'
      }

      const mockCreatedPlan = {
        id: 'plan1',
        ...planData,
        created_at: '2024-01-01T10:00:00Z'
      }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCreatedPlan,
              error: null
            })
          })
        })
      })

      const result = await subscriptionPlansService.createPlan(planData)

      expect(mockSupabase.from).toHaveBeenCalledWith('subscription_plans_pet')
      expect(result).toEqual(mockCreatedPlan)
    })

    it('should throw error when creation fails', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Creation failed' }
            })
          })
        })
      })

      await expect(subscriptionPlansService.createPlan({})).rejects.toThrow('Erro ao criar plano de assinatura: Creation failed')
    })
  })

  describe('updatePlan', () => {
    it('should update subscription plan', async () => {
      const updates = { price: 49.99, name: 'Updated Plan' }
      const mockUpdatedPlan = {
        id: 'plan1',
        name: 'Updated Plan',
        price: 49.99,
        billing_cycle: 'monthly'
      }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUpdatedPlan,
                error: null
              })
            })
          })
        })
      })

      const result = await subscriptionPlansService.updatePlan('plan1', updates)

      expect(mockSupabase.from).toHaveBeenCalledWith('subscription_plans_pet')
      expect(result).toEqual(mockUpdatedPlan)
    })

    it('should throw error when update fails', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' }
              })
            })
          })
        })
      })

      await expect(subscriptionPlansService.updatePlan('plan1', {})).rejects.toThrow('Erro ao atualizar plano de assinatura: Update failed')
    })
  })

  describe('deletePlan', () => {
    it('should delete subscription plan', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null
          })
        })
      })

      await subscriptionPlansService.deletePlan('plan1')

      expect(mockSupabase.from).toHaveBeenCalledWith('subscription_plans_pet')
    })

    it('should throw error when deletion fails', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Deletion failed' }
          })
        })
      })

      await expect(subscriptionPlansService.deletePlan('plan1')).rejects.toThrow('Erro ao deletar plano de assinatura: Deletion failed')
    })
  })

  describe('togglePlanStatus', () => {
    it('should toggle plan status from active to inactive', async () => {
      const currentPlan = { is_active: true }
      const updatedPlan = {
        id: 'plan1',
        name: 'Test Plan',
        is_active: false
      }

      // Mock current status fetch
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValueOnce({
            data: currentPlan,
            error: null
          })
        })
      })

      // Mock status update
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValueOnce({
              data: updatedPlan,
              error: null
            })
          })
        })
      })

      mockSupabase.from.mockReturnValueOnce({ select: mockSelect })
      mockSupabase.from.mockReturnValueOnce({ update: mockUpdate })

      const result = await subscriptionPlansService.togglePlanStatus('plan1')

      expect(result.is_active).toBe(false)
    })

    it('should toggle plan status from inactive to active', async () => {
      const currentPlan = { is_active: false }
      const updatedPlan = {
        id: 'plan1',
        name: 'Test Plan',
        is_active: true
      }

      // Mock current status fetch
      const mockSelect2 = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValueOnce({
            data: currentPlan,
            error: null
          })
        })
      })

      // Mock status update
      const mockUpdate2 = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValueOnce({
              data: updatedPlan,
              error: null
            })
          })
        })
      })

      mockSupabase.from.mockReturnValueOnce({ select: mockSelect2 })
      mockSupabase.from.mockReturnValueOnce({ update: mockUpdate2 })

      const result = await subscriptionPlansService.togglePlanStatus('plan1')

      expect(result.is_active).toBe(true)
    })

    it('should throw error when fetching current status fails', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Fetch failed' }
            })
          })
        })
      })

      await expect(subscriptionPlansService.togglePlanStatus('plan1')).rejects.toThrow('Erro ao buscar status do plano: Fetch failed')
    })

    it('should throw error when updating status fails', async () => {
      // Mock successful fetch
      const mockSelect3 = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValueOnce({
            data: { is_active: true },
            error: null
          })
        })
      })

      // Mock failed update
      const mockUpdate3 = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValueOnce({
              data: null,
              error: { message: 'Update failed' }
            })
          })
        })
      })

      mockSupabase.from.mockReturnValueOnce({ select: mockSelect3 })
      mockSupabase.from.mockReturnValueOnce({ update: mockUpdate3 })

      await expect(subscriptionPlansService.togglePlanStatus('plan1')).rejects.toThrow('Erro ao alterar status do plano: Update failed')
    })
  })

  describe('getPlanFeatures', () => {
    it('should return plan features as array', async () => {
      const mockPlan = {
        id: 'plan1',
        name: 'Test Plan',
        features: ['Feature 1', 'Feature 2', 'Feature 3']
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockPlan,
              error: null
            })
          })
        })
      })

      const result = await subscriptionPlansService.getPlanFeatures('plan1')

      expect(result).toEqual(['Feature 1', 'Feature 2', 'Feature 3'])
    })

    it('should return empty array when features is not an array', async () => {
      const mockPlan = {
        id: 'plan1',
        name: 'Test Plan',
        features: null
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockPlan,
              error: null
            })
          })
        })
      })

      const result = await subscriptionPlansService.getPlanFeatures('plan1')

      expect(result).toEqual([])
    })

    it('should throw error when plan not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      })

      await expect(subscriptionPlansService.getPlanFeatures('nonexistent')).rejects.toThrow('Plano não encontrado')
    })
  })

  describe('comparePlans', () => {
    it('should return plans for comparison', async () => {
      const mockPlans = [
        {
          id: 'plan1',
          name: 'Basic Plan',
          price: 29.99
        },
        {
          id: 'plan2',
          name: 'Premium Plan',
          price: 59.99
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockPlans,
                error: null
              })
            })
          })
        })
      })

      const result = await subscriptionPlansService.comparePlans(['plan1', 'plan2'])

      expect(mockSupabase.from).toHaveBeenCalledWith('subscription_plans_pet')
      expect(result).toEqual(mockPlans)
    })

    it('should throw error when comparison fails', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Comparison failed' }
              })
            })
          })
        })
      })

      await expect(subscriptionPlansService.comparePlans(['plan1', 'plan2'])).rejects.toThrow('Erro ao comparar planos: Comparison failed')
    })

    it('should return empty array when no plans match', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: null
              })
            })
          })
        })
      })

      const result = await subscriptionPlansService.comparePlans(['nonexistent1', 'nonexistent2'])
      expect(result).toEqual([])
    })
  })

  describe('getRecommendedPlan', () => {
    it('should return cheapest suitable plan', async () => {
      const mockPlans = [
        {
          id: 'plan1',
          name: 'Basic Plan',
          price: 29.99,
          max_pets: 2,
          max_appointments: 5
        },
        {
          id: 'plan2',
          name: 'Premium Plan',
          price: 59.99,
          max_pets: 5,
          max_appointments: 10
        },
        {
          id: 'plan3',
          name: 'Standard Plan',
          price: 39.99,
          max_pets: 3,
          max_appointments: 8
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockPlans,
              error: null
            })
          })
        })
      })

      const result = await subscriptionPlansService.getRecommendedPlan(2, 5)

      expect(result).toEqual(mockPlans[0]) // Should return the cheapest suitable plan
    })

    it('should return null when no suitable plan found', async () => {
      const mockPlans = [
        {
          id: 'plan1',
          name: 'Basic Plan',
          price: 29.99,
          max_pets: 1,
          max_appointments: 2
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockPlans,
              error: null
            })
          })
        })
      })

      const result = await subscriptionPlansService.getRecommendedPlan(5, 10)

      expect(result).toBeNull()
    })

    it('should return most expensive plan when multiple plans have same price', async () => {
      const mockPlans = [
        {
          id: 'plan1',
          name: 'Plan A',
          price: 29.99,
          max_pets: 2,
          max_appointments: 5
        },
        {
          id: 'plan2',
          name: 'Plan B',
          price: 29.99,
          max_pets: 3,
          max_appointments: 6
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockPlans,
              error: null
            })
          })
        })
      })

      const result = await subscriptionPlansService.getRecommendedPlan(2, 5)

      expect(result).toBeDefined()
      expect(result?.price).toBe(29.99)
    })
  })

  describe('getPlanStats', () => {
    it('should return plan statistics', async () => {
      const mockSubscriptions = [
        {
          price: 29.99,
          start_date: '2024-01-01T00:00:00Z',
          status: 'active'
        },
        {
          price: 29.99,
          start_date: '2024-01-15T00:00:00Z',
          status: 'active'
        },
        {
          price: 29.99,
          start_date: '2024-02-01T00:00:00Z',
          status: 'cancelled'
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockSubscriptions,
            error: null
          })
        })
      })

      const result = await subscriptionPlansService.getPlanStats('plan1')

      expect(result.totalSubscribers).toBe(3)
      expect(result.monthlyRevenue).toBe(89.97)
      expect(result.averageSubscriptionDuration).toBeGreaterThan(0)
    })

    it('should return zero stats when no subscriptions found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      })

      const result = await subscriptionPlansService.getPlanStats('plan1')

      expect(result).toEqual({
        totalSubscribers: 0,
        monthlyRevenue: 0,
        averageSubscriptionDuration: 0
      })
    })

    it('should throw error when fetching stats fails', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Stats failed' }
          })
        })
      })

      await expect(subscriptionPlansService.getPlanStats('plan1')).rejects.toThrow('Erro ao buscar estatísticas do plano: Stats failed')
    })
  })

  describe('createBulkPlans', () => {
    it('should create multiple plans at once', async () => {
      const plansData = [
        {
          name: 'Plan A',
          price: 29.99,
          billing_cycle: 'monthly'
        },
        {
          name: 'Plan B',
          price: 59.99,
          billing_cycle: 'monthly'
        }
      ]

      const mockCreatedPlans = [
        {
          id: 'plan1',
          ...plansData[0],
          created_at: '2024-01-01T10:00:00Z'
        },
        {
          id: 'plan2',
          ...plansData[1],
          created_at: '2024-01-01T10:00:00Z'
        }
      ]

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: mockCreatedPlans,
            error: null
          })
        })
      })

      const result = await subscriptionPlansService.createBulkPlans(plansData)

      expect(mockSupabase.from).toHaveBeenCalledWith('subscription_plans_pet')
      expect(result).toEqual(mockCreatedPlans)
    })

    it('should throw error when bulk creation fails', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Bulk creation failed' }
          })
        })
      })

      await expect(subscriptionPlansService.createBulkPlans([])).rejects.toThrow('Erro ao criar planos em lote: Bulk creation failed')
    })

    it('should return empty array when no plans created', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      })

      const result = await subscriptionPlansService.createBulkPlans([])
      expect(result).toEqual([])
    })
  })

  describe('duplicatePlan', () => {
    it('should duplicate existing plan with new name', async () => {
      const originalPlan = {
        id: 'plan1',
        name: 'Original Plan',
        description: 'Original description',
        price: 29.99,
        billing_cycle: 'monthly',
        features: ['Feature 1', 'Feature 2'],
        max_pets: 2,
        max_appointments: 5,
        max_products_discount: 10,
        free_delivery: true,
        priority_support: false,
        is_active: true,
        sort_order: 1
      }

      const duplicatedPlan = {
        id: 'plan2',
        name: 'Duplicated Plan',
        description: 'Original description',
        price: 29.99,
        billing_cycle: 'monthly',
        features: ['Feature 1', 'Feature 2'],
        max_pets: 2,
        max_appointments: 5,
        max_products_discount: 10,
        free_delivery: true,
        priority_support: false,
        is_active: false,
        sort_order: 2
      }

      // Mock original plan fetch then plan creation
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: originalPlan,
                error: null
              })
            })
          })
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: duplicatedPlan,
                error: null
              })
            })
          })
        })

      const result = await subscriptionPlansService.duplicatePlan('plan1', 'Duplicated Plan')

      expect(result.name).toBe('Duplicated Plan')
      expect(result.is_active).toBe(false)
      expect(result.sort_order).toBe(2)
    })

    it('should throw error when original plan not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      })

      await expect(subscriptionPlansService.duplicatePlan('nonexistent', 'New Name')).rejects.toThrow('Plano original não encontrado')
    })

    it('should throw error when duplication fails', async () => {
      const originalPlan = {
        id: 'plan1',
        name: 'Original Plan',
        description: 'Description',
        price: 29.99
      }

      // Mock successful original plan fetch then failed plan creation
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: originalPlan,
                error: null
              })
            })
          })
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Creation failed' }
              })
            })
          })
        })

      await expect(subscriptionPlansService.duplicatePlan('plan1', 'New Name')).rejects.toThrow('Erro ao criar plano de assinatura: Creation failed')
    })
  })
})
