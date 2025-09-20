import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFrontendErrors() {
  console.log('🔍 Testando condições do frontend para reproduzir erros 406/400...');
  
  try {
    // Teste 1: Simular consulta como no petsService.getPets()
    console.log('\n📋 Teste 1: Simulando petsService.getPets()');
    const { data: pets, error: petsError } = await supabase
      .from('pets_pet')
      .select('*');

    if (petsError) {
      console.log('❌ Erro na consulta pets_pet:', petsError);
      console.log('   Código:', petsError.code);
      console.log('   Mensagem:', petsError.message);
    } else {
      console.log('✅ Consulta pets_pet bem-sucedida');
      console.log('   Registros encontrados:', pets?.length || 0);
    }

    // Teste 2: Simular consulta como no profilesService
    console.log('\n👤 Teste 2: Simulando consulta profiles_pet');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles_pet')
      .select('*');

    if (profilesError) {
      console.log('❌ Erro na consulta profiles_pet:', profilesError);
      console.log('   Código:', profilesError.code);
      console.log('   Mensagem:', profilesError.message);
    } else {
      console.log('✅ Consulta profiles_pet bem-sucedida');
      console.log('   Registros encontrados:', profiles?.length || 0);
    }

    // Teste 3: Tentar consulta com filtro (como seria com usuário autenticado)
    console.log('\n🔒 Teste 3: Simulando consulta com filtro de owner_id');
    const { data: filteredPets, error: filteredError } = await supabase
      .from('pets_pet')
      .select('*')
      .eq('owner_id', '00000000-0000-0000-0000-000000000000'); // UUID fictício

    if (filteredError) {
      console.log('❌ Erro na consulta filtrada pets_pet:', filteredError);
      console.log('   Código:', filteredError.code);
      console.log('   Mensagem:', filteredError.message);
    } else {
      console.log('✅ Consulta filtrada pets_pet bem-sucedida');
      console.log('   Registros encontrados:', filteredPets?.length || 0);
    }

    // Teste 4: Verificar se há dados de teste na tabela
    console.log('\n📊 Teste 4: Verificando dados existentes');
    
    const { count: petsCount, error: petsCountError } = await supabase
      .from('pets_pet')
      .select('*', { count: 'exact', head: true });

    if (petsCountError) {
      console.log('❌ Erro ao contar pets_pet:', petsCountError);
    } else {
      console.log('✅ Total de pets na tabela:', petsCount);
    }

    const { count: profilesCount, error: profilesCountError } = await supabase
      .from('profiles_pet')
      .select('*', { count: 'exact', head: true });

    if (profilesCountError) {
      console.log('❌ Erro ao contar profiles_pet:', profilesCountError);
    } else {
      console.log('✅ Total de profiles na tabela:', profilesCount);
    }

    // Teste 5: Verificar políticas RLS
    console.log('\n🔐 Teste 5: Verificando status de autenticação');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ Erro ao verificar usuário:', userError);
    } else {
      console.log('👤 Usuário atual:', user ? user.id : 'Não autenticado');
    }

  } catch (error) {
    console.log('❌ Erro geral no teste:', error);
  }
}

testFrontendErrors();