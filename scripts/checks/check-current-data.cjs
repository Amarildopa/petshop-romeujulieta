const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para calcular semana anterior (igual ao sistema)
function getPreviousWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day - 7;
  const previousSunday = new Date(d.setDate(diff));
  previousSunday.setHours(0, 0, 0, 0);
  return previousSunday.toISOString().split('T')[0];
}

async function checkCurrentData() {
  try {
    const hoje = new Date();
    const semanaAnterior = getPreviousWeekStart(hoje);
    
    console.log('=== VERIFICAÇÃO DOS DADOS ATUAIS ===');
    console.log('Data atual:', hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }));
    console.log('Carrossel busca week_start =', semanaAnterior);
    
    // Buscar todos os dados da tabela
    console.log('\n=== TODOS OS REGISTROS NA TABELA ===');
    const { data: allData, error: allError } = await supabase
      .from('weekly_baths')
      .select('*')
      .order('display_order');
    
    if (allError) {
      console.error('❌ Erro ao buscar todos os dados:', allError);
      return;
    }
    
    console.log('Total de registros:', allData?.length || 0);
    allData?.forEach(bath => {
      const bathDate = new Date(bath.bath_date);
      const dayName = bathDate.toLocaleDateString('pt-BR', { weekday: 'long' });
      console.log(`- ${bath.pet_name}: week_start=${bath.week_start}, bath_date=${bath.bath_date} (${dayName}), approved=${bath.approved}, display_order=${bath.display_order}`);
    });
    
    // Buscar dados que o carrossel está procurando
    console.log('\n=== DADOS QUE O CARROSSEL BUSCA ===');
    console.log('Buscando registros com week_start =', semanaAnterior, 'e approved = true');
    
    const { data: carouselData, error: carouselError } = await supabase
      .from('weekly_baths')
      .select('*')
      .eq('week_start', semanaAnterior)
      .eq('approved', true)
      .order('display_order', { ascending: true });
    
    if (carouselError) {
      console.error('❌ Erro ao buscar dados do carrossel:', carouselError);
      return;
    }
    
    console.log('Registros encontrados para o carrossel:', carouselData?.length || 0);
    if (carouselData && carouselData.length > 0) {
      carouselData.forEach(bath => {
        const bathDate = new Date(bath.bath_date);
        const dayName = bathDate.toLocaleDateString('pt-BR', { weekday: 'long' });
        console.log(`✅ ${bath.pet_name}: bath_date=${bath.bath_date} (${dayName})`);
      });
    } else {
      console.log('❌ Nenhum registro encontrado para o carrossel!');
    }
    
    // Verificar se há registros aprovados com outras week_start
    console.log('\n=== REGISTROS APROVADOS COM OUTRAS WEEK_START ===');
    const { data: otherData, error: otherError } = await supabase
      .from('weekly_baths')
      .select('*')
      .neq('week_start', semanaAnterior)
      .eq('approved', true)
      .order('week_start');
    
    if (otherError) {
      console.error('❌ Erro ao buscar outros dados:', otherError);
      return;
    }
    
    if (otherData && otherData.length > 0) {
      console.log('Registros aprovados com week_start diferente:');
      otherData.forEach(bath => {
        console.log(`- ${bath.pet_name}: week_start=${bath.week_start}, bath_date=${bath.bath_date}`);
      });
    } else {
      console.log('Nenhum registro aprovado com week_start diferente.');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar verificação
checkCurrentData();