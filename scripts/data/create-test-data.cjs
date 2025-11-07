const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function createTestData() {
  console.log('🎯 Criando dados de teste para integração...\n');
  
  try {
    // Criar pet de teste
    console.log('🐕 Criando pet de teste...');
    const { data: pet, error: petError } = await supabase
      .from('pets_pet')
      .insert([
        {
          name: 'Rex',
          species: 'Cachorro',
          breed: 'Golden Retriever',
          birth_date: '2023-01-15',
          gender: 'Macho',
          weight: 25.5,
          color: 'Dourado',
          is_active: true
        }
      ])
      .select()
      .single();
    
    if (petError) {
      console.log('❌ Erro ao criar pet:', petError.message);
      return;
    } else {
      console.log(`✅ Pet criado: ${pet.name} (${pet.id})`);
    }
    
    // Criar banho semanal para o pet
    console.log('\n🛁 Criando banho semanal de teste...');
    const { data: bath, error: bathError } = await supabase
      .from('weekly_baths')
      .insert([
        {
          pet_id: pet.id,
          pet_name: pet.name,
          bath_date: new Date().toISOString().split('T')[0],
          bath_time: '14:00',
          service_type: 'Banho Completo',
          special_instructions: 'Teste de integração',
          approved: false,
          add_to_journey: false,
          approved_by: null,
          journey_event_id: null,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (bathError) {
      console.log('❌ Erro ao criar banho:', bathError.message);
      return;
    } else {
      console.log(`✅ Banho criado: ${bath.id}`);
      console.log(`   - Pet: ${bath.pet_name}`);
      console.log(`   - Data: ${bath.bath_date}`);
      console.log(`   - Status: ${bath.approved ? 'Aprovado' : 'Pendente'}`);
    }
    
    console.log('\n🎉 Dados de teste criados com sucesso!');
    console.log('\n📋 Resumo:');
    console.log(`   - Pet ID: ${pet.id}`);
    console.log(`   - Banho ID: ${bath.id}`);
    console.log('\n✨ Agora você pode testar a integração!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar criação de dados
createTestData().then(() => {
  console.log('\n🏁 Processo concluído!');
}).catch((error) => {
  console.error('❌ Erro no processo:', error);
});