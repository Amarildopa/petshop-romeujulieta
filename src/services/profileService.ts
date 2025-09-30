import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  created_at: string
  updated_at: string
  full_name: string
  email: string
  phone: string
  cpf: string
  cep: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  complement: string
  address: string
  avatar_url: string | null
}

export const profileService = {
  // Get current user profile
  async getProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }

    try {
      // Primeiro, tentar criar o perfil se não existir
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles_pet')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (fetchError) {
        console.warn('Error fetching profile:', fetchError.message)
        // Se a tabela não existe ou há erro, criar perfil básico
        return this.createBasicProfile(user)
      }

      if (!existingProfile) {
        // Perfil não existe, criar um básico
        return this.createBasicProfile(user)
      }

      return existingProfile
    } catch (error) {
      console.warn('Error fetching profile, creating basic profile:', error)
      return this.createBasicProfile(user)
    }
  },

  // Ensure profile exists in database
  async ensureProfileExists(): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se o perfil já existe
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles_pet')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (fetchError) {
      throw new Error(`Erro ao verificar perfil: ${fetchError.message}`)
    }

    // Se o perfil já existe, retorná-lo
    if (existingProfile) {
      return existingProfile
    }

    // Se não existe, criar um perfil básico
    const basicProfile = this.createBasicProfile(user)
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles_pet')
      .insert(basicProfile)
      .select()
      .single()

    if (insertError) {
      throw new Error(`Erro ao criar perfil: ${insertError.message}`)
    }

    return newProfile
  },

  // Create basic profile from user data
  createBasicProfile(user: User): Profile {
    return {
      id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      email: user.email || '',
      phone: user.user_metadata?.phone || '',
      cpf: '',
      cep: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      complement: '',
      address: '',
      avatar_url: user.user_metadata?.avatar_url || null
    }
  },

  // Update profile
  async updateProfile(updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'email'>>): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // Tentar atualizar o perfil existente
      const { data, error } = await supabase
        .from('profiles_pet')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        // Se falhar, tentar inserir um novo perfil
        console.warn('Error updating profile, trying to insert:', error.message)
        const newProfile = this.createBasicProfile(user)
        const profileToInsert = { ...newProfile, ...updates }
        
        const { data: insertedData, error: insertError } = await supabase
          .from('profiles_pet')
          .insert(profileToInsert)
          .select()
          .single()

        if (insertError) {
          // Se inserir também falhar, retornar perfil local
          console.warn('Error inserting profile, returning local profile:', insertError.message)
          return { ...newProfile, ...updates }
        }

        return insertedData
      }

      return data
    } catch (error) {
      console.warn('Error updating profile, returning local profile:', error)
      // Retornar perfil local em caso de erro
      const basicProfile = this.createBasicProfile(user)
      return { ...basicProfile, ...updates }
    }
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Validações básicas
    if (!file.type.startsWith('image/')) {
      throw new Error('Por favor, selecione apenas arquivos de imagem.')
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      throw new Error('A imagem deve ter no máximo 5MB.')
    }

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      // Upload direto para o bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`)
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl

      // Atualizar perfil com a nova URL
      await this.updateProfile({ avatar_url: publicUrl })
      
      return publicUrl
      
    } catch (error) {
      console.error('Erro no upload do avatar:', error)
      throw error
    }
  }
}
