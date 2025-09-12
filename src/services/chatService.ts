import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type ChatMessage = Database['public']['Tables']['chat_messages_pet']['Row'];
type ChatMessageInsert = Database['public']['Tables']['chat_messages_pet']['Insert'];
type ChatMessageUpdate = Database['public']['Tables']['chat_messages_pet']['Update'];

type ChatRoom = Database['public']['Tables']['chat_rooms_pet']['Row'];
type ChatRoomInsert = Database['public']['Tables']['chat_rooms_pet']['Insert'];
type ChatRoomUpdate = Database['public']['Tables']['chat_rooms_pet']['Update'];

type ChatRoomParticipant = Database['public']['Tables']['chat_room_participants_pet']['Row'];

export class ChatService {
  async getChatRooms(userId: string): Promise<ChatRoom[]> {
    const { data, error } = await supabase
      .from('chat_rooms_pet')
      .select(`
        *,
        chat_room_participants_pet!inner (
          user_id,
          role,
          last_read_at,
          is_muted,
          is_archived
        )
      `)
      .eq('chat_room_participants_pet.user_id', userId)
      .eq('is_active', true)
      .order('last_message_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar salas de chat: ${error.message}`);
    }

    return data || [];
  }

  async getChatRoom(roomId: string): Promise<ChatRoom | null> {
    const { data, error } = await supabase
      .from('chat_rooms_pet')
      .select(`
        *,
        chat_room_participants_pet (
          user_id,
          role,
          last_read_at,
          is_muted,
          is_archived
        )
      `)
      .eq('id', roomId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar sala de chat: ${error.message}`);
    }

    return data;
  }

  async createChatRoom(room: ChatRoomInsert): Promise<ChatRoom> {
    const { data, error } = await supabase
      .from('chat_rooms_pet')
      .insert(room)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar sala de chat: ${error.message}`);
    }

