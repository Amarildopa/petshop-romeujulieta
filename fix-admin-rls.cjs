const { createClient } = require('@supabase/supabase-js');

// Usar variáveis de ambiente diretamente
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hudiuukaoxxzxdcydgky.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada nas variáveis de ambiente');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixAdminRLS() {
  console.log('🔧 Corrigindo recursão infinita nas políticas RLS...');
  
  try {
    // Remover políticas problemáticas
    console.log('1️⃣ Removendo políticas problemáticas...');
    
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Only admins can view admin users" ON admin_users_pet',
      'DROP POLICY IF EXISTS "Only super admins can manage admin users" ON admin_users_pet',
      'DROP POLICY IF EXISTS "Only admins can view admin logs" ON admin_logs_pet',
      'DROP POLICY IF EXISTS "Only admins can view all settings" ON system_settings_pet',
      'DROP POLICY IF EXISTS "Only admins can manage settings" ON system_settings_pet',
      'DROP POLICY IF EXISTS "Only admins can view reports" ON admin_reports_pet',
      'DROP POLICY IF EXISTS "Admins can view their notifications" ON admin_notifications_pet',
      'DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets_pet',
      'DROP POLICY IF EXISTS "Admins can update tickets" ON support_tickets_pet',
      'DROP POLICY IF EXISTS "Admins can view all messages" ON support_messages_pet'
    ];
    
    for (const policy of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error && !error.message.includes('does not exist')) {
        console.warn(`Aviso ao remover política: ${error.message}`);
      }
    }
    
    console.log('2️⃣ Criando novas políticas sem recursão...');
    
    // Criar novas políticas sem recursão
    const newPolicies = [
      // Para admin_users_pet
      `CREATE POLICY "Users can view their own admin record" ON admin_users_pet
        FOR SELECT USING (auth.uid() = user_id)`,
      
      // Para admin_logs_pet
      `CREATE POLICY "Admins can view admin logs" ON admin_logs_pet
        FOR SELECT USING (
          auth.uid() IN (
            SELECT user_id FROM admin_users_pet 
            WHERE is_active = true
          )
        )`,
      
      // Para system_settings_pet
      `CREATE POLICY "Admins can view all settings" ON system_settings_pet
        FOR SELECT USING (
          is_public = true OR 
          auth.uid() IN (
            SELECT user_id FROM admin_users_pet 
            WHERE is_active = true
          )
        )`,
      
      `CREATE POLICY "Admins can manage settings" ON system_settings_pet
        FOR ALL USING (
          auth.uid() IN (
            SELECT user_id FROM admin_users_pet 
            WHERE is_active = true
          )
        )`
    ];
    
    for (const policy of newPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.error(`Erro ao criar política: ${error.message}`);
      }
    }
    
    console.log('3️⃣ Verificando políticas criadas...');
    
    // Verificar políticas
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `SELECT policyname, tablename FROM pg_policies WHERE tablename = 'admin_users_pet' ORDER BY policyname`
    });
    
    if (policiesError) {
      console.error('Erro ao verificar políticas:', policiesError);
    } else {
      console.log('Políticas atuais na tabela admin_users_pet:');
      console.log(policies);
    }
    
    console.log('✅ Correção das políticas RLS concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

fixAdminRLS();