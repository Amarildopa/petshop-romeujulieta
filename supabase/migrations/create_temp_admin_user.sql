-- Criar usuário admin temporário para testes
-- Este script cria um usuário admin com credenciais temporárias

-- Inserir perfil de admin temporário
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  is_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@petshop.com',
  'Admin Temporário',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- Garantir permissões para roles anon e authenticated
GRANT SELECT, INSERT, UPDATE ON profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- Comentário de sucesso
-- RAISE NOTICE 'Admin temporário criado com sucesso: admin@petshop.com';
-- RAISE NOTICE 'ID: 00000000-0000-0000-0000-000000000001';
-- RAISE NOTICE 'Para fazer login, use as credenciais do Supabase Auth';