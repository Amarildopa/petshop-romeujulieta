import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1ODA0NiwiZXhwIjoyMDcxMjM0MDQ2fQ.hmHKBn3yFcnxM_Hn79j6yLpTRW5mRCCcq2zkjnwo8LU';

const supabase = createClient(supabaseUrl, supabaseKey);

const themeData = [
  // Header section colors
  { section: 'Header', component: 'header_background', color_value: '#1F2937', description: 'Cor de fundo do cabeçalho principal', visual_example: 'Fundo da barra superior do site', display_order: 1 },
  { section: 'Header', component: 'header_text', color_value: '#FFFFFF', description: 'Cor do texto no cabeçalho', visual_example: 'Texto do logo e menu de navegação', display_order: 2 },
  { section: 'Header', component: 'header_border', color_value: '#374151', description: 'Cor da borda inferior do cabeçalho', visual_example: 'Linha que separa o cabeçalho do conteúdo', display_order: 3 },
  { section: 'Header', component: 'navigation_hover', color_value: '#4B5563', description: 'Cor de hover dos itens de navegação', visual_example: 'Cor quando passa o mouse sobre os links do menu', display_order: 4 },

  // Hero Section colors
  { section: 'Hero', component: 'hero_background', color_value: '#F3F4F6', description: 'Cor de fundo da seção principal', visual_example: 'Fundo da área de destaque da página inicial', display_order: 10 },
  { section: 'Hero', component: 'hero_title', color_value: '#1F2937', description: 'Cor do título principal', visual_example: 'Texto do título de boas-vindas', display_order: 11 },
  { section: 'Hero', component: 'hero_subtitle', color_value: '#6B7280', description: 'Cor do subtítulo', visual_example: 'Texto descritivo abaixo do título principal', display_order: 12 },
  { section: 'Hero', component: 'hero_accent', color_value: '#3B82F6', description: 'Cor de destaque na seção hero', visual_example: 'Elementos decorativos e ícones de destaque', display_order: 13 },

  // Dashboard section colors
  { section: 'Dashboard', component: 'card_background', color_value: '#FFFFFF', description: 'Cor de fundo dos cartões', visual_example: 'Fundo dos cards de informações e estatísticas', display_order: 20 },
  { section: 'Dashboard', component: 'card_border', color_value: '#E5E7EB', description: 'Cor da borda dos cartões', visual_example: 'Bordas dos cards e divisores', display_order: 21 },
  { section: 'Dashboard', component: 'card_title', color_value: '#1F2937', description: 'Cor dos títulos dos cartões', visual_example: 'Títulos dos cards e seções do dashboard', display_order: 22 },
  { section: 'Dashboard', component: 'card_text', color_value: '#6B7280', description: 'Cor do texto dos cartões', visual_example: 'Texto descritivo e dados nos cards', display_order: 23 },
  { section: 'Dashboard', component: 'sidebar_background', color_value: '#F9FAFB', description: 'Cor de fundo da barra lateral', visual_example: 'Fundo do menu lateral do dashboard', display_order: 24 },

  // Buttons section colors
  { section: 'Botões', component: 'button_primary', color_value: '#3B82F6', description: 'Cor do botão principal', visual_example: 'Botões de ação primária (Salvar, Confirmar)', display_order: 30 },
  { section: 'Botões', component: 'button_primary_hover', color_value: '#2563EB', description: 'Cor do botão principal ao passar o mouse', visual_example: 'Estado hover do botão principal', display_order: 31 },
  { section: 'Botões', component: 'button_secondary', color_value: '#6B7280', description: 'Cor do botão secundário', visual_example: 'Botões de ação secundária (Cancelar, Voltar)', display_order: 32 },
  { section: 'Botões', component: 'button_secondary_hover', color_value: '#4B5563', description: 'Cor do botão secundário ao passar o mouse', visual_example: 'Estado hover do botão secundário', display_order: 33 },
  { section: 'Botões', component: 'button_success', color_value: '#10B981', description: 'Cor do botão de sucesso', visual_example: 'Botões de confirmação e sucesso', display_order: 34 },
  { section: 'Botões', component: 'button_danger', color_value: '#EF4444', description: 'Cor do botão de perigo', visual_example: 'Botões de exclusão e ações perigosas', display_order: 35 },

  // General section colors
  { section: 'Geral', component: 'text_primary', color_value: '#1F2937', description: 'Cor do texto principal', visual_example: 'Texto principal em todo o site', display_order: 40 },
  { section: 'Geral', component: 'text_secondary', color_value: '#6B7280', description: 'Cor do texto secundário', visual_example: 'Texto descritivo e legendas', display_order: 41 },
  { section: 'Geral', component: 'background_primary', color_value: '#FFFFFF', description: 'Cor de fundo principal', visual_example: 'Fundo principal das páginas', display_order: 42 },
  { section: 'Geral', component: 'background_secondary', color_value: '#F9FAFB', description: 'Cor de fundo secundário', visual_example: 'Fundo de seções alternadas', display_order: 43 },
  { section: 'Geral', component: 'border_primary', color_value: '#E5E7EB', description: 'Cor da borda principal', visual_example: 'Bordas de formulários e divisores', display_order: 44 },
  { section: 'Geral', component: 'accent_color', color_value: '#F59E0B', description: 'Cor de destaque', visual_example: 'Elementos de destaque e notificações', display_order: 45 }
];

async function populateThemeData() {
  try {
    console.log('🎨 Populando dados de tema...');
    
    // Primeiro, limpar dados existentes
    const { error: deleteError } = await supabase
      .from('theme_colors_pet')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.error('❌ Erro ao limpar dados existentes:', deleteError);
    } else {
      console.log('🧹 Dados existentes limpos');
    }
    
    // Inserir novos dados
    const { data, error } = await supabase
      .from('theme_colors_pet')
      .insert(themeData)
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir dados:', error);
      return;
    }
    
    console.log(`✅ ${data.length} registros inseridos com sucesso!`);
    
    // Verificar dados inseridos
    const { count, error: countError } = await supabase
      .from('theme_colors_pet')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao verificar dados:', countError);
    } else {
      console.log(`📊 Total de registros na tabela: ${count}`);
    }
    
    // Mostrar seções criadas
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('theme_colors_pet')
      .select('section')
      .eq('is_active', true);
    
    if (sectionsError) {
      console.error('❌ Erro ao buscar seções:', sectionsError);
    } else {
      const sections = [...new Set(sectionsData.map(item => item.section))];
      console.log('🎨 Seções criadas:', sections);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

populateThemeData();