import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFix() {
  console.log('🔧 Executando correção da tabela pets_pet...');
  
  try {
    // Verificar se a coluna image_url já existe
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'pets_pet')
      .eq('column_name', 'image_url');

    if (columnsError) {
      console.log('❌ Erro ao verificar colunas:', columnsError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('✅ Coluna image_url já existe na tabela pets_pet');
      return;
    }

    // Adicionar a coluna image_url
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.pets_pet ADD COLUMN IF NOT EXISTS image_url TEXT;'
    });

    if (error) {
      console.log('❌ Erro ao adicionar coluna image_url:', error);
      return;
    }

    console.log('✅ Coluna image_url adicionada com sucesso!');
    
  } catch (error) {
    console.log('❌ Erro geral:', error);
  }
}

executeSQLFix();