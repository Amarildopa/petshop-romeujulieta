import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSimpleCheckAdmin() {
  console.log('🔧 Criando função check_admin_status simples...');
  
  try {
    // Tentar criar uma função simples que sempre retorna false para usuários não autenticados
    const { data, error } = await supabase
      .from('admin_users_pet')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Erro ao acessar admin_users_pet:', error);
      return;
    }

    console.log('✅ Tabela admin_users_pet acessível');
    
    // Como não conseguimos criar funções via RPC, vamos verificar se podemos usar as funções existentes
    console.log('🧪 Testando função get_current_admin_status...');
    const { data: adminData, error: adminError } = await supabase.rpc('get_current_admin_status');
    
    if (adminError) {
      console.log('❌ Erro na função get_current_admin_status:', adminError);
    } else {
      console.log('✅ Função get_current_admin_status funcionando!');
      console.log('📊 Resultado:', adminData);
    }

    console.log('🧪 Testando função is_user_admin...');
    const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_user_admin');
    
    if (isAdminError) {
      console.log('❌ Erro na função is_user_admin:', isAdminError);
    } else {
      console.log('✅ Função is_user_admin funcionando!');
      console.log('📊 Resultado:', isAdminData);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error);
  }
}

createSimpleCheckAdmin();