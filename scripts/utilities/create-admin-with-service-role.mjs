import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no arquivo .env');
  console.log('📋 Certifique-se de que a chave está definida corretamente');
  process.exit(1);
}

// Cliente com privilégios administrativos
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminWithServiceRole() {
  console.log('🔧 Criando administrador com privilégios de service_role...\n');
  
  try {
    // Passo 1: Criar perfil de usuário
    console.log('1️⃣ Criando perfil de usuário...');
    
    const profileData = {
      full_name: 'Administrador do Sistema',
      email: 'admin@petshop.com',
      phone: '(11) 99999-9999',
      address: 'Rua Teste, 123',
      cep: '01234-567'
    };
    
    // Usar upsert para evitar conflitos
    const { data: profile, error: profileError } = await supabase
      .from('profiles_pet')
      .upsert(profileData, {
        onConflict: 'email'
      })
      .select()
      .single();
    
    if (profileError) {
      console.log('❌ Erro ao criar perfil:', profileError.message);
      return;
    }
    
    console.log('✅ Perfil criado/atualizado:', profile.email);
    
    // Passo 2: Criar registro de administrador
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
      .upsert(adminData)
      .select()
      .single();
    
    if (adminError) {
      console.log('❌ Erro ao criar admin:', adminError.message);
      return;
    }
    
    console.log('✅ Admin criado/atualizado:', admin.role);
    
    // Passo 3: Criar notificação de boas-vindas
    console.log('3️⃣ Criando notificação de boas-vindas...');
    
    const notificationData = {
      admin_id: admin.id,
      title: 'Sistema Restaurado',
      message: 'Conta de administrador foi restaurada com sucesso! Todas as funcionalidades administrativas estão disponíveis.',
      type: 'success',
      priority: 'high',
      is_read: false
    };
    
    const { data: notification, error: notifError } = await supabase
      .from('admin_notifications_pet')
      .insert(notificationData)
      .select()
      .single();
    
    if (notifError) {
      console.log('⚠️ Erro ao criar notificação:', notifError.message);
    } else {
      console.log('✅ Notificação criada');
    }
    
    // Passo 4: Criar log de atividade
    console.log('4️⃣ Criando log de atividade...');
    
    const logData = {
      admin_id: admin.id,
      action: 'admin_account_restored',
      resource_type: 'admin_user',
      resource_id: admin.id,
      details: {
        message: 'Conta de administrador restaurada via script de recuperação',
        email: profile.email,
        role: admin.role
      },
      ip_address: '127.0.0.1'
    };
    
    const { data: log, error: logError } = await supabase
      .from('admin_logs_pet')
      .insert(logData)
      .select()
      .single();
    
    if (logError) {
      console.log('⚠️ Erro ao criar log:', logError.message);
    } else {
      console.log('✅ Log de atividade criado');
    }
    
    // Verificação final
    console.log('\n🔍 Verificação final...');
    
    const { data: finalResult, error: finalError } = await supabase
      .from('admin_users_pet')
      .select(`
        id,
        role,
        is_active,
        permissions,
        profiles_pet!inner(email, full_name, phone)
      `)
      .eq('profiles_pet.email', 'admin@petshop.com')
      .single();
    
    if (finalError) {
      console.log('❌ Erro na verificação final:', finalError.message);
      return;
    }
    
    if (finalResult) {
      console.log('\n🎉 SUCESSO! Administrador configurado com sucesso:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', finalResult.profiles_pet.email);
      console.log('👤 Nome:', finalResult.profiles_pet.full_name);
      console.log('📱 Telefone:', finalResult.profiles_pet.phone);
      console.log('🔑 Role:', finalResult.role);
      console.log('✅ Ativo:', finalResult.is_active);
      console.log('🛡️ Permissões:', Object.keys(finalResult.permissions).join(', '));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Verificar notificações
      const { data: notifications } = await supabase
        .from('admin_notifications_pet')
        .select('*')
        .eq('admin_id', finalResult.id);
      
      console.log(`📬 Notificações: ${notifications?.length || 0} registros`);
      
      // Verificar logs
      const { data: logs } = await supabase
        .from('admin_logs_pet')
        .select('*')
        .eq('admin_id', finalResult.id);
      
      console.log(`📋 Logs: ${logs?.length || 0} registros`);
      
      console.log('\n✨ O sistema administrativo foi restaurado com sucesso!');
      console.log('🔐 Você pode agora fazer login com: admin@petshop.com');
      
    } else {
      console.log('\n❌ Falha na configuração do administrador');
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
    console.log('Stack:', error.stack);
  }
}

createAdminWithServiceRole();