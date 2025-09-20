import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - Usando as credenciais reais do projeto
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPetCreation() {
  console.log('🧪 Iniciando teste de criação de pet...');
  
  try {
    // Primeiro, vamos verificar se conseguimos conectar
    console.log('📡 Testando conexão com Supabase...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('pets_pet')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Erro de conexão:', connectionError);
      return;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Dados de teste para o pet
    const testPet = {
      owner_id: '550e8400-e29b-41d4-a716-446655440000', // UUID válido para teste
      name: 'Rex Teste',
      species: 'Cão',
      breed: 'Labrador',
      age: '3 anos',
      weight: '25kg',
      height: '60cm',
      color: 'Dourado',
      gender: 'Macho',
      personality: ['Brincalhão', 'Amigável'],
      allergies: ['Nenhuma'],
      medications: ['Nenhuma']
    };
    
    console.log('🐕 Tentando criar pet com dados:', testPet);
    
    // Tentar criar o pet
    const { data: newPet, error: createError } = await supabase
      .from('pets_pet')
      .insert([testPet])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Erro ao criar pet:', createError);
      console.error('Detalhes do erro:', createError.message);
      console.error('Código do erro:', createError.code);
      return;
    }
    
    console.log('✅ Pet criado com sucesso!');
    console.log('📋 Dados do pet criado:', newPet);
    
    // Verificar se o pet foi realmente salvo
    const { data: savedPet, error: fetchError } = await supabase
      .from('pets_pet')
      .select('*')
      .eq('id', newPet.id)
      .single();
    
    if (fetchError) {
      console.error('❌ Erro ao buscar pet criado:', fetchError);
      return;
    }
    
    console.log('✅ Pet encontrado no banco:', savedPet);
    
    // Limpar dados de teste (opcional)
    console.log('🧹 Removendo pet de teste...');
    const { error: deleteError } = await supabase
      .from('pets_pet')
      .delete()
      .eq('id', newPet.id);
    
    if (deleteError) {
      console.error('⚠️ Erro ao remover pet de teste:', deleteError);
    } else {
      console.log('✅ Pet de teste removido com sucesso!');
    }
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

// Executar o teste
testPetCreation();