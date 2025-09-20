import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Configuração do Supabase
const supabaseUrl = 'https://hudiuukaoxxzxdcydgky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGl1dWthb3h4enhkY3lkZ2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTgwNDYsImV4cCI6MjA3MTIzNDA0Nn0.q4vojkhRTB1eoLu4vgERihYzRVK7NbJsxKuLW3mLOFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCheckAdminFunction() {
  console.log('🔧 Criando função check_admin_status...');
  
  try {
    // SQL para criar a função
    const sql = `
-- Função para verificar status de admin do usuário atual
CREATE OR REPLACE FUNCTION check_admin_status()
RETURNS TABLE (
  is_admin BOOLEAN,
  role TEXT,
  is_active BOOLEAN,
  permissions JSONB,
  user_id UUID
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN au.user_id IS NOT NULL THEN true ELSE false END as is_admin,
    COALESCE(au.role, 'user') as role,
    COALESCE(au.is_active, false) as is_active,
    COALESCE(au.permissions, '{}'::jsonb) as permissions,
    auth.uid() as user_id
  FROM admin_users_pet au
  WHERE au.user_id = auth.uid()
  UNION ALL
  SELECT 
    false as is_admin,
    'user' as role,
    false as is_active,
    '{}'::jsonb as permissions,
    auth.uid() as user_id
  WHERE NOT EXISTS (
    SELECT 1 FROM admin_users_pet WHERE user_id = auth.uid()
  );
END;
$$;

-- Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION check_admin_status() TO authenticated;
    `;

    // Executar usando RPC exec
    const { data, error } = await supabase.rpc('exec', {
      sql: sql
    });

    if (error) {
      console.log('❌ Erro ao criar função check_admin_status:', error);
      return;
    }

    console.log('✅ Função check_admin_status criada com sucesso!');
    
    // Testar a função
    console.log('🧪 Testando a função...');
    const { data: testData, error: testError } = await supabase.rpc('check_admin_status');
    
    if (testError) {
      console.log('❌ Erro ao testar função:', testError);
    } else {
      console.log('✅ Função testada com sucesso!');
      console.log('📊 Resultado:', testData);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error);
  }
}

createCheckAdminFunction();