import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env');
  process.exit(1);
}

// Cliente com privilégios de service_role
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function resetAllUsers() {
  console.log('🔥 RESETANDO TODOS OS USUÁRIOS E DADOS...\n');
  console.log('⚠️  ATENÇÃO: Esta operação é IRREVERSÍVEL!\n');
  
  try {
    // 1. Deletar logs administrativos
    console.log('1️⃣ Deletando logs administrativos...');
    const { error: logsError } = await supabase
      .from('admin_logs_pet')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (logsError) {
      console.log('⚠️  Aviso ao deletar logs:', logsError.message);
    } else {
      console.log('✅ Logs administrativos deletados');
    }

    // 2. Deletar notificações administrativas
    console.log('2️⃣ Deletando notificações administrativas...');
    const { error: notificationsError } = await supabase
      .from('admin_notifications_pet')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (notificationsError) {
      console.log('⚠️  Aviso ao deletar notificações:', notificationsError.message);
    } else {
      console.log('✅ Notificações administrativas deletadas');
    }

    // 3. Deletar administradores
    console.log('3️⃣ Deletando administradores...');
    const { error: adminError } = await supabase
      .from('admin_users_pet')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (adminError) {
      console.log('⚠️  Aviso ao deletar admins:', adminError.message);
    } else {
      console.log('✅ Administradores deletados');
    }

    // 4. Deletar pets
    console.log('4️⃣ Deletando pets...');
    const { error: petsError } = await supabase
      .from('pets_pet')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (petsError) {
      console.log('⚠️  Aviso ao deletar pets:', petsError.message);
    } else {
      console.log('✅ Pets deletados');
    }

    // 5. Deletar agendamentos
    console.log('5️⃣ Deletando agendamentos...');
    const { error: appointmentsError } = await supabase
      .from('appointments_pet')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (appointmentsError) {
      console.log('⚠️  Aviso ao deletar agendamentos:', appointmentsError.message);
    } else {
      console.log('✅ Agendamentos deletados');
    }

    // 6. Deletar pedidos
    console.log('6️⃣ Deletando pedidos...');
    const { error: ordersError } = await supabase
      .from('orders_pet')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (ordersError) {
      console.log('⚠️  Aviso ao deletar pedidos:', ordersError.message);
    } else {
      console.log('✅ Pedidos deletados');
    }

    // 7. Deletar configurações de comunicação
    console.log('7️⃣ Deletando configurações de comunicação...');
    const { error: commError } = await supabase
      .from('communication_settings_pet')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (commError) {
      console.log('⚠️  Aviso ao deletar configurações:', commError.message);
    } else {
      console.log('✅ Configurações de comunicação deletadas');
    }

    // 8. Deletar perfis de usuários (CASCADE irá deletar dados relacionados)
    console.log('8️⃣ Deletando perfis de usuários...');
    const { error: profilesError } = await supabase
      .from('profiles_pet')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (profilesError) {
      console.log('⚠️  Aviso ao deletar perfis:', profilesError.message);
    } else {
      console.log('✅ Perfis de usuários deletados');
    }

    // 9. Verificar se tudo foi deletado
    console.log('\n🔍 Verificando limpeza...');
    
    const tables = [
      'profiles_pet',
      'admin_users_pet', 
      'pets_pet',
      'appointments_pet',
      'orders_pet',
      'admin_logs_pet',
      'admin_notifications_pet',
      'communication_settings_pet'
    ];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`⚠️  Erro ao verificar ${table}:`, error.message);
      } else {
        console.log(`📊 ${table}: ${count || 0} registros restantes`);
      }
    }

    console.log('\n🎉 RESET COMPLETO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Todos os usuários e dados foram deletados');
    console.log('✅ Sistema limpo e pronto para recomeçar');
    console.log('✅ Você pode agora criar novos usuários do zero');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Erro durante o reset:', error.message);
    process.exit(1);
  }
}

// Executar o reset
resetAllUsers();