// Script para corrigir week_start usando lógica correta (segunda-feira)
// Semana: Segunda a Domingo
// Hoje: 15/09/2025 (Segunda) - primeiro dia da semana atual
// Semana anterior: 08/09 a 14/09 (week_start = 2025-09-08)

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função CORRETA para calcular week_start (segunda-feira)
function getCorrectWeekStart(dateString) {
  const d = new Date(dateString);
  const day = d.getDay(); // 0=domingo, 1=segunda, 2=terça...
  
  // Calcular quantos dias voltar para chegar na segunda-feira
  let daysToSubtract;
  if (day === 0) {
    // Se é domingo, voltar 6 dias para chegar na segunda anterior
    daysToSubtract = 6;
  } else {
    // Se é segunda a sábado, voltar (day - 1) dias
    daysToSubtract = day - 1;
  }
  
  const monday = new Date(d);
  monday.setDate(d.getDate() - daysToSubtract);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

async function fixWeekStartData() {
  try {
    console.log('🔍 Buscando todos os registros na tabela weekly_baths...');
    
    // Buscar todos os registros
    const { data: allRecords, error: fetchError } = await supabase
      .from('weekly_baths')
      .select('*')
      .order('bath_date', { ascending: true });
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`📊 Encontrados ${allRecords.length} registros`);
    
    if (allRecords.length === 0) {
      console.log('❌ Nenhum registro encontrado para corrigir.');
      return;
    }
    
    // Mostrar registros atuais
    console.log('\n📋 Registros atuais:');
    allRecords.forEach(record => {
      const bathDate = new Date(record.bath_date);
      const correctWeekStart = getCorrectWeekStart(record.bath_date);
      console.log(`ID: ${record.id}, Bath Date: ${record.bath_date} (${bathDate.toLocaleDateString('pt-BR', { weekday: 'long' })}), Week Start Atual: ${record.week_start}, Week Start Correto: ${correctWeekStart}`);
    });
    
    // Corrigir cada registro
    console.log('\n🔧 Corrigindo week_start para cada registro...');
    let updatedCount = 0;
    
    for (const record of allRecords) {
      const correctWeekStart = getCorrectWeekStart(record.bath_date);
      
      if (record.week_start !== correctWeekStart) {
        console.log(`📝 Atualizando registro ID ${record.id}: ${record.week_start} -> ${correctWeekStart}`);
        
        const { error: updateError } = await supabase
          .from('weekly_baths')
          .update({ week_start: correctWeekStart })
          .eq('id', record.id);
        
        if (updateError) {
          console.error(`❌ Erro ao atualizar registro ${record.id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`✅ Registro ${record.id} atualizado com sucesso`);
        }
      } else {
        console.log(`✓ Registro ID ${record.id} já está correto`);
      }
    }
    
    console.log(`\n✅ Correção concluída! ${updatedCount} registros atualizados.`);
    
    // Verificar o que o carrossel deve buscar agora
    console.log('\n🎠 Verificando dados para o carrossel...');
    const hoje = new Date('2025-09-15T12:00:00'); // Segunda-feira
    const semanaAnteriorInicio = getCorrectWeekStart(new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000));
    
    console.log(`📅 Hoje: ${hoje.toLocaleDateString('pt-BR')} (${hoje.toLocaleDateString('pt-BR', { weekday: 'long' })})`);
    console.log(`🔍 Carrossel deve buscar week_start = ${semanaAnteriorInicio}`);
    
    const { data: carouselData, error: carouselError } = await supabase
      .from('weekly_baths')
      .select('*')
      .eq('week_start', semanaAnteriorInicio)
      .eq('approved', true)
      .order('bath_date', { ascending: true });
    
    if (carouselError) {
      console.error('❌ Erro ao buscar dados do carrossel:', carouselError);
    } else {
      console.log(`🎯 Registros encontrados para o carrossel: ${carouselData.length}`);
      if (carouselData.length > 0) {
        console.log('📸 Fotos que aparecerão no carrossel:');
        carouselData.forEach(record => {
          console.log(`  - ${record.bath_date}: ${record.pet_name} (${record.photo_url})`);
        });
      } else {
        console.log('❌ Nenhuma foto encontrada para o carrossel.');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar correção
fixWeekStartData();