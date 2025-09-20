const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixWeeklyBathsData() {
  try {
    console.log('🔄 Iniciando correção dos dados de weekly_baths...');
    
    // Primeiro, vamos verificar os dados atuais
    console.log('\n📊 Verificando dados atuais:');
    const { data: currentData, error: currentError } = await supabase
      .from('weekly_baths')
      .select('*')
      .eq('approved', true)
      .order('display_order');
    
    if (currentError) {
      console.error('❌ Erro ao buscar dados atuais:', currentError);
      return;
    }
    
    console.log('Dados atuais encontrados:', currentData?.length || 0, 'registros');
    currentData?.forEach(bath => {
      console.log(`- ${bath.pet_name}: week_start=${bath.week_start}, bath_date=${bath.bath_date}, display_order=${bath.display_order}`);
    });
    
    // Agora vamos atualizar os dados
    console.log('\n🔧 Atualizando dados para a semana anterior...');
    
    // Definir as atualizações para cada pet baseado no display_order
    const updates = [
      { display_order: 1, pet_name: 'Luna', bath_date: '2025-09-09' },     // Segunda-feira
      { display_order: 2, pet_name: 'Max', bath_date: '2025-09-10' },      // Terça-feira
      { display_order: 3, pet_name: 'Bella', bath_date: '2025-09-11' },    // Quarta-feira
      { display_order: 4, pet_name: 'Charlie', bath_date: '2025-09-12' },  // Quinta-feira
      { display_order: 5, pet_name: 'Milo', bath_date: '2025-09-13' },     // Sexta-feira
    ];
    
    // Atualizar week_start para todos os registros aprovados
    const { error: weekStartError } = await supabase
      .from('weekly_baths')
      .update({ 
        week_start: '2025-09-08',  // Domingo da semana anterior
        updated_at: new Date().toISOString()
      })
      .eq('approved', true);
    
    if (weekStartError) {
      console.error('❌ Erro ao atualizar week_start:', weekStartError);
      return;
    }
    
    console.log('✅ week_start atualizado para 2025-09-08 (domingo)');
    
    // Atualizar bath_date para cada pet individualmente
    for (const update of updates) {
      const { error: bathDateError } = await supabase
        .from('weekly_baths')
        .update({ 
          bath_date: update.bath_date,
          updated_at: new Date().toISOString()
        })
        .eq('display_order', update.display_order)
        .eq('approved', true);
      
      if (bathDateError) {
        console.error(`❌ Erro ao atualizar ${update.pet_name}:`, bathDateError);
      } else {
        console.log(`✅ ${update.pet_name} (display_order ${update.display_order}): bath_date = ${update.bath_date}`);
      }
    }
    
    // Verificar os dados após a atualização
    console.log('\n📊 Verificando dados após atualização:');
    const { data: updatedData, error: updatedError } = await supabase
      .from('weekly_baths')
      .select('*')
      .eq('approved', true)
      .order('display_order');
    
    if (updatedError) {
      console.error('❌ Erro ao buscar dados atualizados:', updatedError);
      return;
    }
    
    console.log('Dados atualizados:', updatedData?.length || 0, 'registros');
    updatedData?.forEach(bath => {
      const bathDate = new Date(bath.bath_date);
      const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const dayName = dayNames[bathDate.getDay()];
      console.log(`- ${bath.pet_name}: week_start=${bath.week_start}, bath_date=${bath.bath_date} (${dayName}), display_order=${bath.display_order}`);
    });
    
    console.log('\n🎉 Correção dos dados concluída com sucesso!');
    console.log('\n📝 Resumo da nova lógica:');
    console.log('- week_start = 2025-09-08 (domingo da semana anterior)');
    console.log('- bath_date de 09 a 13 de setembro (segunda a sexta da semana anterior)');
    console.log('- Carrossel agora mostra fotos da semana que passou');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar a correção
fixWeeklyBathsData();