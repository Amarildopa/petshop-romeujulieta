import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminService } from '../adminService'

// Mock do Supabase
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockOrder = vi.fn()
const mockRange = vi.fn()
const mockGetUser = vi.fn()

const mockSupabase = {
  from: mockFrom,
  auth: {
    getUser: mockGetUser
  }
}

// Mock dos módulos
vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}))

vi.mock('../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}))

vi.mock('../lib/metrics', () => ({
  metrics: {
    increment: vi.fn(),
    timing: vi.fn()
  }
}))

describe('AdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete
    })
  })

  describe('getAdminUsers', () => {
    it('should return admin users successfully', async () => {
      const mockAdminUsers = [
        {
          id: '1',
          user_id: 'user1',
          role: 'admin',
          permissions: { users: true },
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          profiles_pet: {
            full_name: 'Admin User',
            email: 'admin@test.com',
            phone: '123456789'
          }
        }
      ]

      mockSelect.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: mockAdminUsers, error: null })
      })

      const result = await adminService.getAdminUsers()

      expect(mockFrom).toHaveBeenCalledWith('admin_users_pet')
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('profiles_pet'))
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockAdminUsers)
    })

    it('should throw error when Supabase returns error', async () => {
      const mockError = { message: 'Database error' }

      mockSelect.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: null, error: mockError })
      })

      await expect(adminService.getAdminUsers()).rejects.toThrow()
    })

    it('should return empty array when no data', async () => {
      mockSelect.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: null, error: null })
      })

      const result = await adminService.getAdminUsers()
      expect(result).toEqual([])
    })
  })

  describe('createAdminUser', () => {
    beforeEach(() => {
      // Mock para logAdminAction
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'current-user-id' } }
      })
      
      // Mock para buscar admin atual
      const mockAdminSelect = vi.fn()
      mockFrom.mockImplementation((table) => {
        if (table === 'admin_users_pet') {
          return {
            select: mockAdminSelect.mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'admin-id' }, error: null })
              })
            }),
            insert: mockInsert
          }
        }
        if (table === 'admin_logs_pet') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null })
          }
        }
        return { select: mockSelect, insert: mockInsert }
      })
    })

    it('should create admin user successfully', async () => {
      const mockAdminUser = {
        id: '1',
        user_id: 'user1',
        role: 'admin',
        permissions: { users: true },
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        profiles_pet: {
          full_name: 'New Admin',
          email: 'newadmin@test.com',
          phone: '123456789'
        }
      }

      mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: mockAdminUser, error: null })
        })
      })

      const result = await adminService.createAdminUser('user1', 'admin', { users: true })

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user1',
        role: 'admin',
        permissions: { users: true }
      })
      expect(result).toEqual(mockAdminUser)
    })

    it('should throw error when creation fails', async () => {
      const mockError = { message: 'Creation failed' }

      mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle.mockResolvedValue({ data: null, error: mockError })
        })
      })

      await expect(adminService.createAdminUser('user1', 'admin')).rejects.toThrow()
    })
  })

  describe('updateAdminUser', () => {
    beforeEach(() => {
      // Mock para logAdminAction
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'current-user-id' } }
      })
      
      const mockAdminSelect = vi.fn()
      mockFrom.mockImplementation((table) => {
        if (table === 'admin_users_pet') {
          return {
            select: mockAdminSelect.mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'admin-id' }, error: null })
              })
            }),
            update: mockUpdate
          }
        }
        if (table === 'admin_logs_pet') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null })
          }
        }
        return { update: mockUpdate }
      })
    })

    it('should update admin user successfully', async () => {
      const mockUpdatedUser = {
        id: '1',
        user_id: 'user1',
        role: 'manager',
        permissions: { users: false, orders: true },
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      }

      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: mockUpdatedUser, error: null })
          })
        })
      })

      const updates = { role: 'manager', permissions: { users: false, orders: true } }
      const result = await adminService.updateAdminUser('1', updates)

      expect(mockUpdate).toHaveBeenCalledWith(updates)
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockUpdatedUser)
    })

    it('should throw error when update fails', async () => {
      const mockError = { message: 'Update failed' }

      mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: null, error: mockError })
          })
        })
      })

      await expect(adminService.updateAdminUser('1', { role: 'manager' })).rejects.toThrow()
    })
  })

  describe('deleteAdminUser', () => {
    beforeEach(() => {
      // Mock para logAdminAction
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'current-user-id' } }
      })
      
      const mockAdminSelect = vi.fn()
      mockFrom.mockImplementation((table) => {
        if (table === 'admin_users_pet') {
          return {
            select: mockAdminSelect.mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'admin-id' }, error: null })
              })
            }),
            delete: mockDelete
          }
        }
        if (table === 'admin_logs_pet') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null })
          }
        }
        return { delete: mockDelete }
      })
    })

    it('should delete admin user successfully', async () => {
      mockDelete.mockReturnValue({
        eq: mockEq.mockResolvedValue({ error: null })
      })

      await adminService.deleteAdminUser('1')

      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', '1')
    })

    it('should throw error when deletion fails', async () => {
      const mockError = { message: 'Deletion failed' }

      mockDelete.mockReturnValue({
        eq: mockEq.mockResolvedValue({ error: mockError })
      })

      await expect(adminService.deleteAdminUser('1')).rejects.toThrow()
    })
  })

  describe('getAdminLogs', () => {
    it('should return admin logs successfully', async () => {
      const mockLogs = [
        {
          id: '1',
          admin_id: 'admin1',
          action: 'create_user',
          resource_type: 'user',
          resource_id: 'user1',
          details: { name: 'Test User' },
          created_at: '2024-01-01',
          admin_users_pet: {
            profiles_pet: {
              full_name: 'Admin User',
              email: 'admin@test.com'
            }
          }
        }
      ]

      mockSelect.mockReturnValue({
        order: mockOrder.mockReturnValue({
          range: mockRange.mockResolvedValue({ data: mockLogs, error: null })
        })
      })

      const result = await adminService.getAdminLogs(50, 0)

      expect(mockFrom).toHaveBeenCalledWith('admin_logs_pet')
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('admin_users_pet'))
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(mockRange).toHaveBeenCalledWith(0, 49)
      expect(result).toEqual(mockLogs)
    })

    it('should use default parameters', async () => {
      mockSelect.mockReturnValue({
        order: mockOrder.mockReturnValue({
          range: mockRange.mockResolvedValue({ data: [], error: null })
        })
      })

      await adminService.getAdminLogs()

      expect(mockRange).toHaveBeenCalledWith(0, 99) // default limit 100
    })

    it('should throw error when fetching logs fails', async () => {
      const mockError = { message: 'Fetch failed' }

      mockSelect.mockReturnValue({
        order: mockOrder.mockReturnValue({
          range: mockRange.mockResolvedValue({ data: null, error: mockError })
        })
      })

      await expect(adminService.getAdminLogs()).rejects.toThrow()
    })
  })

  describe('logAdminAction', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'current-user-id' } }
      })
      
      const mockAdminSelect = vi.fn()
      mockFrom.mockImplementation((table) => {
        if (table === 'admin_users_pet') {
          return {
            select: mockAdminSelect.mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'admin-id' }, error: null })
              })
            })
          }
        }
        if (table === 'admin_logs_pet') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null })
          }
        }
        return {}
      })
    })

    it('should log admin action successfully', async () => {
      const mockLogInsert = vi.fn().mockResolvedValue({ error: null })
      
      mockFrom.mockImplementation((table) => {
        if (table === 'admin_users_pet') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'admin-id' }, error: null })
              })
            })
          }
        }
        if (table === 'admin_logs_pet') {
          return {
            insert: mockLogInsert
          }
        }
        return {}
      })

      await adminService.logAdminAction('create_user', 'user', 'user1', { name: 'Test' })

      expect(mockLogInsert).toHaveBeenCalledWith({
        admin_id: 'admin-id',
        action: 'create_user',
        resource_type: 'user',
        resource_id: 'user1',
        details: { name: 'Test' },
        ip_address: null,
        user_agent: expect.any(String)
      })
    })

    it('should handle missing user gracefully', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null }
      })

      // Should not throw error
      await adminService.logAdminAction('test_action', 'test_resource', 'test_id')
    })

    it('should handle missing admin user gracefully', async () => {
      mockFrom.mockImplementation((table) => {
        if (table === 'admin_users_pet') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null })
              })
            })
          }
        }
        return {}
      })

      // Should not throw error
      await adminService.logAdminAction('test_action', 'test_resource', 'test_id')
    })
  })
})
