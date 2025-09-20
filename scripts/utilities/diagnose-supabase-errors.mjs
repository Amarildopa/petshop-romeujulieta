import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseSupabaseErrors() {
  console.log('🔍 Iniciando diagnóstico dos erros do Supabase...\n');

  // Test 1: Check profiles_pet table (Error 406)
  console.log('📋 Teste 1: Verificando tabela profiles_pet (Erro 406)');
  try {
    const { data, error } = await supabase
      .from('profiles_pet')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro na consulta profiles_pet:', error);
      console.log('   Código:', error.code);
      console.log('   Mensagem:', error.message);
      console.log('   Detalhes:', error.details);
    } else {
      console.log('✅ Consulta profiles_pet bem-sucedida');
      console.log('   Dados retornados:', data?.length || 0, 'registros');
    }
  } catch (err) {
    console.log('💥 Exceção na consulta profiles_pet:', err.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Check pets_pet table (Error 400)
  console.log('🐕 Teste 2: Verificando tabela pets_pet (Erro 400)');
  try {
    const { data, error } = await supabase
      .from('pets_pet')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro na consulta pets_pet:', error);
      console.log('   Código:', error.code);
      console.log('   Mensagem:', error.message);
      console.log('   Detalhes:', error.details);
    } else {
      console.log('✅ Consulta pets_pet bem-sucedida');
      console.log('   Dados retornados:', data?.length || 0, 'registros');
    }
  } catch (err) {
    console.log('💥 Exceção na consulta pets_pet:', err.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Check RLS policies
  console.log('🔒 Teste 3: Verificando políticas RLS');
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Status de autenticação:', user ? 'Autenticado' : 'Não autenticado');
    
    if (user) {
      console.log('   ID do usuário:', user.id);
      console.log('   Email:', user.email);
    }
  } catch (err) {
    console.log('💥 Erro ao verificar autenticação:', err.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Check table structure
  console.log('🏗️ Teste 4: Verificando estrutura das tabelas');
  
  // Check if tables exist
  const tables = ['profiles_pet', 'pets_pet'];
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0); // Just check if table exists
      
      if (error && error.code === 'PGRST106') {
        console.log(`❌ Tabela ${table} não encontrada`);
      } else if (error) {
        console.log(`⚠️ Tabela ${table} existe mas há erro de acesso:`, error.message);
      } else {
        console.log(`✅ Tabela ${table} existe e é acessível`);
      }
    } catch (err) {
      console.log(`💥 Erro ao verificar tabela ${table}:`, err.message);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: Check admin status function
  console.log('👑 Teste 5: Verificando função de status admin');
  try {
    const { data, error } = await supabase.rpc('check_admin_status');
    
    if (error) {
      console.log('❌ Erro na função check_admin_status:', error);
      console.log('   Código:', error.code);
      console.log('   Mensagem:', error.message);
    } else {
      console.log('✅ Função check_admin_status executada com sucesso');
      console.log('   Resultado:', data);
    }
  } catch (err) {
    console.log('💥 Exceção na função check_admin_status:', err.message);
  }

  console.log('\n🏁 Diagnóstico concluído!');
}

// Execute the diagnosis
diagnoseSupabaseErrors().catch(console.error);