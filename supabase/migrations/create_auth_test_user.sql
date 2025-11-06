-- Criar usuário de teste diretamente na tabela auth.users
-- Este script cria um usuário de teste para poder acessar a área administrativa

-- Inserir usuário na tabela auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  confirmed_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@petshop.com',
  '$2a$10$8K1p/a0dhrxSHxN2LOjOOOuBxhdb9LfDEcW6fVb6FNjgjWEtJ9C/a', -- senha: admin123
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin Teste", "phone": "(11) 99999-9999"}',
  false,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = NOW();

-- Atualizar o admin_users para usar o ID correto
UPDATE admin_users 
SET user_id = '00000000-0000-0000-0000-000000000001'
WHERE email = 'admin@petshop.com';