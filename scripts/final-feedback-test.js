import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFeedbackTable() {
  console.log('🔍 DIAGNÓSTICO FINAL DA TABELA FEEDBACK_PET');
  console.log('=' .repeat(50));
  
  try {
    // 1. Verificar se a tabela existe
    console.log('\n1️⃣ Verificando se a tabela existe...');
    
    const { data: tableCheck, error: tableError } = await supabase
      .from('feedback_pet')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.log('❌ Tabela não existe ou não é acessível:', tableError.message);
      return;
    }
    
    console.log('✅ Tabela existe e é acessível');
    
    // 2. Tentar inserir apenas com campo obrigatório
    console.log('\n2️⃣ Testando inserção com campo mínimo...');
    
    const minimalRecord = {
      type: 'service'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('feedback_pet')
      .insert([minimalRecord])
      .select('*');
    
    if (insertError) {
      console.log('❌ Erro na inserção mínima:', insertError.message);
      
      if (insertError.message.includes('row-level security')) {
        console.log('\n🔒 PROBLEMA: Políticas RLS estão bloqueando inserções');
        console.log('💡 SOLUÇÃO: Execute o script SQL diretamente no Supabase:');
        console.log('   1. Acesse o Supabase Dashboard');
        console.log('   2. Vá para SQL Editor');
        console.log('   3. Execute o arquivo: scripts/insert-feedback-sql.sql');
        
        // Vamos tentar pelo menos verificar se conseguimos ler dados existentes
        console.log('\n3️⃣ Tentando ler dados existentes...');
        
        const { data: existingData, error: readError } = await supabase
          .from('feedback_pet')
          .select('*')
          .limit(5);
        
        if (readError) {
          console.log('❌ Erro ao ler dados:', readError.message);
        } else {
          console.log(`✅ Conseguimos ler dados! Total encontrado: ${existingData?.length || 0}`);
          
          if (existingData && existingData.length > 0) {
            console.log('📋 Estrutura da tabela:', Object.keys(existingData[0]));
            console.log('📄 Exemplo de registro:', existingData[0]);
          }
        }
        
        return;
      }
      
      if (insertError.message.includes('column')) {
        console.log('❌ Problema de estrutura da tabela:', insertError.message);
        console.log('💡 A tabela no banco pode estar desatualizada');
        return;
      }
    } else {
      console.log('✅ Inserção bem-sucedida!');
      console.log('📋 Estrutura da tabela:', Object.keys(insertData[0]));
      console.log('📄 Registro inserido:', insertData[0]);
      
      // Limpar o registro de teste
      await supabase
        .from('feedback_pet')
        .delete()
        .eq('id', insertData[0].id);
      
      console.log('🧹 Registro de teste removido');
    }
    
    // 4. Resumo final
    console.log('\n' + '=' .repeat(50));
    console.log('📊 RESUMO:');
    
    const { data: finalCount, error: countError } = await supabase
      .from('feedback_pet')
      .select('*', { count: 'exact' });
    
    if (!countError) {
      console.log(`📈 Total de registros na tabela: ${finalCount?.length || 0}`);
      
      if (finalCount && finalCount.length === 0) {
        console.log('\n🎯 PRÓXIMOS PASSOS:');
        console.log('1. Execute o script SQL no Supabase Dashboard');
        console.log('2. Ou configure um usuário admin para contornar RLS');
        console.log('3. Ou desabilite temporariamente RLS para inserir dados de teste');
      } else {
        console.log('✅ Tabela tem dados! Podemos implementar a busca na home.');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testFeedbackTable();