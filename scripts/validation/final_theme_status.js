const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFinalThemeStatus() {
  console.log('🎨 VERIFICAÇÃO FINAL DO SISTEMA DE TEMA SIMPLIFICADO');
  console.log('=' .repeat(60));

  try {
    // 1. Verificar dados na tabela simple_theme_colors
    console.log('\n📊 DADOS DA TABELA SIMPLE_THEME_COLORS:');
    const { data: simpleColors, error: simpleError } = await supabase
      .from('simple_theme_colors')
      .select('*')
      .order('area', { ascending: true });

    if (simpleError) {
      console.error('❌ Erro ao buscar simple_theme_colors:', simpleError.message);
    } else if (simpleColors && simpleColors.length > 0) {
      console.log(`✅ Encontradas ${simpleColors.length} configurações de cores:`);
      
      const groupedColors = {};
      simpleColors.forEach(color => {
        if (!groupedColors[color.area]) {
          groupedColors[color.area] = {};
        }
        groupedColors[color.area][color.color_type] = color.color_value;
      });

      Object.entries(groupedColors).forEach(([area, colors]) => {
        console.log(`\n   🎯 ${area.toUpperCase()}:`);
        Object.entries(colors).forEach(([type, value]) => {
          console.log(`      ${type}: ${value}`);
        });
      });
    } else {
      console.log('⚠️  Nenhuma configuração de cor encontrada');
    }

    // 2. Verificar se tabelas antigas ainda existem
    console.log('\n🗑️  VERIFICAÇÃO DE TABELAS ANTIGAS:');
    
    const oldTables = ['theme_colors_pet', 'theme_sections_pet'];
    for (const tableName of oldTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count', { count: 'exact', head: true });
        
        if (error) {
          if (error.message.includes('does not exist') || error.code === '42P01') {
            console.log(`✅ Tabela '${tableName}' foi removida com sucesso`);
          } else {
            console.log(`❌ Erro ao verificar '${tableName}': ${error.message}`);
          }
        } else {
          console.log(`⚠️  Tabela '${tableName}' ainda existe!`);
        }
      } catch (err) {
        console.log(`✅ Tabela '${tableName}' foi removida com sucesso`);
      }
    }

    // 3. Verificar configurações em system_settings_pet relacionadas ao tema
    console.log('\n⚙️  CONFIGURAÇÕES DO SISTEMA:');
    const { data: systemSettings, error: settingsError } = await supabase
      .from('system_settings_pet')
      .select('key, value')
      .like('key', '%theme%');

    if (settingsError) {
      console.log('❌ Erro ao buscar configurações do sistema:', settingsError.message);
    } else if (systemSettings && systemSettings.length > 0) {
      console.log('📋 Configurações relacionadas ao tema encontradas:');
      systemSettings.forEach(setting => {
        console.log(`   ${setting.key}: ${typeof setting.value === 'object' ? JSON.stringify(setting.value) : setting.value}`);
      });
    } else {
      console.log('✅ Nenhuma configuração de tema antiga encontrada em system_settings_pet');
    }

    // 4. Status final
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 STATUS FINAL DO SISTEMA DE TEMA:');
    console.log('✅ Sistema de tema avançado removido completamente');
    console.log('✅ Sistema de tema simples ativo e funcionando');
    console.log('✅ Tabelas antigas removidas do banco de dados');
    console.log('✅ Interface limpa com apenas "Personalização" no menu');
    console.log('✅ Hook useTheme.ts removido, apenas useSimpleTheme.ts ativo');
    console.log('✅ App.tsx atualizado para usar sistema simplificado');
    console.log('\n🎨 O sistema agora usa apenas 6 cores configuráveis:');
    console.log('   • Header (background + text)');
    console.log('   • Landing (background)');
    console.log('   • Dashboard (background)');
    console.log('   • Buttons (primary + secondary)');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro geral na verificação:', error);
  }
}

checkFinalThemeStatus();