const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIntegrationData() {
  console.log('🔍 Verificando dados de integração...\n');
  
  try {
    // Verificar banhos
    console.log('📅 Verificando banhos semanais...');
    const { data: baths, error: bathError } = await supabase
      .from('weekly_baths')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (bathError) {
      console.log('❌ Erro ao buscar banhos:', bathError.message);
    } else {
      console.log(`✅ Encontrados ${baths?.length || 0} banhos`);
      if (baths && baths.length > 0) {
        console.log('📋 Exemplo de banho:');
        console.log(`   - ID: ${baths[0].id}`);
        console.log(`   - Pet: ${baths[0].pet_name}`);
        console.log(`   - Data: ${baths[0].bath_date}`);
        console.log(`   - Aprovado: ${baths[0].approved}`);
        console.log(`   - Integração: ${baths[0].add_to_journey}`);
        console.log(`   - Evento Jornada: ${baths[0].journey_event_id || 'N/A'}`);
      }
    }
    
    console.log('\n🐕 Verificando pets...');
    const { data: pets, error: petError } = await supabase
      .from('pets_pet')
      .select('*')
      .limit(5);
    
    if (petError) {
      console.log('❌ Erro ao buscar pets:', petError.message);
    } else {
      console.log(`✅ Encontrados ${pets?.length || 0} pets`);
      if (pets && pets.length > 0) {
        console.log('📋 Exemplo de pet:');
        console.log(`   - ID: ${pets[0].id}`);
        console.log(`   - Nome: ${pets[0].name}`);
        console.log(`   - Raça: ${pets[0].breed}`);
      }
    }
    
    console.log('\n📈 Verificando eventos da jornada...');
    const { data: events, error: eventError } = await supabase
      .from('pet_events_pet')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (eventError) {
      console.log('❌ Erro ao buscar eventos:', eventError.message);
    } else {
      console.log(`✅ Encontrados ${events?.length || 0} eventos`);
      if (events && events.length > 0) {
        console.log('📋 Exemplo de evento:');
        console.log(`   - ID: ${events[0].id}`);
        console.log(`   - Título: ${events[0].title}`);
        console.log(`   - Data: ${events[0].event_date}`);
        console.log(`   - Pet ID: ${events[0].pet_id}`);
        console.log(`   - Origem Banho: ${events[0].weekly_bath_source_id || 'N/A'}`);
      }
    }
    
    console.log('\n🔧 Verificando tipos de eventos...');
    const { data: eventTypes, error: eventTypeError } = await supabase
      .from('event_types_pet')
      .select('*')
      .limit(5);
    
    if (eventTypeError) {
      console.log('❌ Erro ao buscar tipos de eventos:', eventTypeError.message);
    } else {
      console.log(`✅ Encontrados ${eventTypes?.length || 0} tipos de eventos`);
      if (eventTypes && eventTypes.length > 0) {
        console.log('📋 Exemplo de tipo de evento:');
        console.log(`   - ID: ${eventTypes[0].id}`);
        console.log(`   - Nome: ${eventTypes[0].name}`);
        console.log(`   - Categoria: ${eventTypes[0].category}`);
      }
    }
    
    console.log('\n✨ Verificando funções de integração...');
    const { data: functions, error: funcError } = await supabase
      .rpc('get_pets_for_selection');
    
    if (funcError) {
      console.log('❌ Erro ao testar função get_pets_for_selection:', funcError.message);
    } else {
      console.log(`✅ Função get_pets_for_selection funcionando (${functions?.length || 0} pets)`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar verificação
checkIntegrationData().then(() => {
  console.log('\n🎉 Verificação concluída!');
}).catch(error => {
  console.error('❌ Erro na verificação:', error);
});