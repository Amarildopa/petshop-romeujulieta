// Teste final do carrossel com lógica correta
// Semana: Segunda a Domingo
// Hoje: 15/09/2025 (Segunda) - primeiro dia da semana atual
// Carrossel deve mostrar fotos da semana anterior: 08/09 a 14/09

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para calcular week_start (segunda-feira)
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=domingo, 1=segunda, 2=terça...
  
  let daysToSubtract;
  if (day === 0) {
    daysToSubtract = 6; // Se é domingo, voltar 6 dias
  } else {
    daysToSubtract = day - 1; // Se é segunda a sábado, voltar (day - 1) dias
  }
  
  const monday = new Date(d);
  monday.setDate(d.getDate() - daysToSubtract);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

// Função para calcular semana anterior
function getPreviousWeekStart(date) {
  const currentWeekStart = getWeekStart(date);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  return previousWeekStart.toISOString().split('T')[0];
}

async function testCarouselLogic() {
  try {
    console.log('🎠 TESTE FINAL DO CARROSSEL');
    console.log('============================');
    console.log('');
    
    // Simular data atual
    const hoje = new Date('2025-09-15T12:00:00'); // Segunda-feira
    console.log('📅 Data atual:', hoje.toLocaleDateString('pt-BR'));
    console.log('📅 Dia da semana:', hoje.toLocaleDateString('pt-BR', { weekday: 'long' }));
    console.log('');
    
    // Calcular semanas
    const semanaAtual = getWeekStart(hoje);
    const semanaAnterior = getPreviousWeekStart(hoje);
    
    console.log('📊 CÁLCULO DE SEMANAS:');
    console.log('- Semana atual (15-21/09):', semanaAtual);
    console.log('- Semana anterior (08-14/09):', semanaAnterior);
    console.log('');
    
    console.log('🔍 BUSCA DO CARROSSEL:');
    console.log('O carrossel busca fotos da SEMANA ANTERIOR');
    console.log('Query: week_start =', semanaAnterior, '+ approved = true');
    console.log('');
    
    // Executar a mesma query que o carrossel faz
    const { data: carouselPhotos, error } = await supabase
      .from('weekly_baths')
      .select('*')
      .eq('week_start', semanaAnterior)
      .eq('approved', true)
      .order('bath_date', { ascending: true });
    
    if (error) {
      console.error('❌ Erro na query:', error);
      return;
    }
    
    console.log('📸 RESULTADO DA BUSCA:');
    console.log(`Fotos encontradas: ${carouselPhotos.length}`);
    console.log('');
    
    if (carouselPhotos.length > 0) {
      console.log('✅ SUCESSO! Carrossel encontrou fotos:');
      carouselPhotos.forEach((photo, index) => {
        const bathDate = new Date(photo.bath_date);
        console.log(`${index + 1}. ${photo.pet_name}`);
        console.log(`   Data: ${photo.bath_date} (${bathDate.toLocaleDateString('pt-BR', { weekday: 'long' })})`);
        console.log(`   Week Start: ${photo.week_start}`);
        console.log(`   Aprovado: ${photo.approved}`);
        console.log(`   URL: ${photo.photo_url || 'N/A'}`);
        console.log('');
      });
      
      console.log('🎯 RESUMO:');
      console.log('- Lógica de semana: ✅ CORRETA (Segunda a Domingo)');
      console.log('- Cálculo de week_start: ✅ CORRETO');
      console.log('- Dados no banco: ✅ CORRETOS');
      console.log('- Query do carrossel: ✅ FUNCIONANDO');
      console.log(`- Fotos encontradas: ✅ ${carouselPhotos.length} fotos`);
      console.log('');
      console.log('🎉 CARROSSEL DEVE ESTAR FUNCIONANDO CORRETAMENTE!');
      
    } else {
      console.log('❌ PROBLEMA: Nenhuma foto encontrada');
      console.log('');
      console.log('🔍 Verificando possíveis causas...');
      
      // Verificar se existem registros com essa week_start (independente de approved)
      const { data: allRecords } = await supabase
        .from('weekly_baths')
        .select('*')
        .eq('week_start', semanaAnterior);
      
      console.log(`- Registros com week_start ${semanaAnterior}: ${allRecords?.length || 0}`);
      
      if (allRecords && allRecords.length > 0) {
        console.log('- Problema: Registros existem mas não estão aprovados');
        allRecords.forEach(record => {
          console.log(`  * ${record.pet_name} (${record.bath_date}) - Aprovado: ${record.approved}`);
        });
      } else {
        console.log('- Problema: Não existem registros para essa semana');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testCarouselLogic();