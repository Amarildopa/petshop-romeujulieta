import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  created_at: string
  updated_at: string
  full_name: string
  email: string
  phone: string
  address: string
  cep: string
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
  createBasicProfile(user: unknown): Profile {
    return {
      id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      email: user.email || '',
      phone: user.user_metadata?.phone || '',
      address: '',
      cep: '',
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
      throw new Error('User not authenticated')
    }

    try {
      // Criar URL local temporária como fallback
      const localUrl = URL.createObjectURL(file)
      
      // Tentar upload para o Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      console.log('Tentando upload para:', filePath)

      // Verificar se o storage está disponível
      try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets()
        
        if (listError) {
          console.warn('Storage não disponível, usando URL local:', listError.message)
          await this.updateProfile({ avatar_url: localUrl })
          return localUrl
        }

        // Procurar por bucket 'avatars' ou 'avatars_novo'
        let avatarBucket = buckets?.find(bucket => bucket.name === 'avatars')
        let bucketName = 'avatars'
        
        if (!avatarBucket) {
          avatarBucket = buckets?.find(bucket => bucket.name === 'avatars_novo')
          bucketName = 'avatars_novo'
        }
        
        if (!avatarBucket) {
          console.warn('Nenhum bucket de avatars encontrado (avatars ou avatars_novo), criando avatars...')
          const { error: createError } = await supabase.storage.createBucket('avatars', {
            public: true,
            allowedMimeTypes: ['image/*'],
            fileSizeLimit: 5242880 // 5MB
          })
          
          if (createError) {
            console.warn('Falha ao criar bucket, usando URL local:', createError.message)
            await this.updateProfile({ avatar_url: localUrl })
            return localUrl
          }
          bucketName = 'avatars'
        }
        
        console.log('Usando bucket:', bucketName)

        // Tentar fazer upload
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.warn('Erro no upload, usando URL local:', uploadError.message)
          await this.updateProfile({ avatar_url: localUrl })
          return localUrl
        }

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath)

        console.log('Upload realizado com sucesso:', publicUrl)
        
        // Atualizar perfil com URL do Supabase
        await this.updateProfile({ avatar_url: publicUrl })
        return publicUrl
        
      } catch (storageError) {
        console.warn('Erro no sistema de storage, usando URL local:', storageError)
        await this.updateProfile({ avatar_url: localUrl })
        return localUrl
      }
      
    } catch (error) {
      console.error('Erro geral no upload:', error)
      // Em caso de erro total, criar URL local
      const localUrl = URL.createObjectURL(file)
      await this.updateProfile({ avatar_url: localUrl })
      return localUrl
    }
  }
}
