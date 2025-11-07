const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase com Service Role Key
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1ODA0NiwiZXhwIjoyMDcxMjM0MDQ2fQ.hmHKBn3yFcnxM_Hn79j6yLpTRW5mRCCcq2zkjnwo8LU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function testIntegration() {
  console.log('🧪 Testando integração Banhos Semanais → Jornada...\n');
  
  try {
    // Criar profile de teste
    console.log('👤 Criando profile de teste...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles_pet')
      .insert([{
        full_name: 'Admin Teste',
        email: `admin-${Date.now()}@teste.com`
      }])
      .select()
      .single();
    
    if (profileError) {
      console.log('❌ Erro ao criar profile:', profileError.message);
      return;
    }
    
    console.log(`✅ Profile criado: ${profile.id}`);
    
    // IDs dos dados criados
    const bathId = '09fd3ec0-4f62-4929-b780-2be31a158eca';
    const petId = '06aaa80e-6fed-4fdb-aa5f-0dffd8760b4d';
    const profileId = profile.id;
    
    console.log('📅 Verificando banho antes da aprovação...');
    const { data: bathBefore, error: bathBeforeError } = await supabase
      .from('weekly_baths')
      .select('*')
      .eq('id', bathId)
      .single();
    
    if (bathBeforeError) {
      console.log('❌ Erro ao buscar banho:', bathBeforeError.message);
      return;
    }
    
    console.log(`✅ Banho encontrado:`);
    console.log(`   - Pet: ${bathBefore.pet_name}`);
    console.log(`   - Data: ${bathBefore.bath_date}`);
    console.log(`   - Aprovado: ${bathBefore.approved}`);
    console.log(`   - Integração: ${bathBefore.add_to_journey}`);
    console.log(`   - Evento Jornada: ${bathBefore.journey_event_id || 'N/A'}`);
    
    // Simular aprovação com integração
    console.log('\n✅ Aprovando banho com integração...');
    const { data: updatedBath, error: updateError } = await supabase
      .from('weekly_baths')
      .update({
        approved: true,
        approved_by: profileId, // ID do profile criado
        approved_at: new Date().toISOString(),
        add_to_journey: true
      })
      .eq('id', bathId)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Erro ao aprovar banho:', updateError.message);
      return;
    }
    
    console.log(`✅ Banho aprovado com integração ativada`);
    
    // Criar evento na jornada (simulando a função do backend)
    console.log('\n📈 Criando evento na jornada...');
    
    // Buscar tipo de evento para banho
    const { data: bathEventType, error: typeError } = await supabase
      .from('event_types_pet')
      .select('id')
      .eq('name', 'Banho')
      .single();
    
    let eventTypeId;
    if (typeError || !bathEventType) {
      console.log('⚠️ Tipo de evento "Banho" não encontrado, criando...');
      const { data: newType, error: newTypeError } = await supabase
        .from('event_types_pet')
        .insert([{
          name: 'Banho',
          description: 'Registro de banho do pet',
          color: '#06B6D4',
          is_system: true
        }])
        .select()
        .single();
      
      if (newTypeError) {
        console.log('❌ Erro ao criar tipo de evento:', newTypeError.message);
        return;
      }
      
      eventTypeId = newType.id;
      console.log(`✅ Tipo de evento criado: ${eventTypeId}`);
    } else {
      eventTypeId = bathEventType.id;
      console.log(`✅ Tipo de evento encontrado: ${eventTypeId}`);
    }
    
    // Criar evento na jornada
    const { data: journeyEvent, error: eventError } = await supabase
      .from('pet_events_pet')
      .insert([{
        pet_id: petId,
        event_type_id: eventTypeId,
        title: `Banho - ${bathBefore.pet_name}`,
        description: 'Banho semanal realizado',
        event_date: bathBefore.bath_date,
        weekly_bath_source_id: bathId,
        user_id: profileId
      }])
      .select()
      .single();
    
    if (eventError) {
      console.log('❌ Erro ao criar evento na jornada:', eventError.message);
      return;
    }
    
    console.log(`✅ Evento criado na jornada: ${journeyEvent.id}`);
    
    // Atualizar banho com ID do evento
    console.log('\n🔗 Atualizando banho com referência ao evento...');
    const { data: finalBath, error: finalError } = await supabase
      .from('weekly_baths')
      .update({ journey_event_id: journeyEvent.id })
      .eq('id', bathId)
      .select()
      .single();
    
    if (finalError) {
      console.log('❌ Erro ao atualizar banho:', finalError.message);
      return;
    }
    
    console.log(`✅ Integração completa!`);
    
    // Verificar resultado final
    console.log('\n📋 Verificando resultado final:');
    console.log(`   - Banho ID: ${finalBath.id}`);
    console.log(`   - Pet: ${finalBath.pet_name}`);
    console.log(`   - Aprovado: ${finalBath.approved}`);
    console.log(`   - Integração: ${finalBath.add_to_journey}`);
    console.log(`   - Evento Jornada: ${finalBath.journey_event_id}`);
    console.log(`   - Data do Evento: ${journeyEvent.event_date}`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testIntegration().then(() => {
  console.log('\n🎉 Teste de integração concluído!');
}).catch((error) => {
  console.error('❌ Erro no teste:', error);
});