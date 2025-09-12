import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFeedbackStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela feedback_pet...');
    
    // Tentar inserir um registro mínimo para descobrir a estrutura
    const testRecord = {
      type: 'test'
    };
    
    const { data, error } = await supabase
      .from('feedback_pet')
      .insert([testRecord])
      .select('*');
    
    if (error) {
      console.log('❌ Erro ao inserir registro de teste:', error.message);
      
      // Tentar com diferentes combinações de campos
      const fieldTests = [
        { type: 'test' },
        { message: 'test' },
        { content: 'test' },
        { feedback: 'test' },
        { description: 'test' },
        { text: 'test' }
      ];
      
      for (const test of fieldTests) {
        console.log(`\n🧪 Testando campos:`, Object.keys(test));
        
        const { data: testData, error: testError } = await supabase
          .from('feedback_pet')
          .insert([test])
          .select('*');
        
        if (testError) {
          console.log('❌ Erro:', testError.message);
        } else {
          console.log('✅ Sucesso! Estrutura encontrada:', Object.keys(testData[0]));
          
          // Limpar o registro de teste
          await supabase
            .from('feedback_pet')
            .delete()
            .eq('id', testData[0].id);
          
          return testData[0];
        }
      }
    } else {
      console.log('✅ Registro inserido com sucesso!');
      console.log('📋 Estrutura da tabela:', Object.keys(data[0]));
      
      // Limpar o registro de teste
      await supabase
        .from('feedback_pet')
        .delete()
        .eq('id', data[0].id);
      
      return data[0];
    }
    
    // Se nenhum teste funcionou, tentar buscar registros existentes
    console.log('\n🔍 Tentando buscar registros existentes...');
    
    const { data: existingData, error: selectError } = await supabase
      .from('feedback_pet')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('❌ Erro ao buscar registros:', selectError.message);
    } else if (existingData && existingData.length > 0) {
      console.log('✅ Registro existente encontrado!');
      console.log('📋 Estrutura da tabela:', Object.keys(existingData[0]));
      return existingData[0];
    } else {
      console.log('⚠️  Nenhum registro existente encontrado');
    }
    
    // Tentar descobrir a estrutura através de metadados
    console.log('\n🔍 Tentando descobrir estrutura através de consulta SQL...');
    
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'feedback_pet' });
    
    if (schemaError) {
      console.log('❌ Erro ao buscar schema:', schemaError.message);
    } else {
      console.log('✅ Schema encontrado:', schemaData);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkFeedbackStructure();