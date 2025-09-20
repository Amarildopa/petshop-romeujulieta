import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hudiuukaoxxzxdcydgky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'
);

async function createAdminUser() {
  console.log('🔧 Criando usuário administrador...\n');
  
  try {
    // Primeiro, vamos inserir um perfil básico usando SQL direto
    const profileSql = `
      INSERT INTO profiles_pet (id, email, full_name, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        'admin@petshop.com',
        'Administrador do Sistema',
        NOW(),
        NOW()
      )
      RETURNING id, email, full_name;
    `;
    
    const { data: profileData, error: profileError } = await supabase.rpc('exec_sql', {
      sql: profileSql
    });
    
    if (profileError) {
      console.log('❌ Erro ao criar perfil:', profileError.message);
      
      // Tentar método alternativo - inserção direta
      console.log('🔄 Tentando método alternativo...');
      
      const { data: profile, error: insertError } = await supabase
        .from('profiles_pet')
        .insert({
          email: 'admin@petshop.com',
          full_name: 'Administrador do Sistema'
        })
        .select()
        .single();
      
      if (insertError) {
        console.log('❌ Erro na inserção alternativa:', insertError.message);
        return;
      }
      
      console.log('✅ Perfil criado (método alternativo):', profile);
      
      // Criar registro de admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users_pet')
        .insert({
          user_id: profile.id,
          role: 'super_admin',
          permissions: ['all'],
          is_active: true
        })
        .select()
        .single();
      
      if (adminError) {
        console.log('❌ Erro ao criar admin:', adminError.message);
      } else {
        console.log('✅ Admin criado:', adminData);
        
        // Criar notificação de boas-vindas
        const { data: notification, error: notifError } = await supabase
          .from('admin_notifications_pet')
          .insert({
            admin_id: adminData.id,
            title: 'Bem-vindo ao Sistema',
            message: 'Conta de administrador criada com sucesso!',
            type: 'info',
            is_read: false
          })
          .select()
          .single();
        
        if (notifError) {
          console.log('⚠️ Erro ao criar notificação:', notifError.message);
        } else {
          console.log('✅ Notificação criada:', notification);
        }
      }
      
    } else {
      console.log('✅ Perfil criado via SQL:', profileData);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

createAdminUser();