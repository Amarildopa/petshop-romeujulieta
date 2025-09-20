const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ixqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ0MDAsImV4cCI6MjA1MDU1MDQwMH0.abc123';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubscriptionsTable() {
  console.log('🔍 Verificando estrutura da tabela subscriptions_pet...');
  
  try {
    // Tentar fazer uma consulta simples para ver se a tabela existe
    const { data, error } = await supabase
      .from('subscriptions_pet')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Erro ao acessar tabela subscriptions_pet:', error.message);
      return;
    }

    console.log('✅ Tabela subscriptions_pet acessível');
    console.log('📊 Dados de exemplo (se houver):', data);

    // Verificar estrutura da tabela usando information_schema
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'subscriptions_pet')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      console.log('❌ Erro ao obter estrutura da tabela:', columnsError.message);
    } else {
      console.log('📋 Estrutura da tabela subscriptions_pet:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkSubscriptionsTable();