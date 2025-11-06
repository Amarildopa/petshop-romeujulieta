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

async function createJourneyEvent() {
  console.log('📈 Criando evento na jornada...\n');
  
  try {
    const bathId = '09fd3ec0-4f62-4929-b780-2be31a158eca';
    const petId = '06aaa80e-6fed-4fdb-aa5f-0dffd8760b4d';
    
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
    console.log('📝 Criando evento na jornada...');
    const { data: journeyEvent, error: eventError } = await supabase
      .from('pet_events_pet')
      .insert([{
        pet_id: petId,
        event_type_id: eventTypeId,
        title: 'Banho - Rex',
        description: 'Banho semanal realizado',
        event_date: '2025-11-05',
        weekly_bath_source_id: bathId,
        user_id: 'fa323991-019c-4f72-b144-27304cc396ae' // Profile existente válido
      }])
      .select()
      .single();
    
    if (eventError) {
      console.log('❌ Erro ao criar evento na jornada:', eventError.message);
      return;
    }
    
    console.log(`✅ Evento criado na jornada: ${journeyEvent.id}`);
    
    // Atualizar banho com ID do evento
    console.log('🔗 Atualizando banho com referência ao evento...');
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
    console.log(`   - Banho ID: ${finalBath.id}`);
    console.log(`   - Evento Jornada: ${finalBath.journey_event_id}`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar criação
createJourneyEvent().then(() => {
  console.log('\n🎉 Evento na jornada criado com sucesso!');
}).catch((error) => {
  console.error('❌ Erro no processo:', error);
});