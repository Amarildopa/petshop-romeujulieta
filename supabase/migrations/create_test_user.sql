-- Criar usuário de teste para acesso administrativo
-- Este script cria um usuário de teste no Supabase Auth e o associa à tabela admin_users

-- Primeiro, vamos inserir o usuário na tabela auth.users (simulando o que o Supabase faria)
-- Nota: Em produção, isso seria feito através do Supabase Auth UI ou API

-- Inserir na tabela admin_users (assumindo que o user_id será gerado pelo Supabase Auth)
-- Para teste, vamos usar um UUID fixo que corresponderá ao usuário criado
INSERT INTO admin_users (
  user_id,
  name,
  email,
  phone,
  role,
  permissions,
  is_active,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- UUID fixo para teste
  'Admin Teste',
  'admin@petshop.com',
  '(11) 99999-9999',
  'super_admin',
  '["settings", "users", "orders", "reports", "weekly_baths", "journey"]'::jsonb,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Garantir que o usuário admin tenha acesso às tabelas necessárias
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;