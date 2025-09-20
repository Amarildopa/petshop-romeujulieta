import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hudiuukaoxxzxdcydgky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA'
);

async function restoreAdminTables() {
  console.log('🔧 Restaurando tabelas de administrador...\n');
  
  try {
    // 1. Verificar se existe algum usuário no profiles_pet para usar como admin
    console.log('📋 Verificando usuários disponíveis...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles_pet')
      .select('id, email, full_name')
      .limit(5);
    
    if (profilesError) {
      console.log('❌ Erro ao buscar perfis:', profilesError.message);
      return;
    }
    
    console.log(`✅ Encontrados ${profiles.length} usuários no sistema:`);
    profiles.forEach((profile, index) => {
      console.log(`  ${index + 1}. ${profile.email} (${profile.full_name})`);
    });
    
    if (profiles.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado. Criando usuário admin padrão...');
      
      // Criar usuário admin padrão
      const { data: newProfile, error: createError } = await supabase
        .from('profiles_pet')
        .insert({
          full_name: 'Administrador Sistema',
          email: 'admin@petshop.com',
          phone: '(11) 99999-9999',
          address: 'Rua Admin, 123',
          cep: '01234-567'
        })
        .select()
        .single();
      
      if (createError) {
        console.log('❌ Erro ao criar usuário admin:', createError.message);
        return;
      }
      
      console.log('✅ Usuário admin criado:', newProfile.email);
      profiles.push(newProfile);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Criar registro de administrador para o primeiro usuário
    const adminUser = profiles[0];
    console.log(`🔐 Criando administrador para: ${adminUser.email}`);
    
    const { data: adminRecord, error: adminError } = await supabase
      .from('admin_users_pet')
      .insert({
        user_id: adminUser.id,
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
      })
      .select()
      .single();
    
    if (adminError) {
      if (adminError.code === '23505') { // Unique constraint violation
        console.log('⚠️  Usuário já é administrador. Atualizando permissões...');
        
        const { data: updatedAdmin, error: updateError } = await supabase
          .from('admin_users_pet')
          .update({
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
          })
          .eq('user_id', adminUser.id)
          .select()
          .single();
        
        if (updateError) {
          console.log('❌ Erro ao atualizar admin:', updateError.message);
          return;
        }
        
        console.log('✅ Administrador atualizado com sucesso!');
      } else {
        console.log('❌ Erro ao criar administrador:', adminError.message);
        return;
      }
    } else {
      console.log('✅ Administrador criado com sucesso!');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Buscar o ID do administrador criado/atualizado
    const { data: adminData, error: adminFetchError } = await supabase
      .from('admin_users_pet')
      .select('id')
      .eq('user_id', adminUser.id)
      .single();
    
    if (adminFetchError) {
      console.log('❌ Erro ao buscar ID do admin:', adminFetchError.message);
      return;
    }
    
    // 4. Criar notificação de boas-vindas
    console.log('📢 Criando notificação de boas-vindas...');
    
    const { data: notification, error: notifError } = await supabase
      .from('admin_notifications_pet')
      .insert({
        title: 'Bem-vindo ao Painel Administrativo!',
        message: 'Seu acesso de Super Administrador foi configurado com sucesso. Você tem acesso total ao sistema.',
        type: 'success',
        priority: 'high',
        is_read: false,
        admin_id: adminData.id,
        action_url: '/admin',
        metadata: {
          welcome: true,
          first_login: true,
          restored: true,
          restored_at: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (notifError) {
      console.log('⚠️  Erro ao criar notificação:', notifError.message);
    } else {
      console.log('✅ Notificação de boas-vindas criada!');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 5. Verificar resultado final
    console.log('🔍 Verificando configuração final...');
    
    const { data: finalCheck, error: finalError } = await supabase
      .from('admin_users_pet')
      .select(`
        id,
        role,
        is_active,
        permissions,
        created_at,
        profiles_pet:user_id (
          email,
          full_name
        )
      `)
      .eq('user_id', adminUser.id)
      .single();
    
    if (finalError) {
      console.log('❌ Erro na verificação final:', finalError.message);
    } else {
      console.log('✅ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
      console.log('📋 Detalhes do administrador:');
      console.log(`  - Email: ${finalCheck.profiles_pet.email}`);
      console.log(`  - Nome: ${finalCheck.profiles_pet.full_name}`);
      console.log(`  - Cargo: ${finalCheck.role}`);
      console.log(`  - Ativo: ${finalCheck.is_active ? 'Sim' : 'Não'}`);
      console.log(`  - Permissões: ${Object.keys(finalCheck.permissions).length} configuradas`);
      console.log(`  - Criado em: ${new Date(finalCheck.created_at).toLocaleString('pt-BR')}`);
    }
    
    // 6. Verificar notificações
    const { data: notifCount, error: notifCountError } = await supabase
      .from('admin_notifications_pet')
      .select('id', { count: 'exact' })
      .eq('admin_id', adminData.id);
    
    if (!notifCountError) {
      console.log(`📢 Notificações: ${notifCount.length} registros`);
    }
    
    console.log('\n🎉 Restauração das tabelas de administrador concluída!');
    console.log('🔗 Acesse: http://localhost:5173/admin para testar');
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

restoreAdminTables();