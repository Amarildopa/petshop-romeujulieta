import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chatService } from '../chatService'
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
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      then: vi.fn()
    }))
  }
}))

const mockSupabase = supabase as any

describe('ChatService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getChatRooms', () => {
    it('should return chat rooms for user', async () => {
      const mockRooms = [
        {
          id: 'room1',
          name: 'Test Room',
          room_type: 'group',
          is_active: true,
          last_message_at: '2024-01-01T10:00:00Z'
        }
      ]

      mockSupabase.from().select().eq().eq().order.mockResolvedValue({
        data: mockRooms,
        error: null
      })

      const result = await chatService.getChatRooms('user1')

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_rooms_pet')
      expect(result).toEqual(mockRooms)
    })

    it('should throw error when database query fails', async () => {
      mockSupabase.from().select().eq().eq().order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      await expect(chatService.getChatRooms('user1')).rejects.toThrow('Erro ao buscar salas de chat: Database error')
    })

    it('should return empty array when no rooms found', async () => {
      mockSupabase.from().select().eq().eq().order.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await chatService.getChatRooms('user1')
      expect(result).toEqual([])
    })
  })

  describe('getChatRoom', () => {
    it('should return specific chat room', async () => {
      const mockRoom = {
        id: 'room1',
        name: 'Test Room',
        room_type: 'group'
      }

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockRoom,
        error: null
      })

      const result = await chatService.getChatRoom('room1')

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_rooms_pet')
      expect(result).toEqual(mockRoom)
    })

    it('should return null when room not found', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      })

      const result = await chatService.getChatRoom('nonexistent')
      expect(result).toBeNull()
    })

    it('should throw error for other database errors', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'OTHER' }
      })

      await expect(chatService.getChatRoom('room1')).rejects.toThrow('Erro ao buscar sala de chat: Database error')
    })
  })

  describe('createChatRoom', () => {
    it('should create new chat room', async () => {
      const roomData = {
        name: 'New Room',
        room_type: 'group',
        created_by: 'user1'
      }

      const mockCreatedRoom = {
        id: 'room1',
        ...roomData,
        created_at: '2024-01-01T10:00:00Z'
      }

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockCreatedRoom,
        error: null
      })

      const result = await chatService.createChatRoom(roomData)

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_rooms_pet')
      expect(result).toEqual(mockCreatedRoom)
    })

    it('should throw error when creation fails', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Creation failed' }
      })

      await expect(chatService.createChatRoom({})).rejects.toThrow('Erro ao criar sala de chat: Creation failed')
    })
  })

  describe('updateChatRoom', () => {
    it('should update chat room', async () => {
      const updates = { name: 'Updated Room' }
      const mockUpdatedRoom = {
        id: 'room1',
        name: 'Updated Room',
        room_type: 'group'
      }

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: mockUpdatedRoom,
        error: null
      })

      const result = await chatService.updateChatRoom('room1', updates)

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_rooms_pet')
      expect(result).toEqual(mockUpdatedRoom)
    })

    it('should throw error when update fails', async () => {
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      })

      await expect(chatService.updateChatRoom('room1', {})).rejects.toThrow('Erro ao atualizar sala de chat: Update failed')
    })
  })

  describe('deleteChatRoom', () => {
    it('should soft delete chat room', async () => {
      mockSupabase.from().update().eq.mockResolvedValue({
        error: null
      })

      await chatService.deleteChatRoom('room1')

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_rooms_pet')
    })

    it('should throw error when deletion fails', async () => {
      mockSupabase.from().update().eq.mockResolvedValue({
        error: { message: 'Deletion failed' }
      })

      await expect(chatService.deleteChatRoom('room1')).rejects.toThrow('Erro ao deletar sala de chat: Deletion failed')
    })
  })

  describe('addParticipant', () => {
    it('should add participant to room', async () => {
      const mockParticipant = {
        id: 'participant1',
        room_id: 'room1',
        user_id: 'user1',
        role: 'member'
      }

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockParticipant,
        error: null
      })

      const result = await chatService.addParticipant('room1', 'user1')

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_room_participants_pet')
      expect(result).toEqual(mockParticipant)
    })

    it('should add participant with custom role', async () => {
      const mockParticipant = {
        id: 'participant1',
        room_id: 'room1',
        user_id: 'user1',
        role: 'admin'
      }

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockParticipant,
        error: null
      })

      const result = await chatService.addParticipant('room1', 'user1', 'admin')
      expect(result.role).toBe('admin')
    })

    it('should throw error when adding participant fails', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Add participant failed' }
      })

      await expect(chatService.addParticipant('room1', 'user1')).rejects.toThrow('Erro ao adicionar participante: Add participant failed')
    })
  })

  describe('removeParticipant', () => {
    it('should remove participant from room', async () => {
      mockSupabase.from().delete().eq().eq.mockResolvedValue({
        error: null
      })

      await chatService.removeParticipant('room1', 'user1')

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_room_participants_pet')
    })

    it('should throw error when removal fails', async () => {
      mockSupabase.from().delete().eq().eq.mockResolvedValue({
        error: { message: 'Remove participant failed' }
      })

      await expect(chatService.removeParticipant('room1', 'user1')).rejects.toThrow('Erro ao remover participante: Remove participant failed')
    })
  })

  describe('getMessages', () => {
    it('should return messages for room', async () => {
      const mockMessages = [
        {
          id: 'msg1',
          content: 'Hello',
          sender_id: 'user1',
          created_at: '2024-01-01T10:00:00Z'
        },
        {
          id: 'msg2',
          content: 'Hi there',
          sender_id: 'user2',
          created_at: '2024-01-01T10:01:00Z'
        }
      ]

      mockSupabase.from().select().eq().order().range.mockResolvedValue({
        data: mockMessages,
        error: null
      })

      const result = await chatService.getMessages('room1')

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_messages_pet')
      expect(result).toEqual(mockMessages.reverse())
    })

    it('should handle custom limit and offset', async () => {
      mockSupabase.from().select().eq().order().range.mockResolvedValue({
        data: [],
        error: null
      })

      await chatService.getMessages('room1', 20, 10)

      expect(mockSupabase.from().select().eq().order().range).toHaveBeenCalledWith(10, 29)
    })

    it('should throw error when fetching messages fails', async () => {
      mockSupabase.from().select().eq().order().range.mockResolvedValue({
        data: null,
        error: { message: 'Fetch messages failed' }
      })

      await expect(chatService.getMessages('room1')).rejects.toThrow('Erro ao buscar mensagens: Fetch messages failed')
    })
  })

  describe('sendMessage', () => {
    it('should send message and update room', async () => {
      const messageData = {
        chat_room_id: 'room1',
        sender_id: 'user1',
        content: 'Hello world'
      }

      const mockMessage = {
        id: 'msg1',
        ...messageData,
        created_at: '2024-01-01T10:00:00Z'
      }

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockMessage,
        error: null
      })

      mockSupabase.from().update().eq.mockResolvedValue({
        error: null
      })

      const result = await chatService.sendMessage(messageData)

      expect(result).toEqual(mockMessage)
    })

    it('should throw error when sending message fails', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Send message failed' }
      })

      await expect(chatService.sendMessage({})).rejects.toThrow('Erro ao enviar mensagem: Send message failed')
    })
  })

  describe('updateMessage', () => {
    it('should update message with edit flags', async () => {
      const updates = { content: 'Updated content' }
      const mockUpdatedMessage = {
        id: 'msg1',
        content: 'Updated content',
        is_edited: true,
        edited_at: expect.any(String)
      }

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: mockUpdatedMessage,
        error: null
      })

      const result = await chatService.updateMessage('msg1', updates)

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_messages_pet')
      expect(result).toEqual(mockUpdatedMessage)
    })

    it('should throw error when update fails', async () => {
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Update message failed' }
      })

      await expect(chatService.updateMessage('msg1', {})).rejects.toThrow('Erro ao atualizar mensagem: Update message failed')
    })
  })

  describe('deleteMessage', () => {
    it('should delete message', async () => {
      mockSupabase.from().delete().eq.mockResolvedValue({
        error: null
      })

      await chatService.deleteMessage('msg1')

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_messages_pet')
    })

    it('should throw error when deletion fails', async () => {
      mockSupabase.from().delete().eq.mockResolvedValue({
        error: { message: 'Delete message failed' }
      })

      await expect(chatService.deleteMessage('msg1')).rejects.toThrow('Erro ao deletar mensagem: Delete message failed')
    })
  })

  describe('markMessageAsRead', () => {
    it('should mark message as read', async () => {
      mockSupabase.from().update().eq().neq.mockResolvedValue({
        error: null
      })

      await chatService.markMessageAsRead('msg1', 'user1')

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_messages_pet')
    })

    it('should throw error when marking as read fails', async () => {
      mockSupabase.from().update().eq().neq.mockResolvedValue({
        error: { message: 'Mark as read failed' }
      })

      await expect(chatService.markMessageAsRead('msg1', 'user1')).rejects.toThrow('Erro ao marcar mensagem como lida: Mark as read failed')
    })
  })

  describe('getUnreadCount', () => {
    it('should return unread message count', async () => {
      mockSupabase.from().select().eq().eq().neq.mockResolvedValue({
        count: 5,
        error: null
      })

      const result = await chatService.getUnreadCount('room1', 'user1')

      expect(result).toBe(5)
    })

    it('should return 0 when no unread messages', async () => {
      mockSupabase.from().select().eq().eq().neq.mockResolvedValue({
        count: null,
        error: null
      })

      const result = await chatService.getUnreadCount('room1', 'user1')
      expect(result).toBe(0)
    })

    it('should throw error when count fails', async () => {
      mockSupabase.from().select().eq().eq().neq.mockResolvedValue({
        count: null,
        error: { message: 'Count failed' }
      })

      await expect(chatService.getUnreadCount('room1', 'user1')).rejects.toThrow('Erro ao buscar contagem de mensagens não lidas: Count failed')
    })
  })

  describe('searchMessages', () => {
    it('should search messages by content', async () => {
      const mockMessages = [
        {
          id: 'msg1',
          content: 'Hello world',
          sender_id: 'user1'
        }
      ]

      mockSupabase.from().select().eq().ilike().order.mockResolvedValue({
        data: mockMessages,
        error: null
      })

      const result = await chatService.searchMessages('room1', 'hello')

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_messages_pet')
      expect(result).toEqual(mockMessages)
    })

    it('should return empty array when no matches', async () => {
      mockSupabase.from().select().eq().ilike().order.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await chatService.searchMessages('room1', 'nonexistent')
      expect(result).toEqual([])
    })

    it('should throw error when search fails', async () => {
      mockSupabase.from().select().eq().ilike().order.mockResolvedValue({
        data: null,
        error: { message: 'Search failed' }
      })

      await expect(chatService.searchMessages('room1', 'hello')).rejects.toThrow('Erro ao buscar mensagens: Search failed')
    })
  })

  describe('createPrivateRoom', () => {
    it('should return existing private room if found', async () => {
      const existingRoom = {
        id: 'room1',
        room_type: 'private',
        chat_room_participants_pet: [
          { user_id: 'user1' },
          { user_id: 'user2' }
        ]
      }

      mockSupabase.from().select().eq().eq.mockResolvedValue({
        data: [existingRoom],
        error: null
      })

      const result = await chatService.createPrivateRoom('user1', 'user2')

      expect(result).toEqual(existingRoom)
    })

    it('should create new private room if none exists', async () => {
      const newRoom = {
        id: 'room1',
        room_type: 'private',
        created_by: 'user1'
      }

      // Mock existing room check
      mockSupabase.from().select().eq().eq.mockResolvedValueOnce({
        data: [],
        error: null
      })

      // Mock room creation
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: newRoom,
        error: null
      })

      // Mock participant additions
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: { id: 'participant1' },
        error: null
      })

      const result = await chatService.createPrivateRoom('user1', 'user2')

      expect(result).toEqual(newRoom)
    })
  })

  describe('createGroupRoom', () => {
    it('should create group room with participants', async () => {
      const newRoom = {
        id: 'room1',
        name: 'Test Group',
        room_type: 'group',
        created_by: 'user1'
      }

      // Mock room creation
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: newRoom,
        error: null
      })

      // Mock participant additions
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: { id: 'participant1' },
        error: null
      })

      const result = await chatService.createGroupRoom('Test Group', 'Test Description', 'user1', ['user2', 'user3'])

      expect(result).toEqual(newRoom)
    })
  })
})