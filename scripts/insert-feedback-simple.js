import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados mais simples - apenas campos que sabemos que existem
const simpleFeedbacks = [
  {
    type: 'service',
    rating: 5,
    title: 'Excelente atendimento'
  },
  {
    type: 'product', 
    rating: 4,
    title: 'Produto de qualidade'
  },
  {
    type: 'service',
    rating: 5, 
    title: 'Muito satisfeito'
  }
];

async function insertSimpleFeedbacks() {
  try {
    console.log('🚀 Tentando inserir feedbacks simples...');
    
    // Tentar inserir um por vez para identificar qual campo causa problema
    for (let i = 0; i < simpleFeedbacks.length; i++) {
      const feedback = simpleFeedbacks[i];
      console.log(`\n📝 Tentando inserir feedback ${i + 1}:`, feedback);
      
      const { data, error } = await supabase
        .from('feedback_pet')
        .insert([feedback])
        .select('*');
      
      if (error) {
        console.log(`❌ Erro no feedback ${i + 1}:`, error.message);
        
        // Se for erro de RLS, tentar sem user_id
        if (error.message.includes('row-level security')) {
          console.log('🔄 Tentando sem autenticação...');
          // Não podemos contornar RLS com anon key
        }
        
        // Se for erro de coluna, tentar apenas com type
        if (error.message.includes('column')) {
          console.log('🔄 Tentando apenas com type...');
          
          const { data: simpleData, error: simpleError } = await supabase
            .from('feedback_pet')
            .insert([{ type: feedback.type }])
            .select('*');
          
          if (simpleError) {
            console.log('❌ Erro mesmo com type apenas:', simpleError.message);
          } else {
            console.log('✅ Sucesso com type apenas!');
          }
        }
      } else {
        console.log(`✅ Feedback ${i + 1} inserido com sucesso!`);
        console.log('📋 Estrutura retornada:', Object.keys(data[0]));
      }
    }
    
    // Verificar quantos registros temos agora
    console.log('\n🔍 Verificando total de registros...');
    
    const { data: allData, error: countError } = await supabase
      .from('feedback_pet')
      .select('*', { count: 'exact' });
    
    if (countError) {
      console.log('❌ Erro ao contar registros:', countError.message);
    } else {
      console.log(`📊 Total de registros na tabela: ${allData?.length || 0}`);
      
      if (allData && allData.length > 0) {
        console.log('📋 Estrutura da tabela:', Object.keys(allData[0]));
        console.log('📄 Primeiro registro:', allData[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

insertSimpleFeedbacks();