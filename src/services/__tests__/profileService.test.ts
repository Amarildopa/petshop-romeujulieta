import { describe, it, expect, vi, beforeEach } from 'vitest'
import { profileService } from '../profileService'

// Mock do Supabase
vi.mock('../../lib/supabase', () => {
  const mockSelect = vi.fn()
  const mockFrom = vi.fn()
  const mockEq = vi.fn()
  const mockMaybeSingle = vi.fn()
  const mockSingle = vi.fn()
  const mockUpdate = vi.fn()
  const mockInsert = vi.fn()
  const mockGetUser = vi.fn()
  const mockUpload = vi.fn()
  const mockGetPublicUrl = vi.fn()
  const mockStorageFrom = vi.fn()

  return {
    supabase: {
      from: mockFrom,
      auth: {
        getUser: mockGetUser
      },
      storage: {
        from: mockStorageFrom
      }
    },
    mockFrom,
    mockSelect,
    mockEq,
    mockMaybeSingle,
    mockSingle,
    mockUpdate,
    mockInsert,
    mockGetUser,
    mockUpload,
    mockGetPublicUrl,
    mockStorageFrom
  }
})

const {
  mockFrom,
  mockSelect,
  mockEq,
  mockMaybeSingle,
  mockSingle,
  mockUpdate,
  mockInsert,
  mockGetUser,
  mockUpload,
  mockGetPublicUrl,
  mockStorageFrom
} = vi.mocked(await import('../../lib/supabase'))

// Mock do URL.createObjectURL
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'blob:mock-url')
  },
  writable: true
})

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('should return null when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const result = await profileService.getProfile()

      expect(result).toBeNull()
      expect(mockGetUser).toHaveBeenCalled()
    })

    it('should return existing profile when found', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      }

      const mockProfile = {
        id: 'user-123',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '123456789',
        address: 'Test Address',
        cep: '12345-678',
        cpf: '123.456.789-00',
        street: 'Test Street',
        neighborhood: 'Test Neighborhood',
        city: 'Test City',
        state: 'TS',
        complement: 'Apt 1',
        avatar_url: null
      }

      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            maybeSingle: mockMaybeSingle.mockResolvedValue({ data: mockProfile, error: null })
          })
        })
      })

      const result = await profileService.getProfile()

      expect(mockFrom).toHaveBeenCalledWith('profiles_pet')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123')
      expect(result).toEqual(mockProfile)
    })

    it('should create basic profile when profile not found', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      }

      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            maybeSingle: mockMaybeSingle.mockResolvedValue({ data: null, error: null })
          })
        })
      })

      const result = await profileService.getProfile()

      expect(result).toMatchObject({
        id: 'user-123',
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '',
        address: '',
        cep: '',
        cpf: '',
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        complement: '',
        avatar_url: null
      })
    })

    it('should create basic profile when fetch error occurs', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      }

      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            maybeSingle: mockMaybeSingle.mockResolvedValue({ data: null, error: { message: 'Table not found' } })
          })
        })
      })

      const result = await profileService.getProfile()

      expect(result).toMatchObject({
        id: 'user-123',
        full_name: 'Test User',
        email: 'test@example.com'
      })
    })
  })

  describe('createBasicProfile', () => {
    it('should create basic profile from user data', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          phone: '123456789',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      }

      const result = profileService.createBasicProfile(mockUser)

      expect(result).toMatchObject({
        id: 'user-123',
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '123456789',
        avatar_url: 'https://example.com/avatar.jpg',
        address: '',
        cep: '',
        cpf: '',
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        complement: ''
      })
      expect(result.created_at).toBeDefined()
      expect(result.updated_at).toBeDefined()
    })

    it('should handle user without metadata', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      }

      const result = profileService.createBasicProfile(mockUser)

      expect(result.full_name).toBe('test')
      expect(result.phone).toBe('')
      expect(result.avatar_url).toBeNull()
    })
  })

  describe('updateProfile', () => {
    it('should throw error when user not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      await expect(profileService.updateProfile({ full_name: 'New Name' })).rejects.toThrow(
        'User not authenticated'
      )
    })

    it('should update existing profile successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      }

      const updatedProfile = {
        id: 'user-123',
        full_name: 'Updated Name',
        email: 'test@example.com',
        phone: '987654321'
      }

      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.mockReturnValue({
        update: mockUpdate.mockReturnValue({
          eq: mockEq.mockReturnValue({
            select: mockSelect.mockReturnValue({
              single: mockSingle.mockResolvedValue({ data: updatedProfile, error: null })
            })
          })
        })
      })

      const result = await profileService.updateProfile({ full_name: 'Updated Name', phone: '987654321' })

      expect(mockFrom).toHaveBeenCalledWith('profiles_pet')
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        full_name: 'Updated Name',
        phone: '987654321',
        updated_at: expect.any(String)
      }))
      expect(result).toEqual(updatedProfile)
    })

    it('should return local profile when update fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      }

      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.mockReturnValue({
        update: mockUpdate.mockReturnValue({
          eq: mockEq.mockReturnValue({
            select: mockSelect.mockReturnValue({
              single: mockSingle.mockResolvedValue({ data: null, error: { message: 'Profile not found' } })
            })
          })
        }),
        insert: mockInsert.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
          })
        })
      })

      const result = await profileService.updateProfile({ full_name: 'Updated Name' })

      expect(result).toMatchObject({
        id: 'user-123',
        full_name: 'Updated Name',
        email: 'test@example.com'
      })
    })
  })

  describe('uploadAvatar', () => {
    it('should throw error when user not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const mockFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' })

      await expect(profileService.uploadAvatar(mockFile)).rejects.toThrow(
        'User not authenticated'
      )
    })

    it('should upload avatar successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      }

      const mockFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' })
      const publicUrl = 'https://example.com/avatars/user-123-123456789.jpg'

      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      mockStorageFrom.mockReturnValue({
        upload: mockUpload.mockResolvedValue({ error: null }),
        getPublicUrl: mockGetPublicUrl.mockReturnValue({ data: { publicUrl } })
      })
      
      // Mock the updateProfile method
      vi.spyOn(profileService, 'updateProfile').mockResolvedValue({} as unknown)

      const result = await profileService.uploadAvatar(mockFile)

      expect(mockStorageFrom).toHaveBeenCalledWith('avatars')
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/^avatars\/user-123-\d+\.jpg$/),
        mockFile
      )
      expect(result).toBe(publicUrl)
    })

    it('should use local URL when upload fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      }

      const mockFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' })

      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      mockStorageFrom.mockReturnValue({
        upload: mockUpload.mockResolvedValue({ error: { message: 'Upload failed' } })
      })
      
      // Mock the updateProfile method
      vi.spyOn(profileService, 'updateProfile').mockResolvedValue({} as unknown)

      const result = await profileService.uploadAvatar(mockFile)

      expect(result).toBe('blob:mock-url')
    })
  })
})
