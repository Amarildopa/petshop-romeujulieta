import { supabase } from '../lib/supabase'
import { profileService } from './profileService'

// Função para calcular idade baseada na data de nascimento
const calculateAge = (birthDate: string): string => {
  if (!birthDate) return '';
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age > 0 ? `${age} anos` : 'Menos de 1 ano';
};

export interface Vaccination {
  name: string
  nextDue: string
  lastGiven?: string
}

export interface Pet {
  id: string
  created_at: string
  updated_at: string
  owner_id: string
  name: string
  species: string
  breed: string
  birth_date?: string | null
  death_date?: string | null  // Data de óbito do pet
  age?: string | null
  weight?: number | null  // NUMERIC no banco
  height?: string | null  // TEXT no banco
  color?: string | null
  gender?: string | null
  avatar_url?: string | null  // Corrigido: era image_url, agora avatar_url
  microchip_id?: string | null
  notes?: string | null
  is_active?: boolean
  personality?: string[]
  allergies?: string[]
  medications?: string[]
  vaccinations?: Vaccination[]
}

export const petsService = {
  // Get all pets for the authenticated user
  async getPets(): Promise<Pet[]> {
    // Verificar se há uma sessão ativa antes de fazer a consulta
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      throw new Error(`Erro de autenticação: ${sessionError.message}`)
    }
    
    if (!session) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('pets_pet')
      .select('*')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar pets: ${error.message}`)
    }

    return data || []
  },

  // Get a single pet by ID
  async getPetById(id: string): Promise<Pet | null> {
    // Verificar se há uma sessão ativa antes de fazer a consulta
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      throw new Error(`Erro de autenticação: ${sessionError.message}`)
    }
    
    if (!session) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('pets_pet')
      .select('*')
      .eq('id', id)
      .eq('owner_id', session.user.id)
      .single()

    if (error) {
      // PGRST116 means no rows found, which is expected for non-existent pets
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Erro ao buscar pet: ${error.message}`)
    }

    return data
  },

  // Create a new pet
  async createPet(petData: Omit<Pet, 'id' | 'created_at' | 'updated_at' | 'owner_id'>): Promise<Pet> {
    // Verificar se há uma sessão ativa antes de fazer a inserção
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      throw new Error(`Erro de autenticação: ${sessionError.message}`)
    }
    
    if (!session) {
      throw new Error('Usuário não autenticado')
    }

    // Debug: Log do usuário atual
    console.log('👤 Usuário atual:', session.user.id);
    console.log('📧 Email do usuário:', session.user.email);

    // Garantir que o perfil do usuário existe no banco
    await profileService.ensureProfileExists();

    // Processar weight e height para converter strings com unidades para números
    // Calcular idade automaticamente se birth_date estiver presente
    const processedData = {
      ...petData,
      weight: typeof petData.weight === 'string' 
        ? parseFloat(petData.weight.replace(/[^\d.,]/g, '').replace(',', '.')) || null
        : petData.weight,
      height: petData.height, // height permanece como string no banco
      age: petData.birth_date ? calculateAge(petData.birth_date) : petData.age,
      owner_id: session.user.id
    }

    // Debug: Log dos dados processados que serão inseridos
    console.log('📝 Dados processados para inserção:', processedData);

    const { data, error } = await supabase
      .from('pets_pet')
      .insert(processedData)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao inserir pet:', error);
      throw new Error(`Erro ao criar pet: ${error.message}`)
    }

    console.log('✅ Pet inserido no banco:', data);
    return data
  },

  // Update a pet
  async updatePet(id: string, updates: Partial<Omit<Pet, 'id' | 'created_at' | 'updated_at' | 'owner_id'>>): Promise<Pet> {
    // Verificar se há uma sessão ativa antes de fazer a atualização
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      throw new Error(`Erro de autenticação: ${sessionError.message}`)
    }
    
    if (!session) {
      throw new Error('Usuário não autenticado')
    }

    // Converter weight para número se for string com unidades, height permanece como string
    // Calcular idade automaticamente se birth_date estiver sendo atualizada
    const processedUpdates = { ...updates }
    
    if (processedUpdates.weight && typeof processedUpdates.weight === 'string') {
      processedUpdates.weight = parseFloat(processedUpdates.weight.replace(/[^\d.,]/g, '').replace(',', '.')) || null
    }
    
    // Calcular idade automaticamente se birth_date estiver sendo atualizada
    if (processedUpdates.birth_date) {
      processedUpdates.age = calculateAge(processedUpdates.birth_date)
    }
    
    // height não precisa ser convertido pois é TEXT no banco

    const { data, error } = await supabase
      .from('pets_pet')
      .update({
        ...processedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('owner_id', session.user.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar pet: ${error.message}`)
    }

    return data
  },

  // Delete a pet
  async deletePet(id: string): Promise<void> {
    // Verificar se há uma sessão ativa antes de fazer a exclusão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      throw new Error(`Erro de autenticação: ${sessionError.message}`)
    }
    
    if (!session) {
      throw new Error('Usuário não autenticado')
    }

    const { error } = await supabase
      .from('pets_pet')
      .delete()
      .eq('id', id)
      .eq('owner_id', session.user.id)

    if (error) {
      throw new Error(`Erro ao deletar pet: ${error.message}`)
    }
  }
}
