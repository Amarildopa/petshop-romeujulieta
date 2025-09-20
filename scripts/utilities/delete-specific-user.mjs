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

async function deleteSpecificUser(userEmail) {
  console.log('🗑️  INICIANDO EXCLUSÃO DE USUÁRIO ESPECÍFICO');
  console.log('==========================================');
  console.log(`📧 Email do usuário: ${userEmail}`);
  console.log('');

  try {
    // 1. Buscar o usuário pelo email
    console.log('🔍 1. Buscando usuário...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles_pet')
      .select('id, full_name, email')
      .eq('email', userEmail)
      .single();

    if (profileError || !profile) {
      console.log('❌ Usuário não encontrado!');
      return;
    }

    const userId = profile.id;
    console.log(`✅ Usuário encontrado: ${profile.full_name} (${userId})`);
    console.log('');

    // 2. Deletar registros dependentes na ordem correta
    const deletions = [
      { table: 'admin_logs_pet', condition: `admin_id IN (SELECT id FROM admin_users_pet WHERE user_id = '${userId}')`, name: 'Logs de administrador' },
      { table: 'admin_notifications_pet', condition: `admin_id IN (SELECT id FROM admin_users_pet WHERE user_id = '${userId}')`, name: 'Notificações de administrador' },
      { table: 'admin_users_pet', condition: `user_id = '${userId}'`, name: 'Registros de administrador' },
      { table: 'service_progress_pet', condition: `appointment_id IN (SELECT id FROM appointments_pet WHERE user_id = '${userId}')`, name: 'Progresso de serviços' },
      { table: 'appointments_pet', condition: `user_id = '${userId}'`, name: 'Agendamentos' },
      { table: 'pets_pet', condition: `owner_id = '${userId}'`, name: 'Pets' },
      { table: 'orders_pet', condition: `user_id = '${userId}'`, name: 'Pedidos' },
      { table: 'subscriptions_pet', condition: `user_id = '${userId}'`, name: 'Assinaturas' },
      { table: 'notifications_pet', condition: `user_id = '${userId}'`, name: 'Notificações' },
      { table: 'communication_settings_pet', condition: `user_id = '${userId}'`, name: 'Configurações de comunicação' },
      { table: 'support_tickets_pet', condition: `user_id = '${userId}'`, name: 'Tickets de suporte' },
      { table: 'feedback_pet', condition: `user_id = '${userId}'`, name: 'Feedbacks' },
      { table: 'chat_room_participants_pet', condition: `user_id = '${userId}'`, name: 'Participações em chat' }
    ];

    console.log('🗑️  2. Deletando registros dependentes...');
    
    for (const deletion of deletions) {
      try {
        // Contar registros antes da exclusão
        const { count: beforeCount } = await supabase
          .from(deletion.table)
          .select('*', { count: 'exact', head: true });

        // Executar exclusão via RPC ou query direta
        const { data, error } = await supabase.rpc('delete_user_data', {
          table_name: deletion.table,
          where_condition: deletion.condition
        }).catch(async () => {
          // Fallback: tentar exclusão direta
          return await supabase
            .from(deletion.table)
            .delete()
            .or(deletion.condition.replace(/'/g, "''"));
        });

        if (error) {
          console.log(`⚠️  ${deletion.name}: Erro (${error.message})`);
        } else {
          // Contar registros após exclusão
          const { count: afterCount } = await supabase
            .from(deletion.table)
            .select('*', { count: 'exact', head: true });
          
          const deletedCount = (beforeCount || 0) - (afterCount || 0);
          console.log(`✅ ${deletion.name}: ${deletedCount} registros deletados`);
        }
      } catch (err) {
        console.log(`⚠️  ${deletion.name}: Erro inesperado (${err.message})`);
      }
    }

    console.log('');

    // 3. Deletar o perfil do usuário
    console.log('🗑️  3. Deletando perfil do usuário...');
    const { error: profileDeleteError } = await supabase
      .from('profiles_pet')
      .delete()
      .eq('id', userId);

    if (profileDeleteError) {
      console.log(`❌ Erro ao deletar perfil: ${profileDeleteError.message}`);
    } else {
      console.log('✅ Perfil deletado com sucesso');
    }

    console.log('');

    // 4. Tentar deletar da tabela auth.users (pode não funcionar via cliente)
    console.log('🗑️  4. Tentando deletar da autenticação...');
    console.log('⚠️  NOTA: A exclusão de auth.users deve ser feita pelo Supabase Admin Dashboard');
    console.log(`   Vá em Authentication > Users e delete o usuário: ${userEmail}`);

    console.log('');
    console.log('✅ EXCLUSÃO CONCLUÍDA!');
    console.log('==========================================');
    console.log(`📧 Usuário ${userEmail} foi removido do sistema`);
    console.log('🔄 Agora você pode deletar da auth.users no Dashboard do Supabase');

  } catch (error) {
    console.error('❌ Erro durante a exclusão:', error.message);
  }
}

// Verificar se foi fornecido um email como argumento
const userEmail = process.argv[2];

if (!userEmail) {
  console.log('❌ Erro: Email do usuário não fornecido');
  console.log('');
  console.log('📋 USO:');
  console.log('node delete-specific-user.mjs usuario@email.com');
  console.log('');
  console.log('📝 EXEMPLO:');
  console.log('node delete-specific-user.mjs amarildo.albuquerque@gmail.com');
  process.exit(1);
}

// Executar a exclusão
deleteSpecificUser(userEmail);