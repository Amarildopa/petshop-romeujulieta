import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Verificando estrutura da tabela pets_pet...');
  
  try {
    // Tentar fazer uma consulta simples para ver se a tabela existe
    const { data, error } = await supabase
      .from('pets_pet')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Erro ao acessar tabela pets_pet:', error);
      return;
    }

    console.log('✅ Tabela pets_pet acessível');
    console.log('📊 Dados de exemplo (se houver):', data);

    // Tentar inserir um registro mínimo para testar
    const testData = {
      owner_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Teste Simples',
      species: 'Cão',
      breed: 'SRD',
      age: '2 anos',
      weight: 15, // Número sem unidade
      height: 50, // Número sem unidade
      color: 'Marrom',
      gender: 'Macho'
    };

    console.log('🧪 Testando inserção com dados mínimos:', testData);

    const { data: insertData, error: insertError } = await supabase
      .from('pets_pet')
      .insert(testData)
      .select();

    if (insertError) {
      console.log('❌ Erro na inserção:', insertError);
    } else {
      console.log('✅ Inserção bem-sucedida:', insertData);
      
      // Limpar o registro de teste
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('pets_pet')
          .delete()
          .eq('id', insertData[0].id);
        
        if (deleteError) {
          console.log('⚠️ Erro ao limpar registro de teste:', deleteError);
        } else {
          console.log('🧹 Registro de teste removido com sucesso');
        }
      }
    }

  } catch (error) {
    console.log('❌ Erro geral:', error);
  }
}

checkTableStructure();