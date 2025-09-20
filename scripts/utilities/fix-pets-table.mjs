import { createClient } from '@supabase/supabase-js'

// Configuração direta do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixPetsTable() {
  console.log('🔍 Verificando e corrigindo a tabela pets_pet...')
  
  try {
    // 1. Primeiro, vamos tentar fazer uma consulta simples para verificar se a tabela existe
    console.log('1. Testando conexão básica com a tabela pets_pet...')
    const { data: testData, error: testError } = await supabase
      .from('pets_pet')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erro ao acessar a tabela pets_pet:', testError.message)
      return
    }
    
    console.log('✅ Tabela pets_pet acessível')
    
    // 2. Vamos tentar fazer uma consulta que inclua a coluna age
    console.log('2. Testando acesso à coluna age...')
    const { data: ageData, error: ageError } = await supabase
      .from('pets_pet')
      .select('id, age')
      .limit(1)
    
    if (ageError) {
      console.error('❌ Erro ao acessar a coluna age:', ageError.message)
      console.log('🔧 Tentando recriar a tabela com a estrutura correta...')
      
      // 3. Se houver erro com a coluna age, vamos tentar adicionar ela
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE pets_pet 
          ADD COLUMN IF NOT EXISTS age TEXT;
        `
      })
      
      if (alterError) {
        console.error('❌ Erro ao adicionar coluna age:', alterError.message)
      } else {
        console.log('✅ Coluna age adicionada com sucesso')
      }
    } else {
      console.log('✅ Coluna age acessível')
    }
    
    // 4. Agora vamos tentar criar um pet de teste
    console.log('3. Testando criação de pet...')
    const testPet = {
      owner_id: 'test-owner-123',
      name: 'Pet Teste',
      species: 'Cão',
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
      console.error('❌ Erro ao criar pet de teste:', createError.message)
      console.error('Detalhes do erro:', createError)
    } else {
      console.log('✅ Pet de teste criado com sucesso:', createData)
      
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

fixPetsTable()