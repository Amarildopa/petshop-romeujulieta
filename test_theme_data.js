import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkThemeData() {
  try {
    console.log('🔍 Verificando dados da tabela theme_colors_pet...');
    
    // Contar total de registros
    const { count: totalCount, error: countError } = await supabase
      .from('theme_colors_pet')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar registros:', countError);
      return;
    }
    
    console.log(`📊 Total de registros: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('⚠️ Tabela está vazia! Precisa executar a migration.');
      return;
    }
    
    // Buscar alguns registros de exemplo
    const { data: sampleData, error: sampleError } = await supabase
      .from('theme_colors_pet')
      .select('section, component, color_value, is_active')
      .eq('is_active', true)
      .limit(5);
    
    if (sampleError) {
      console.error('❌ Erro ao buscar dados de exemplo:', sampleError);
      return;
    }
    
    console.log('📋 Dados de exemplo:');
    console.table(sampleData);
    
    // Verificar seções
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('theme_colors_pet')
      .select('section')
      .eq('is_active', true);
    
    if (sectionsError) {
      console.error('❌ Erro ao buscar seções:', sectionsError);
      return;
    }
    
    const sections = [...new Set(sectionsData.map(item => item.section))];
    console.log('🎨 Seções disponíveis:', sections);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkThemeData();