import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFeedbackData() {
  try {
    console.log('🔍 Verificando dados na tabela feedback_pet...');
    
    // Verificar se existem registros na tabela feedback_pet
    const { data: feedbacks, error, count } = await supabase
      .from('feedback_pet')
      .select('*', { count: 'exact' })
      .limit(10);
    
    if (error) {
      console.error('❌ Erro ao consultar feedback_pet:', error.message);
      return;
    }
    
    console.log(`📊 Total de registros encontrados: ${count}`);
    
    if (count === 0) {
      console.log('⚠️  Nenhum registro encontrado na tabela feedback_pet');
      console.log('💡 Será necessário criar dados de exemplo para implementar a busca no banco');
    } else {
      console.log('✅ Registros encontrados:');
      feedbacks.forEach((feedback, index) => {
        console.log(`${index + 1}. ID: ${feedback.id}`);
        console.log(`   Usuário: ${feedback.user_id}`);
        console.log(`   Tipo: ${feedback.type}`);
        console.log(`   Status: ${feedback.status}`);
        console.log(`   Criado em: ${feedback.created_at}`);
        console.log('   ---');
      });
    }
    
    // Verificar também a estrutura da tabela
    console.log('\n🏗️  Verificando estrutura da tabela...');
    const { data: structure, error: structureError } = await supabase
      .from('feedback_pet')
      .select('*')
      .limit(1);
    
    if (!structureError && structure && structure.length > 0) {
      console.log('📋 Colunas disponíveis:', Object.keys(structure[0]).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkFeedbackData();