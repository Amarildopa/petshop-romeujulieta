import { createClient } from '@supabase/supabase-js'

// Configuração direta do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function applySchema() {
  console.log('🔧 Aplicando schema correto para a tabela pets_pet...')
  
  try {
    // 1. Primeiro, vamos verificar se a tabela existe
    console.log('1. Verificando estrutura atual da tabela...')
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'pets_pet')
      .eq('table_schema', 'public')
    
    if (columnsError) {
      console.log('❌ Erro ao verificar colunas (isso é esperado):', columnsError.message)
    } else {
      console.log('📋 Colunas atuais:', columns)
    }
    
    // 2. Vamos tentar adicionar as colunas que estão faltando
    console.log('2. Adicionando colunas faltantes...')
    
    const alterCommands = [
      'ALTER TABLE pets_pet ADD COLUMN IF NOT EXISTS age TEXT;',
      'ALTER TABLE pets_pet ADD COLUMN IF NOT EXISTS weight TEXT;',
      'ALTER TABLE pets_pet ADD COLUMN IF NOT EXISTS height TEXT;',
      'ALTER TABLE pets_pet ADD COLUMN IF NOT EXISTS color TEXT;',
      'ALTER TABLE pets_pet ADD COLUMN IF NOT EXISTS gender TEXT;',
      'ALTER TABLE pets_pet ADD COLUMN IF NOT EXISTS personality TEXT[] DEFAULT \'{}\';',
      'ALTER TABLE pets_pet ADD COLUMN IF NOT EXISTS allergies TEXT[] DEFAULT \'{}\';',
      'ALTER TABLE pets_pet ADD COLUMN IF NOT EXISTS medications TEXT[] DEFAULT \'{}\';'
    ]
    
    for (const command of alterCommands) {
      console.log(`Executando: ${command}`)
      
      // Usando uma query SQL direta
      const { error } = await supabase.rpc('exec', { sql: command })
      
      if (error) {
        console.log(`⚠️ Erro (pode ser esperado se a coluna já existir): ${error.message}`)
      } else {
        console.log('✅ Comando executado com sucesso')
      }
    }
    
    // 3. Agora vamos tentar criar um pet de teste
    console.log('3. Testando criação de pet após correções...')
    const testPet = {
      owner_id: 'test-owner-123',
      name: 'Pet Teste',
      species: 'Cachorro',
      breed: 'Labrador',
      age: '3 anos',
      weight: '25kg',
      height: '60cm',
      color: 'Dourado',
      gender: 'Macho',
      personality: ['Brincalhão', 'Amigável'],
      allergies: [],
      medications: []
    }
    
    const { data: createData, error: createError } = await supabase
      .from('pets_pet')
      .insert(testPet)
      .select()
    
    if (createError) {
      console.error('❌ Ainda há erro ao criar pet:', createError.message)
      console.error('Detalhes:', createError)
    } else {
      console.log('✅ Pet de teste criado com sucesso!')
      console.log('📋 Dados:', createData)
      
      // Limpar o pet de teste
      if (createData && createData[0]) {
        await supabase
          .from('pets_pet')
          .delete()
          .eq('id', createData[0].id)
        console.log('🧹 Pet de teste removido')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

applySchema()