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

async function fixCorrectWeekStart() {
  try {
    const hoje = new Date();
    const weekStartCorreto = getPreviousWeekStart(hoje);
    
    console.log('🔧 CORREÇÃO DO WEEK_START');
    console.log('Data atual:', hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }));
    console.log('Week_start que o carrossel busca:', weekStartCorreto);
    
    // Atualizar todos os registros aprovados para o week_start correto
    console.log('\n🔄 Atualizando week_start de 2025-09-08 para', weekStartCorreto);
    
    const { data, error } = await supabase
      .from('weekly_baths')
      .update({ 
        week_start: weekStartCorreto,
        updated_at: new Date().toISOString()
      })
      .eq('approved', true)
      .select();
    
    if (error) {
      console.error('❌ Erro ao atualizar week_start:', error);
      return;
    }
    
    console.log('✅ Week_start atualizado com sucesso!');
    console.log('Registros atualizados:', data?.length || 0);
    
    // Verificar se o carrossel agora encontra os dados
    console.log('\n🔍 Verificando se o carrossel agora encontra os dados...');
    
    const { data: carouselData, error: carouselError } = await supabase
      .from('weekly_baths')
      .select('*')
      .eq('week_start', weekStartCorreto)
      .eq('approved', true)
      .order('display_order', { ascending: true });
    
    if (carouselError) {
      console.error('❌ Erro ao verificar dados do carrossel:', carouselError);
      return;
    }
    
    console.log('✅ Registros encontrados para o carrossel:', carouselData?.length || 0);
    if (carouselData && carouselData.length > 0) {
      carouselData.forEach(bath => {
        const bathDate = new Date(bath.bath_date);
        const dayName = bathDate.toLocaleDateString('pt-BR', { weekday: 'long' });
        console.log(`  - ${bath.pet_name}: bath_date=${bath.bath_date} (${dayName})`);
      });
      console.log('\n🎉 SUCESSO! O carrossel agora deve exibir as fotos!');
    } else {
      console.log('❌ Ainda não há registros para o carrossel.');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar correção
fixCorrectWeekStart();