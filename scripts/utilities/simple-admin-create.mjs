import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hudiuukaoxxzxdcydgky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'
);

async function createSimpleAdmin() {
  console.log('🔧 Criando administrador simples...\n');
  
  try {
    // Passo 1: Tentar criar perfil básico
    console.log('1️⃣ Criando perfil de usuário...');
    
    const profileData = {
      full_name: 'Administrador Teste',
      email: 'admin@petshop.com',
      phone: '(11) 99999-9999'
    };
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles_pet')
      .insert(profileData)
      .select()
      .single();
    
    if (profileError) {
      console.log('❌ Erro ao criar perfil:', profileError.message);
      
      // Verificar se já existe
      const { data: existingProfile } = await supabase
        .from('profiles_pet')
        .select('*')
        .eq('email', 'admin@petshop.com')
        .single();
      
      if (existingProfile) {
        console.log('✅ Perfil já existe:', existingProfile.email);
        
        // Passo 2: Criar admin usando perfil existente
        console.log('2️⃣ Criando registro de administrador...');
        
        const adminData = {
          user_id: existingProfile.id,
          role: 'super_admin',
          permissions: {
            all: true,
            users: true,
            reports: true,
            settings: true,
            tickets: true,
            logs: true,
            security: true
          },
          is_active: true
        };
        
        const { data: admin, error: adminError } = await supabase
          .from('admin_users_pet')
          .insert(adminData)
          .select()
          .single();
        
        if (adminError) {
          console.log('❌ Erro ao criar admin:', adminError.message);
          
          // Verificar se admin já existe
          const { data: existingAdmin } = await supabase
            .from('admin_users_pet')
            .select('*')
            .eq('user_id', existingProfile.id)
            .single();
          
          if (existingAdmin) {
            console.log('✅ Admin já existe:', existingAdmin.role);
          } else {
            console.log('❌ Falha ao criar admin');
            return;
          }
        } else {
          console.log('✅ Admin criado:', admin.role);
        }
        
        // Passo 3: Criar notificação
        console.log('3️⃣ Criando notificação de boas-vindas...');
        
        const { data: adminRecord } = await supabase
          .from('admin_users_pet')
          .select('id')
          .eq('user_id', existingProfile.id)
          .single();
        
        if (adminRecord) {
          const { data: notification, error: notifError } = await supabase
            .from('admin_notifications_pet')
            .insert({
              admin_id: adminRecord.id,
              title: 'Bem-vindo ao Sistema',
              message: 'Conta de administrador restaurada com sucesso!',
              type: 'info',
              is_read: false
            })
            .select()
            .single();
          
          if (notifError) {
            console.log('⚠️ Erro ao criar notificação:', notifError.message);
          } else {
            console.log('✅ Notificação criada');
          }
        }
      } else {
        console.log('❌ Não foi possível criar nem encontrar perfil');
        return;
      }
    } else {
      console.log('✅ Perfil criado:', profile.email);
      
      // Continuar com criação do admin...
      console.log('2️⃣ Criando registro de administrador...');
      
      const adminData = {
        user_id: profile.id,
        role: 'super_admin',
        permissions: {
          all: true,
          users: true,
          reports: true,
          settings: true,
          tickets: true,
          logs: true,
          security: true
        },
        is_active: true
      };
      
      const { data: admin, error: adminError } = await supabase
        .from('admin_users_pet')
        .insert(adminData)
        .select()
        .single();
      
      if (adminError) {
        console.log('❌ Erro ao criar admin:', adminError.message);
      } else {
        console.log('✅ Admin criado:', admin.role);
        
        // Criar notificação
        const { data: notification, error: notifError } = await supabase
          .from('admin_notifications_pet')
          .insert({
            admin_id: admin.id,
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
          console.log('✅ Notificação criada');
        }
      }
    }
    
    // Verificação final
    console.log('\n🔍 Verificação final...');
    
    const { data: finalResult } = await supabase
      .from('admin_users_pet')
      .select(`
        id,
        role,
        is_active,
        profiles_pet!inner(email, full_name)
      `)
      .eq('profiles_pet.email', 'admin@petshop.com');
    
    if (finalResult && finalResult.length > 0) {
      console.log('\n🎉 SUCESSO! Administrador configurado:');
      console.log('📧 Email:', finalResult[0].profiles_pet.email);
      console.log('👤 Nome:', finalResult[0].profiles_pet.full_name);
      console.log('🔑 Role:', finalResult[0].role);
      console.log('✅ Ativo:', finalResult[0].is_active);
    } else {
      console.log('\n❌ Falha na configuração do administrador');
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

createSimpleAdmin();