    return data;
  }

  async updateChatRoom(roomId: string, updates: ChatRoomUpdate): Promise<ChatRoom> {
    const { data, error } = await supabase
      .from('chat_rooms_pet')
      .update(updates)
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar sala de chat: ${error.message}`);
    }

    return data;
  }

  async deleteChatRoom(roomId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_rooms_pet')
      .update({ is_active: false })
      .eq('id', roomId);

    if (error) {
      throw new Error(`Erro ao deletar sala de chat: ${error.message}`);
    }
  }

  async addParticipant(roomId: string, userId: string, role: string = 'member'): Promise<ChatRoomParticipant> {
    const { data, error } = await supabase
      .from('chat_room_participants_pet')
      .insert({
        room_id: roomId,
        user_id: userId,
        role
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao adicionar participante: ${error.message}`);
    }

    return data;
  }

  async removeParticipant(roomId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_room_participants_pet')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao remover participante: ${error.message}`);
    }
  }

  async updateParticipant(roomId: string, userId: string, updates: Partial<ChatRoomParticipant>): Promise<ChatRoomParticipant> {
    const { data, error } = await supabase
      .from('chat_room_participants_pet')
      .update(updates)
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar participante: ${error.message}`);
    }

    return data;
  }

  async getMessages(roomId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages_pet')
      .select(`
        *,
        profiles_pet!chat_messages_pet_sender_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('chat_room_id', roomId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Erro ao buscar mensagens: ${error.message}`);
    }

    return (data || []).reverse();
  }

  async sendMessage(message: ChatMessageInsert): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages_pet')
      .insert(message)
      .select(`
        *,
        profiles_pet!chat_messages_pet_sender_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao enviar mensagem: ${error.message}`);
    }

    // Atualizar última mensagem da sala
    await supabase
      .from('chat_rooms_pet')
      .update({
        last_message_at: data.created_at,
        last_message_id: data.id
      })
      .eq('id', message.chat_room_id);

    return data;
  }

  async updateMessage(messageId: string, updates: ChatMessageUpdate): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages_pet')
      .update({
        ...updates,
        is_edited: true,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select(`
        *,
        profiles_pet!chat_messages_pet_sender_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar mensagem: ${error.message}`);
    }

    return data;
  }

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages_pet')
      .delete()
      .eq('id', messageId);

    if (error) {
      throw new Error(`Erro ao deletar mensagem: ${error.message}`);
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages_pet')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .neq('sender_id', userId);

    if (error) {
      throw new Error(`Erro ao marcar mensagem como lida: ${error.message}`);
    }
  }

  async markRoomAsRead(roomId: string, userId: string): Promise<void> {
    // Marcar todas as mensagens não lidas da sala como lidas
    await supabase
      .from('chat_messages_pet')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('chat_room_id', roomId)
      .eq('is_read', false)
      .neq('sender_id', userId);

    // Atualizar último horário de leitura do participante
    await supabase
      .from('chat_room_participants_pet')
      .update({
        last_read_at: new Date().toISOString()
      })
      .eq('room_id', roomId)
      .eq('user_id', userId);
  }

  async getUnreadCount(roomId: string, userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('chat_messages_pet')
      .select('*', { count: 'exact', head: true })
      .eq('chat_room_id', roomId)
      .eq('is_read', false)
      .neq('sender_id', userId);

    if (error) {
      throw new Error(`Erro ao buscar contagem de mensagens não lidas: ${error.message}`);
    }

    return count || 0;
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('chat_room_participants_pet')
      .select(`
        room_id,
        last_read_at
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao buscar salas do usuário: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return 0;
    }

    const roomIds = data.map(participant => participant.room_id);
    const lastReadTimes = data.reduce((acc, participant) => {
      acc[participant.room_id] = participant.last_read_at;
      return acc;
    }, {} as Record<string, string | null>);

    let totalUnread = 0;

    for (const roomId of roomIds) {
      const lastReadAt = lastReadTimes[roomId];
      const query = supabase
        .from('chat_messages_pet')
        .select('*', { count: 'exact', head: true })
        .eq('chat_room_id', roomId)
        .neq('sender_id', userId);

      if (lastReadAt) {
        query.gt('created_at', lastReadAt);
      }

      const { count, error: countError } = await query;

      if (countError) {
        console.error(`Erro ao contar mensagens não lidas da sala ${roomId}:`, countError);
        continue;
      }

      totalUnread += count || 0;
    }

    return totalUnread;
  }

  async createPrivateRoom(userId1: string, userId2: string): Promise<ChatRoom> {
    // Verificar se já existe uma sala privada entre os dois usuários
    const { data: existingRoom, error: checkError } = await supabase
      .from('chat_rooms_pet')
      .select(`
        *,
        chat_room_participants_pet (user_id)
      `)
      .eq('room_type', 'private')
      .eq('is_active', true);

    if (checkError) {
      throw new Error(`Erro ao verificar sala existente: ${checkError.message}`);
    }

    // Verificar se existe sala com ambos os usuários
    const existingPrivateRoom = existingRoom?.find(room => {
      const participants = room.chat_room_participants_pet as any[];
      const userIds = participants.map(p => p.user_id);
      return userIds.includes(userId1) && userIds.includes(userId2);
    });

    if (existingPrivateRoom) {
      return existingPrivateRoom;
    }

    // Criar nova sala privada
    const room = await this.createChatRoom({
      room_type: 'private',
      created_by: userId1
    });

    // Adicionar ambos os usuários
    await Promise.all([
      this.addParticipant(room.id, userId1, 'member'),
      this.addParticipant(room.id, userId2, 'member')
    ]);

    return room;
  }

  async createGroupRoom(name: string, description: string, createdBy: string, participantIds: string[]): Promise<ChatRoom> {
    const room = await this.createChatRoom({
      name,
      description,
      room_type: 'group',
      created_by: createdBy
    });

    // Adicionar criador como admin
    await this.addParticipant(room.id, createdBy, 'admin');

    // Adicionar outros participantes
    for (const userId of participantIds) {
      await this.addParticipant(room.id, userId, 'member');
    }

    return room;
  }

  async searchMessages(roomId: string, query: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages_pet')
      .select(`
        *,
        profiles_pet!chat_messages_pet_sender_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('chat_room_id', roomId)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar mensagens: ${error.message}`);
    }

    return data || [];
  }
}

export const chatService = new ChatService();
export type { ChatMessage, ChatMessageInsert, ChatMessageUpdate, ChatRoom, ChatRoomInsert, ChatRoomUpdate, ChatRoomParticipant };
