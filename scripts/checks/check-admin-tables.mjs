import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hudiuukaoxxzxdcydgky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'
);

async function checkAdminTables() {
  console.log('🔍 Verificando tabelas de administrador...\n');
  
  try {
    // 1. Verificar estrutura e dados da admin_users_pet
    console.log('📋 Tabela: admin_users_pet');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users_pet')
      .select('*');
    
    if (adminError) {
      console.log('❌ Erro ao consultar admin_users_pet:', adminError.message);
    } else {
      console.log('✅ Total de registros:', adminUsers.length);
      if (adminUsers.length > 0) {
        console.log('📄 Registros encontrados:');
        adminUsers.forEach((user, index) => {
          console.log(`  ${index + 1}. ID: ${user.id}, Email: ${user.email}, Admin: ${user.is_admin}`);
        });
      } else {
        console.log('⚠️  Nenhum registro encontrado na tabela admin_users_pet');
      }
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Verificar estrutura e dados da admin_notifications_pet
    console.log('📋 Tabela: admin_notifications_pet');
    const { data: notifications, error: notifError } = await supabase
      .from('admin_notifications_pet')
      .select('*');
    
    if (notifError) {
      console.log('❌ Erro ao consultar admin_notifications_pet:', notifError.message);
    } else {
      console.log('✅ Total de registros:', notifications.length);
      if (notifications.length > 0) {
        console.log('📄 Registros encontrados:');
        notifications.forEach((notif, index) => {
          console.log(`  ${index + 1}. ID: ${notif.id}, Admin ID: ${notif.admin_id}, Tipo: ${notif.type}`);
        });
      } else {
        console.log('⚠️  Nenhum registro encontrado na tabela admin_notifications_pet');
      }
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Verificar se existe algum registro com email amarildo (em qualquer tabela)
    console.log('🔍 Procurando registros com "amarildo" no email...');
    
    // Verificar na tabela profiles_pet
    const { data: profilesAmarillo, error: profilesError } = await supabase
      .from('profiles_pet')
      .select('*')
      .ilike('email', '%amarildo%');
      
    if (!profilesError && profilesAmarillo.length > 0) {
      console.log('📋 Encontrado na profiles_pet:', profilesAmarillo.length, 'registros');
      profilesAmarillo.forEach(profile => {
        console.log(`  - ID: ${profile.id}, Email: ${profile.email}`);
      });
    }
    
    // Verificar na tabela admin_users_pet
    const { data: adminAmarillo, error: adminAmarildoError } = await supabase
      .from('admin_users_pet')
      .select('*')
      .ilike('email', '%amarildo%');
      
    if (!adminAmarildoError && adminAmarillo.length > 0) {
      console.log('📋 Encontrado na admin_users_pet:', adminAmarillo.length, 'registros');
      adminAmarillo.forEach(admin => {
        console.log(`  - ID: ${admin.id}, Email: ${admin.email}`);
      });
    } else {
      console.log('✅ Nenhum registro com "amarildo" encontrado nas tabelas de admin');
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkAdminTables();