// Script para testar aprovação de banho com integração na jornada
// Execução: node scripts/tests/run-journey-integration-check.cjs

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (usando as credenciais já presentes nos utilitários do projeto)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

function logSection(title) {
  console.log('\n==============================');
  console.log(title);
  console.log('==============================');
}

(async () => {
  try {
    logSection('🚀 Iniciando verificação de integração Banho → Jornada');

    // 1) Obter um pet para vincular (sem filtro de ativo)
    const { data: pets, error: petError } = await supabase
      .from('pets_pet')
      .select('id, name')
      .order('created_at', { ascending: false })
      .limit(1);

    const pet = Array.isArray(pets) ? pets[0] : null;

    if (petError || !pet) {
      console.error('❌ Não foi possível obter um pet:', petError?.message || 'Nenhum pet retornado');
      process.exit(1);
    }

    console.log(`✅ Pet encontrado: ${pet.name} (${pet.id})`);

    // 2) Encontrar um banho pendente ou sem integração
    const { data: bathCandidate, error: bathError } = await supabase
      .from('weekly_baths')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (bathError || !bathCandidate) {
      console.error('❌ Não foi possível obter um banho para teste:', bathError?.message);
      process.exit(1);
    }

    console.log(`🛁 Banho selecionado: ${bathCandidate.id} | Pet: ${bathCandidate.pet_name} | Aprovado: ${bathCandidate.approved} | Evento: ${bathCandidate.journey_event_id || 'N/A'}`);

    // 3) Persistir pet_id e marcar add_to_journey = true
    const { error: updateError } = await supabase
      .from('weekly_baths')
      .update({ pet_id: pet.id, add_to_journey: true })
      .eq('id', bathCandidate.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar banho com pet_id/add_to_journey:', updateError.message);
      process.exit(1);
    }

    console.log('✅ pet_id vinculado ao banho e add_to_journey ativado');

    // 4) Aprovar com integração via RPC
    const fakeAdminId = bathCandidate.approved_by || '00000000-0000-0000-0000-000000000000';
    const { data: approvalData, error: approvalError } = await supabase
      .rpc('approve_bath_with_integration', {
        bath_id: bathCandidate.id,
        admin_id: fakeAdminId,
        should_add_to_journey: true
      });

    if (approvalError) {
      console.error('❌ Erro na aprovação com integração:', approvalError.message);
      process.exit(1);
    }

    console.log('✅ Aprovação com integração retornou:', approvalData);

    // 5) Confirmar criação do evento na jornada
    const { data: updatedBath, error: bathReloadError } = await supabase
      .from('weekly_baths')
      .select('*')
      .eq('id', bathCandidate.id)
      .single();

    if (bathReloadError) {
      console.error('❌ Erro ao recarregar banho:', bathReloadError.message);
      process.exit(1);
    }

    console.log(`🔎 Banho após aprovação: aprovado=${updatedBath.approved} | journey_event_id=${updatedBath.journey_event_id}`);

    // 6) Buscar evento criado
    let eventId = updatedBath.journey_event_id;
    if (!eventId) {
      const { data: eventFromSource, error: eventSearchError } = await supabase
        .from('pet_events_pet')
        .select('id')
        .eq('weekly_bath_source_id', bathCandidate.id)
        .limit(1)
        .single();
      if (!eventSearchError && eventFromSource) {
        eventId = eventFromSource.id;
      }
    }

    if (!eventId) {
      console.error('❌ Nenhum evento encontrado na jornada para este banho.');
      process.exit(1);
    }

    console.log(`✅ Evento de jornada confirmado: ${eventId}`);

    // 7) Validar badge na jornada (campo weekly_bath_source_id no evento)
    const { data: eventFull, error: eventError } = await supabase
      .from('pet_events_pet')
      .select('id, weekly_bath_source_id, title, description, event_date')
      .eq('id', eventId)
      .single();

    if (eventError || !eventFull) {
      console.error('❌ Erro ao buscar evento completo:', eventError?.message);
      process.exit(1);
    }

    console.log('📸 Detalhes do evento:', eventFull);
    if (eventFull.weekly_bath_source_id) {
      console.log('🏷️ Badge "🛁 Banho Semanal" deve aparecer na GrowthJourney.');
    } else {
      console.log('⚠️ Badge não deve aparecer (sem origem de banho semanal).');
    }

    logSection('🎉 Integração validada com sucesso');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro inesperado no script:', err);
    process.exit(1);
  }
})();