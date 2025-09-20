import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hudiuukaoxxzxdcydgky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'
);

async function checkExistingUsers() {
  console.log('🔍 Verificando usuários existentes...\n');
  
  try {
    // Verificar usuários na tabela profiles_pet
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles_pet')
      .select('id, email, full_name')
      .limit(10);
    
    if (profilesError) {
      console.log('❌ Erro ao buscar perfis:', profilesError.message);
    } else {
      console.log(`✅ Encontrados ${profiles.length} usuários:`);
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.email} - ${profile.full_name}`);
      });
    }
    
    // Verificar se existe algum admin
    const { data: admins, error: adminError } = await supabase
      .from('admin_users_pet')
      .select('*')
      .limit(5);
    
    if (adminError) {
      console.log('❌ Erro ao buscar admins:', adminError.message);
    } else {
      console.log(`\n📋 Administradores: ${admins.length} registros`);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkExistingUsers();