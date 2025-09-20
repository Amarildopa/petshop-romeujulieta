const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRelatedTables() {
  try {
    console.log('🔍 Verificando tabelas relacionadas ao sistema de agendamento...\n');
    
    // 1. Verificar usuários (profiles_pet)
    console.log('👥 VERIFICANDO USUÁRIOS (profiles_pet):');
    const { data: users, error: usersError } = await supabase
      .from('profiles_pet')
      .select('*');
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
    } else {
      console.log(`- Total de usuários: ${users?.length || 0}`);
      if (users && users.length > 0) {
        console.log('- Último usuário:', users[users.length - 1].full_name, '(' + users[users.length - 1].email + ')');
      }
    }
    
    // 2. Verificar pets (pets_pet)
    console.log('\n🐕 VERIFICANDO PETS (pets_pet):');
    const { data: pets, error: petsError } = await supabase
      .from('pets_pet')
      .select(`
        *,
        profiles_pet!owner_id(full_name, email)
      `);
    
    if (petsError) {
      console.error('❌ Erro ao buscar pets:', petsError);
    } else {
      console.log(`- Total de pets: ${pets?.length || 0}`);
      if (pets && pets.length > 0) {
        const speciesCount = pets.reduce((acc, pet) => {
          acc[pet.species] = (acc[pet.species] || 0) + 1;
          return acc;
        }, {});
        
        console.log('- Por espécie:');
        Object.entries(speciesCount).forEach(([species, count]) => {
          console.log(`  * ${species}: ${count}`);
        });
        
        console.log('- Último pet cadastrado:', pets[pets.length - 1].name, 
                   '(' + pets[pets.length - 1].species + ')', 
                   '- Dono:', pets[pets.length - 1].profiles_pet?.full_name);
      }
    }
    
    // 3. Verificar serviços (services_pet)
    console.log('\n🛁 VERIFICANDO SERVIÇOS (services_pet):');
    const { data: services, error: servicesError } = await supabase
      .from('services_pet')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (servicesError) {
      console.error('❌ Erro ao buscar serviços:', servicesError);
    } else {
      console.log(`- Total de serviços: ${services?.length || 0}`);
      if (services && services.length > 0) {
        const activeServices = services.filter(s => s.is_active);
        console.log(`- Serviços ativos: ${activeServices.length}`);
        
        const categoryCount = services.reduce((acc, service) => {
          acc[service.category] = (acc[service.category] || 0) + 1;
          return acc;
        }, {});
        
        console.log('- Por categoria:');
        Object.entries(categoryCount).forEach(([category, count]) => {
          console.log(`  * ${category}: ${count}`);
        });
        
        console.log('- Serviços disponíveis:');
        activeServices.slice(0, 5).forEach(service => {
          console.log(`  * ${service.name} - R$ ${service.price} (${service.duration})`);
        });
      }
    }
    
    // 4. Verificar horários disponíveis (available_slots_pet)
    console.log('\n⏰ VERIFICANDO HORÁRIOS DISPONÍVEIS (available_slots_pet):');
    const { data: slots, error: slotsError } = await supabase
      .from('available_slots_pet')
      .select('*')
      .order('date', { ascending: true });
    
    if (slotsError) {
      console.error('❌ Erro ao buscar horários:', slotsError);
    } else {
      console.log(`- Total de slots: ${slots?.length || 0}`);
      if (slots && slots.length > 0) {
        const availableSlots = slots.filter(s => s.is_available);
        console.log(`- Slots disponíveis: ${availableSlots.length}`);
        
        const today = new Date().toISOString().split('T')[0];
        const futureSlots = slots.filter(s => s.date >= today && s.is_available);
        console.log(`- Slots futuros disponíveis: ${futureSlots.length}`);
      }
    }
    
    // 5. Verificar extras de cuidado (care_extras_pet)
    console.log('\n✨ VERIFICANDO EXTRAS DE CUIDADO (care_extras_pet):');
    const { data: extras, error: extrasError } = await supabase
      .from('care_extras_pet')
      .select('*')
      .eq('is_active', true);
    
    if (extrasError) {
      console.error('❌ Erro ao buscar extras:', extrasError);
    } else {
      console.log(`- Total de extras ativos: ${extras?.length || 0}`);
      if (extras && extras.length > 0) {
        const categoryCount = extras.reduce((acc, extra) => {
          acc[extra.category] = (acc[extra.category] || 0) + 1;
          return acc;
        }, {});
        
        console.log('- Por categoria:');
        Object.entries(categoryCount).forEach(([category, count]) => {
          console.log(`  * ${category}: ${count}`);
        });
      }
    }
    
    // 6. Resumo geral
    console.log('\n📋 RESUMO GERAL:');
    console.log('================');
    console.log(`👥 Usuários cadastrados: ${users?.length || 0}`);
    console.log(`🐕 Pets cadastrados: ${pets?.length || 0}`);
    console.log(`🛁 Serviços disponíveis: ${services?.filter(s => s.is_active).length || 0}`);
    console.log(`⏰ Horários disponíveis: ${slots?.filter(s => s.is_available).length || 0}`);
    console.log(`✨ Extras disponíveis: ${extras?.length || 0}`);
    console.log(`📅 Agendamentos realizados: 0 (conforme verificação anterior)`);
    
    console.log('\n✅ Verificação das tabelas relacionadas concluída!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

checkRelatedTables();