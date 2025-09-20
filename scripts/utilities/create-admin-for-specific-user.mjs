import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  console.error('Certifique-se de que VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão no .env');
  process.exit(1);
}

// Cliente com service_role para contornar RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminForSpecificUser(userId) {
  console.log('👑 CRIANDO ADMINISTRADOR PARA USUÁRIO ESPECÍFICO');
  console.log('==============================================');
  console.log(`🆔 User ID: ${userId}`);
  console.log('');

  try {
    // 1. Verificar se o usuário existe
    console.log('🔍 1. Verificando se o usuário existe...');
    let { data: profile, error: profileError } = await supabase
      .from('profiles_pet')
      .select('id, full_name, email, phone')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.log('❌ Usuário não encontrado no sistema!');
      console.log('🔧 Criando perfil para o usuário...');
      
      // Criar perfil básico para o usuário
      const { data: newProfile, error: createError } = await supabase
        .from('profiles_pet')
        .insert({
          id: userId,
          full_name: 'Amarildo Albuquerque',
          email: 'amarildo.albuquerque@gmail.com',
          phone: '(11) 99999-9999',
          address: 'Endereço não informado',
          cep: '00000-000'
        })
        .select()
        .single();

      if (createError) {
        console.log(`❌ Erro ao criar perfil: ${createError.message}`);
        return;
      }

      console.log('✅ Perfil criado com sucesso!');
      console.log(`   📧 Email: ${newProfile.email}`);
      console.log(`   👤 Nome: ${newProfile.full_name}`);
      
      // Usar o perfil recém-criado
      profile = newProfile;
    }

    console.log(`✅ Usuário encontrado:`);
    console.log(`   📧 Email: ${profile.email}`);
    console.log(`   👤 Nome: ${profile.full_name}`);
    console.log(`   📱 Telefone: ${profile.phone || 'Não informado'}`);
    console.log('');

    // 2. Verificar se já é administrador
    console.log('🔍 2. Verificando se já é administrador...');
    const { data: existingAdmin, error: adminCheckError } = await supabase
      .from('admin_users_pet')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingAdmin) {
      console.log('⚠️  Usuário já é administrador!');
      console.log(`   🎭 Cargo atual: ${existingAdmin.role}`);
      console.log(`   ✅ Ativo: ${existingAdmin.is_active ? 'Sim' : 'Não'}`);
      console.log('');
      
      // Atualizar para garantir que está ativo e com permissões completas
      console.log('🔄 Atualizando permissões do administrador...');
      const { error: updateError } = await supabase
        .from('admin_users_pet')
        .update({
          role: 'super_admin',
          is_active: true,
          permissions: {
            all: true,
            users: true,
            reports: true,
            settings: true,
            pets: true,
            appointments: true,
            orders: true,
            analytics: true
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.log(`❌ Erro ao atualizar: ${updateError.message}`);
      } else {
        console.log('✅ Permissões atualizadas com sucesso!');
      }
    } else {
      // 3. Criar novo registro de administrador
      console.log('👑 3. Criando registro de administrador...');
      const { data: newAdmin, error: createError } = await supabase
        .from('admin_users_pet')
        .insert({
          user_id: userId,
          role: 'super_admin',
          is_active: true,
          permissions: {
            all: true,
            users: true,
            reports: true,
            settings: true,
            pets: true,
            appointments: true,
            orders: true,
            analytics: true
          }
        })
        .select()
        .single();

      if (createError) {
        console.log(`❌ Erro ao criar administrador: ${createError.message}`);
        return;
      }

      console.log('✅ Administrador criado com sucesso!');
      console.log(`   🆔 Admin ID: ${newAdmin.id}`);
    }

    // 4. Criar notificação de boas-vindas
    console.log('📢 4. Criando notificação de boas-vindas...');
    const { error: notificationError } = await supabase
      .from('admin_notifications_pet')
      .insert({
        admin_id: existingAdmin?.id || (await supabase
          .from('admin_users_pet')
          .select('id')
          .eq('user_id', userId)
          .single()).data?.id,
        title: 'Bem-vindo ao Painel Administrativo!',
        message: `Olá ${profile.full_name}! Você agora tem acesso completo ao sistema administrativo do PetShop Romeo & Julieta. Suas permissões incluem gerenciamento de usuários, relatórios, configurações e muito mais.`,
        type: 'welcome',
        is_read: false
      });

    if (notificationError) {
      console.log(`⚠️  Aviso: Erro ao criar notificação (${notificationError.message})`);
    } else {
      console.log('✅ Notificação de boas-vindas criada!');
    }

    // 5. Registrar log de atividade
    console.log('📝 5. Registrando log de atividade...');
    const { error: logError } = await supabase
      .from('admin_logs_pet')
      .insert({
        admin_id: existingAdmin?.id || (await supabase
          .from('admin_users_pet')
          .select('id')
          .eq('user_id', userId)
          .single()).data?.id,
        action: 'admin_created',
        details: {
          user_id: userId,
          email: profile.email,
          name: profile.full_name,
          role: 'super_admin',
          created_by: 'system_script'
        },
        ip_address: '127.0.0.1'
      });

    if (logError) {
      console.log(`⚠️  Aviso: Erro ao criar log (${logError.message})`);
    } else {
      console.log('✅ Log de atividade registrado!');
    }

    console.log('');

    // 6. Verificar configuração final
    console.log('🔍 6. Verificando configuração final...');
    const { data: finalAdmin, error: finalError } = await supabase
      .from('admin_users_pet')
      .select(`
        id,
        role,
        is_active,
        permissions,
        created_at
      `)
      .eq('user_id', userId)
      .single();

    if (finalError) {
      console.log(`❌ Erro na verificação final: ${finalError.message}`);
    } else {
      console.log('✅ CONFIGURAÇÃO FINAL DO ADMINISTRADOR:');
      console.log('=====================================');
      console.log(`👤 Nome: ${profile.full_name}`);
      console.log(`📧 Email: ${profile.email}`);
      console.log(`🆔 User ID: ${userId}`);
      console.log(`🆔 Admin ID: ${finalAdmin.id}`);
      console.log(`🎭 Cargo: ${finalAdmin.role}`);
      console.log(`✅ Ativo: ${finalAdmin.is_active ? 'Sim' : 'Não'}`);
      console.log(`🔑 Permissões: ${JSON.stringify(finalAdmin.permissions, null, 2)}`);
      console.log(`📅 Criado em: ${new Date(finalAdmin.created_at).toLocaleString('pt-BR')}`);
    }

    console.log('');
    console.log('🎉 SUCESSO! ADMINISTRADOR CONFIGURADO!');
    console.log('=====================================');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('1. 🔐 Faça login com as credenciais do usuário');
    console.log('2. 🏠 Acesse a área administrativa do sistema');
    console.log('3. ⚙️  Teste as funcionalidades de administrador');
    console.log('4. 👥 Gerencie usuários, pets e agendamentos');

  } catch (error) {
    console.error('❌ Erro durante a criação do administrador:', error.message);
  }
}

// ID do usuário específico
const specificUserId = 'fa323991-019c-4f72-b144-27304cc396ae';

console.log('🚀 Iniciando criação de administrador...');
console.log(`🎯 Usuário alvo: ${specificUserId}`);
console.log('');

// Executar a criação
createAdminForSpecificUser(specificUserId);