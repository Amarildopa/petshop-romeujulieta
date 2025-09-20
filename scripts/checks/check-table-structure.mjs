import { createClient } from '@supabase/supabase-js'

// Configuração direta do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  console.log('🔍 Verificando estrutura da tabela pets_pet...')
  
  try {
    // Tentar obter informações sobre as colunas da tabela
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'pets_pet')
      .eq('table_schema', 'public')
      .order('ordinal_position')
    
    if (error) {
      console.error('❌ Erro ao obter estrutura da tabela:', error.message)
      
      // Tentar uma abordagem alternativa - listar todas as tabelas
      console.log('📋 Tentando listar todas as tabelas...')
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%pet%')
      
      if (tablesError) {
        console.error('❌ Erro ao listar tabelas:', tablesError.message)
      } else {
        console.log('📋 Tabelas encontradas:', tables)
      }
      
      return false
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ Tabela pets_pet não encontrada ou sem colunas')
      return false
    }
    
    console.log('✅ Estrutura da tabela pets_pet:')
    console.log('📋 Colunas encontradas:')
    data.forEach(column => {
      console.log(`  - ${column.column_name}: ${column.data_type} (${column.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
    })
    
    // Verificar se a coluna 'age' existe
    const ageColumn = data.find(col => col.column_name === 'age')
    if (ageColumn) {
      console.log('✅ Coluna "age" encontrada!')
    } else {
      console.log('❌ Coluna "age" NÃO encontrada!')
      console.log('💡 Colunas disponíveis:', data.map(col => col.column_name).join(', '))
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message)
    return false
  }
}

// Executar verificação
checkTableStructure()
  .then(success => {
    if (success) {
      console.log('🎉 Verificação concluída!')
    } else {
      console.log('💥 Falha na verificação!')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })