// Usando fetch nativo do Node.js (disponível a partir da versão 18)
// import fetch from 'node-fetch'

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'

async function executeSQL(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({ sql })
    })
    
    const result = await response.text()
    console.log('Response:', response.status, result)
    
    return { success: response.ok, result }
  } catch (error) {
    console.error('Erro ao executar SQL:', error.message)
    return { success: false, error: error.message }
  }
}

async function fixPetsTable() {
  console.log('🔧 Tentando corrigir a tabela pets_pet via SQL direto...')
  
  // Primeiro, vamos tentar dropar e recriar a tabela
  const dropSQL = 'DROP TABLE IF EXISTS pets_pet CASCADE;'
  console.log('1. Removendo tabela existente...')
  await executeSQL(dropSQL)
  
  // Agora vamos recriar com a estrutura correta
  const createSQL = `
    CREATE TABLE pets_pet (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      breed TEXT NOT NULL,
      age TEXT NOT NULL,
      weight TEXT NOT NULL,
      height TEXT NOT NULL,
      color TEXT NOT NULL,
      gender TEXT NOT NULL,
      image_url TEXT,
      personality TEXT[] DEFAULT '{}',
      allergies TEXT[] DEFAULT '{}',
      medications TEXT[] DEFAULT '{}'
    );
  `
  
  console.log('2. Criando tabela com estrutura correta...')
  const createResult = await executeSQL(createSQL)
  
  if (createResult.success) {
    console.log('✅ Tabela criada com sucesso!')
    
    // Agora vamos testar a inserção
    console.log('3. Testando inserção de pet...')
    
    const insertSQL = `
      INSERT INTO pets_pet (owner_id, name, species, breed, age, weight, height, color, gender, personality, allergies, medications)
      VALUES ('test-owner-123', 'Pet Teste', 'Cachorro', 'Labrador', '3 anos', '25kg', '60cm', 'Dourado', 'Macho', '{"Brincalhão", "Amigável"}', '{}', '{}')
      RETURNING *;
    `
    
    const insertResult = await executeSQL(insertSQL)
    
    if (insertResult.success) {
      console.log('✅ Pet inserido com sucesso!')
      
      // Limpar o teste
      const deleteSQL = "DELETE FROM pets_pet WHERE name = 'Pet Teste';"
      await executeSQL(deleteSQL)
      console.log('🧹 Pet de teste removido')
    } else {
      console.log('❌ Erro ao inserir pet:', insertResult.result)
    }
  } else {
    console.log('❌ Erro ao criar tabela:', createResult.result)
  }
}

fixPetsTable()