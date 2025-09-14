import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userSubscriptionsService } from '../userSubscriptionsService'
import { supabase } from '../../lib/supabase'

// Mock do Supabase
vi.mock('../../lib/supabase', () => {
  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn()
  }

  return {
    supabase: {
      from: vi.fn().mockReturnValue(mockQueryBuilder),
      auth: {
        getUser: vi.fn()
      }
    }
  }
})

// Interfaces para tipagem dos mocks
interface MockQueryBuilder {
  select: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  in: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
  then: ReturnType<typeof vi.fn>
}

interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>
}

const mockSupabase = supabase as MockSupabaseClient
const mockQueryBuilder = mockSupabase.from() as MockQueryBuilder

const createMockQueryBuilder = () => {
  const builder = {
    select: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
  
  // Configurar select para retornar o builder mesmo com parâmetros
  builder.select.mockImplementation(() => builder)
  builder.eq.mockImplementation(() => Promise.resolve({ count: 0, error: null }))
  
  return builder
}

describe('UserSubscriptionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserSubscriptions', () => {
    it('should return user subscriptions with plan details', async () => {
      const mockSubscriptions = [
        {
          id: 'sub1',
          user_id: 'user1',
          plan_id: 'plan1',
          status: 'active',
          price: 29.99,
          subscription_plans_pet: {
            id: 'plan1',
            name: 'Basic Plan',
            max_pets: 2
          }
        },
        {
          id: 'sub2',
          user_id: 'user1',
          plan_id: 'plan2',
          status: 'cancelled',
          price: 59.99,
          subscription_plans_pet: {
            id: 'plan2',
            name: 'Premium Plan',
            max_pets: 5
          }
        }
      ]

      mockSupabase.from().order.mockResolvedValue({
          data: mockSubscriptions,
          error: null
        })

      const result = await userSubscriptionsService.getUserSubscriptions('user1')

      expect(mockSupabase.from).toHaveBeenCalledWith('user_subscriptions_pet')
      expect(result).toEqual(mockSubscriptions)
    })

    it('should throw error when database query fails', async () => {
      mockSupabase.from().order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      await expect(userSubscriptionsService.getUserSubscriptions('user1')).rejects.toThrow('Erro ao buscar assinaturas do usuário: Database error')
    })

    it('should return empty array when no subscriptions found', async () => {
      mockSupabase.from().order.mockResolvedValue({
          data: null,
          error: null
        })

      const result = await userSubscriptionsService.getUserSubscriptions('user1')
      expect(result).toEqual([])
    })
  })

  describe('getActiveSubscription', () => {
    it('should return active subscription', async () => {
      const mockSubscription = {
        id: 'sub1',
        user_id: 'user1',
        status: 'active',
        subscription_plans_pet: {
          id: 'plan1',
          name: 'Basic Plan'
        }
      }

      mockSupabase.from().single.mockResolvedValue({
        data: mockSubscription,
        error: null
      })

      const result = await userSubscriptionsService.getActiveSubscription('user1')

      expect(mockSupabase.from).toHaveBeenCalledWith('user_subscriptions_pet')
      expect(result).toEqual(mockSubscription)
    })

    it('should return null when no active subscription found', async () => {
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      })

      const result = await userSubscriptionsService.getActiveSubscription('user1')
      expect(result).toBeNull()
    })

    it('should throw error for other database errors', async () => {
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'OTHER' }
      })

      await expect(userSubscriptionsService.getActiveSubscription('user1')).rejects.toThrow('Erro ao buscar assinatura ativa: Database error')
    })
  })

  describe('createSubscription', () => {
    it('should create new subscription', async () => {
      const subscriptionData = {
        user_id: 'user1',
        plan_id: 'plan1',
        price: 29.99,
        billing_cycle: 'monthly',
        status: 'active'
      }

      const mockCreatedSubscription = {
        id: 'sub1',
        ...subscriptionData,
        created_at: '2024-01-01T10:00:00Z',
        subscription_plans_pet: {
          id: 'plan1',
          name: 'Basic Plan'
        }
      }

      mockSupabase.from().single.mockResolvedValue({
          data: mockCreatedSubscription,
          error: null
        })

      const result = await userSubscriptionsService.createSubscription(subscriptionData)

      expect(mockSupabase.from).toHaveBeenCalledWith('user_subscriptions_pet')
      expect(result).toEqual(mockCreatedSubscription)
    })

    it('should throw error when creation fails', async () => {
      mockSupabase.from().single.mockResolvedValue({
          data: null,
          error: { message: 'Creation failed' }
        })

      await expect(userSubscriptionsService.createSubscription({})).rejects.toThrow('Erro ao criar assinatura: Creation failed')
    })
  })

  describe('updateSubscription', () => {
    it('should update subscription', async () => {
      const updates = { status: 'paused', auto_renew: false }
      const mockUpdatedSubscription = {
        id: 'sub1',
        user_id: 'user1',
        status: 'paused',
        auto_renew: false,
        subscription_plans_pet: {
          id: 'plan1',
          name: 'Basic Plan'
        }
      }

      mockSupabase.from().single.mockResolvedValue({
          data: mockUpdatedSubscription,
          error: null
        })

      const result = await userSubscriptionsService.updateSubscription('sub1', updates)

      expect(mockSupabase.from).toHaveBeenCalledWith('user_subscriptions_pet')
      expect(result).toEqual(mockUpdatedSubscription)
    })

    it('should throw error when update fails', async () => {
      mockSupabase.from().single.mockResolvedValue({
          data: null,
          error: { message: 'Update failed' }
        })

      await expect(userSubscriptionsService.updateSubscription('sub1', {})).rejects.toThrow('Erro ao atualizar assinatura: Update failed')
    })
  })

  describe('cancelSubscription', () => {
    it('should cancel subscription with reason', async () => {
      const mockCancelledSubscription = {
        id: 'sub1',
        status: 'cancelled',
        cancelled_at: expect.any(String),
        cancellation_reason: 'Too expensive',
        auto_renew: false
      }

      mockSupabase.from().single.mockResolvedValue({
          data: mockCancelledSubscription,
          error: null
        })

      const result = await userSubscriptionsService.cancelSubscription('sub1', 'Too expensive')

      expect(result.status).toBe('cancelled')
      expect(result.cancellation_reason).toBe('Too expensive')
      expect(result.auto_renew).toBe(false)
    })

    it('should cancel subscription without reason', async () => {
      const mockCancelledSubscription = {
        id: 'sub1',
        status: 'cancelled',
        cancelled_at: expect.any(String),
        auto_renew: false
      }

      mockSupabase.from().single.mockResolvedValue({
          data: mockCancelledSubscription,
          error: null
        })

      const result = await userSubscriptionsService.cancelSubscription('sub1')

      expect(result.status).toBe('cancelled')
      expect(result.auto_renew).toBe(false)
    })
  })

  describe('pauseSubscription', () => {
    it('should pause subscription', async () => {
      const mockPausedSubscription = {
        id: 'sub1',
        status: 'paused',
        auto_renew: false
      }

      mockSupabase.from().single.mockResolvedValue({
          data: mockPausedSubscription,
          error: null
        })

      const result = await userSubscriptionsService.pauseSubscription('sub1')

      expect(result.status).toBe('paused')
      expect(result.auto_renew).toBe(false)
    })
  })

  describe('resumeSubscription', () => {
    it('should resume subscription', async () => {
      const mockResumedSubscription = {
        id: 'sub1',
        status: 'active',
        auto_renew: true
      }

      mockSupabase.from().single.mockResolvedValue({
          data: mockResumedSubscription,
          error: null
        })

      const result = await userSubscriptionsService.resumeSubscription('sub1')

      expect(result.status).toBe('active')
      expect(result.auto_renew).toBe(true)
    })
  })

  describe('upgradeSubscription', () => {
    it('should upgrade subscription to new plan', async () => {
      const mockNewPlan = {
        price: 59.99,
        billing_cycle: 'monthly'
      }

      const mockUpgradedSubscription = {
        id: 'sub1',
        plan_id: 'plan2',
        price: 59.99,
        billing_cycle: 'monthly'
      }

      // Mock plan fetch
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockNewPlan,
        error: null
      })

      // Mock subscription update
      mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
        data: mockUpgradedSubscription,
        error: null
      })

      const result = await userSubscriptionsService.upgradeSubscription('sub1', 'plan2')

      expect(result.plan_id).toBe('plan2')
      expect(result.price).toBe(59.99)
    })

    it('should throw error when new plan not found', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Plan not found' }
      })

      await expect(userSubscriptionsService.upgradeSubscription('sub1', 'nonexistent')).rejects.toThrow('Plano não encontrado')
    })
  })

  describe('downgradeSubscription', () => {
    it('should downgrade subscription to new plan', async () => {
      const mockNewPlan = {
        price: 19.99,
        billing_cycle: 'monthly'
      }

      const mockDowngradedSubscription = {
        id: 'sub1',
        plan_id: 'plan0',
        price: 19.99,
        billing_cycle: 'monthly'
      }

      // Mock plan fetch
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockNewPlan,
        error: null
      })

      // Mock subscription update
      mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
        data: mockDowngradedSubscription,
        error: null
      })

      const result = await userSubscriptionsService.downgradeSubscription('sub1', 'plan0')

      expect(result.plan_id).toBe('plan0')
      expect(result.price).toBe(19.99)
    })

    it('should throw error when new plan not found', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Plan not found' }
      })

      await expect(userSubscriptionsService.downgradeSubscription('sub1', 'nonexistent')).rejects.toThrow('Plano não encontrado')
    })
  })

  describe('getSubscriptionById', () => {
    it('should return subscription by id', async () => {
      const mockSubscription = {
        id: 'sub1',
        user_id: 'user1',
        status: 'active',
        subscription_plans_pet: {
          id: 'plan1',
          name: 'Basic Plan'
        }
      }

      mockSupabase.from().single.mockResolvedValue({
          data: mockSubscription,
          error: null
        })

      const result = await userSubscriptionsService.getSubscriptionById('sub1')

      expect(mockSupabase.from).toHaveBeenCalledWith('user_subscriptions_pet')
      expect(result).toEqual(mockSubscription)
    })

    it('should return null when subscription not found', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      })

      const result = await userSubscriptionsService.getSubscriptionById('nonexistent')
      expect(result).toBeNull()
    })

    it('should throw error for other database errors', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'OTHER' }
      })

      await expect(userSubscriptionsService.getSubscriptionById('sub1')).rejects.toThrow('Erro ao buscar assinatura: Database error')
    })
  })

  describe('getSubscriptionsByStatus', () => {
    it('should return subscriptions filtered by status', async () => {
      const mockSubscriptions = [
        {
          id: 'sub1',
          status: 'active',
          subscription_plans_pet: { name: 'Plan 1' }
        },
        {
          id: 'sub2',
          status: 'active',
          subscription_plans_pet: { name: 'Plan 2' }
        }
      ]

      mockSupabase.from().order.mockResolvedValue({
        data: mockSubscriptions,
        error: null
      })

      const result = await userSubscriptionsService.getSubscriptionsByStatus('active')

      expect(mockSupabase.from).toHaveBeenCalledWith('user_subscriptions_pet')
      expect(result).toEqual(mockSubscriptions)
    })

    it('should throw error when query fails', async () => {
      mockSupabase.from().order.mockResolvedValue({
          data: null,
          error: { message: 'Query failed' }
        })

      await expect(userSubscriptionsService.getSubscriptionsByStatus('active')).rejects.toThrow('Erro ao buscar assinaturas por status: Query failed')
    })

    it('should return empty array when no subscriptions found', async () => {
      mockSupabase.from().order.mockResolvedValue({
          data: null,
          error: null
        })

      const result = await userSubscriptionsService.getSubscriptionsByStatus('cancelled')
      expect(result).toEqual([])
    })
  })

  describe('getExpiringSubscriptions', () => {
    it('should return subscriptions expiring within specified days', async () => {
      const mockExpiringSubscriptions = [
        {
          id: 'sub1',
          status: 'active',
          next_billing_date: '2024-01-08T00:00:00Z',
          subscription_plans_pet: { name: 'Plan 1' }
        },
        {
          id: 'sub2',
          status: 'active',
          next_billing_date: '2024-01-10T00:00:00Z',
          subscription_plans_pet: { name: 'Plan 2' }
        }
      ]

      mockSupabase.from().order.mockResolvedValue({
          data: mockExpiringSubscriptions,
          error: null
        })

      const result = await userSubscriptionsService.getExpiringSubscriptions(7)

      expect(mockSupabase.from).toHaveBeenCalledWith('user_subscriptions_pet')
      expect(result).toEqual(mockExpiringSubscriptions)
    })

    it('should use default 7 days when no parameter provided', async () => {
      mockSupabase.from().order.mockResolvedValue({
          data: [],
          error: null
        })

      await userSubscriptionsService.getExpiringSubscriptions()

      expect(mockSupabase.from).toHaveBeenCalledWith('user_subscriptions_pet')
    })

    it('should throw error when query fails', async () => {
      mockSupabase.from().order.mockResolvedValue({
          data: null,
          error: { message: 'Query failed' }
        })

      await expect(userSubscriptionsService.getExpiringSubscriptions(7)).rejects.toThrow('Erro ao buscar assinaturas expirando: Query failed')
    })
  })

  describe('getSubscriptionStats', () => {
    it('should return subscription statistics', async () => {
      const mockSubscriptions = [
        {
          id: 'sub1',
          status: 'active',
          price: 29.99,
          billing_cycle: 'monthly'
        },
        {
          id: 'sub2',
          status: 'active',
          price: 59.99,
          billing_cycle: 'monthly'
        },
        {
          id: 'sub3',
          status: 'cancelled',
          price: 29.99,
          billing_cycle: 'yearly'
        }
      ]

      // Mock getUserSubscriptions
      vi.spyOn(userSubscriptionsService, 'getUserSubscriptions').mockResolvedValue(mockSubscriptions)

      const result = await userSubscriptionsService.getSubscriptionStats('user1')

      expect(result).toEqual({
        totalSubscriptions: 3,
        activeSubscriptions: 2,
        totalSpent: 119.97,
        averageMonthlySpend: 44.99
      })
    })

    it('should handle empty subscriptions list', async () => {
      vi.spyOn(userSubscriptionsService, 'getUserSubscriptions').mockResolvedValue([])

      const result = await userSubscriptionsService.getSubscriptionStats('user1')

      expect(result).toEqual({
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        totalSpent: 0,
        averageMonthlySpend: 0
      })
    })
  })

  describe('checkSubscriptionLimits', () => {
    it('should return limits for user with active subscription', async () => {
      const mockActiveSubscription = {
        id: 'sub1',
        user_id: 'user1',
        status: 'active',
        subscription_plans_pet: {
          max_pets: 3,
          max_appointments: 10
        }
      }

      // Mock getActiveSubscription
      vi.spyOn(userSubscriptionsService, 'getActiveSubscription').mockResolvedValue(mockActiveSubscription)

      // Mock para contar pets e appointments
        mockSupabase.from().eq.mockResolvedValueOnce({
          count: 1,
          error: null
        }).mockResolvedValueOnce({
          count: 5,
          error: null
        })

      const result = await userSubscriptionsService.checkSubscriptionLimits('user1')

      expect(result).toEqual({
        canAddPet: true,
        canScheduleAppointment: true,
        remainingPets: 2,
        remainingAppointments: 5
      })
    })

    it('should return no limits for user without active subscription', async () => {
      vi.spyOn(userSubscriptionsService, 'getActiveSubscription').mockResolvedValue(null)

      const result = await userSubscriptionsService.checkSubscriptionLimits('user1')

      expect(result).toEqual({
        canAddPet: false,
        canScheduleAppointment: false,
        remainingPets: 0,
        remainingAppointments: 0
      })
    })

    it('should handle limits reached', async () => {
      const mockActiveSubscription = {
        id: 'sub1',
        user_id: 'user1',
        status: 'active',
        subscription_plans_pet: {
          max_pets: 2,
          max_appointments: 5
        }
      }

      vi.spyOn(userSubscriptionsService, 'getActiveSubscription').mockResolvedValue(mockActiveSubscription)

      // Mock para contar pets (no limite) e appointments (acima do limite)
        mockSupabase.from().eq.mockResolvedValueOnce({
          count: 2,
          error: null
        }).mockResolvedValueOnce({
          count: 6,
          error: null
        })

      const result = await userSubscriptionsService.checkSubscriptionLimits('user1')

      expect(result).toEqual({
        canAddPet: false,
        canScheduleAppointment: false,
        remainingPets: 0,
        remainingAppointments: 0
      })
    })
  })

  describe('renewSubscription', () => {
    it('should renew monthly subscription', async () => {
      const mockSubscription = {
        id: 'sub1',
        billing_cycle: 'monthly',
        status: 'active'
      }

      const mockRenewedSubscription = {
        id: 'sub1',
        status: 'active',
        next_billing_date: expect.any(String),
        auto_renew: true
      }

      // Mock getSubscriptionById
      vi.spyOn(userSubscriptionsService, 'getSubscriptionById').mockResolvedValue(mockSubscription)

      // Mock updateSubscription
      mockSupabase.from().single.mockResolvedValue({
          data: mockRenewedSubscription,
          error: null
        })

      const result = await userSubscriptionsService.renewSubscription('sub1')

      expect(result.status).toBe('active')
      expect(result.auto_renew).toBe(true)
    })

    it('should renew yearly subscription', async () => {
      const mockSubscription = {
        id: 'sub1',
        billing_cycle: 'yearly',
        status: 'active'
      }

      const mockRenewedSubscription = {
        id: 'sub1',
        status: 'active',
        next_billing_date: expect.any(String),
        auto_renew: true
      }

      vi.spyOn(userSubscriptionsService, 'getSubscriptionById').mockResolvedValue(mockSubscription)

      mockSupabase.from().single.mockResolvedValue({
          data: mockRenewedSubscription,
          error: null
        })

      const result = await userSubscriptionsService.renewSubscription('sub1')

      expect(result.status).toBe('active')
      expect(result.auto_renew).toBe(true)
    })

    it('should throw error when subscription not found', async () => {
      vi.spyOn(userSubscriptionsService, 'getSubscriptionById').mockResolvedValue(null)

      await expect(userSubscriptionsService.renewSubscription('nonexistent')).rejects.toThrow('Assinatura não encontrada')
    })
  })

  describe('getSubscriptionHistory', () => {
    it('should return subscription history for user', async () => {
      const mockHistory = [
        {
          id: 'sub1',
          user_id: 'user1',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          subscription_plans_pet: { name: 'Current Plan' }
        },
        {
          id: 'sub2',
          user_id: 'user1',
          status: 'cancelled',
          created_at: '2023-12-01T00:00:00Z',
          subscription_plans_pet: { name: 'Previous Plan' }
        }
      ]

      mockSupabase.from().order.mockResolvedValue({
          data: mockHistory,
          error: null
        })

      const result = await userSubscriptionsService.getSubscriptionHistory('user1')

      expect(mockSupabase.from).toHaveBeenCalledWith('user_subscriptions_pet')
      expect(result).toEqual(mockHistory)
    })

    it('should throw error when query fails', async () => {
      mockSupabase.from().order.mockResolvedValue({
          data: null,
          error: { message: 'Query failed' }
        })

      await expect(userSubscriptionsService.getSubscriptionHistory('user1')).rejects.toThrow('Erro ao buscar histórico de assinaturas: Query failed')
    })

    it('should return empty array when no subscriptions found', async () => {
      mockSupabase.from().order.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await userSubscriptionsService.getSubscriptionHistory('user1')
      expect(result).toEqual([])
    })
  })
})