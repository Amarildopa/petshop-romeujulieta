-- Criar usuário admin para testes
-- Este script cria um usuário admin com todas as permissões para testar a integração

-- Inserir usuário admin na tabela admin_users
INSERT INTO admin_users (
  name,
  email,
  phone,
  role,
  permissions,
  is_active
) VALUES (
  'Admin Teste',
  'admin@petshop.com',
  '11999999999',
  'super_admin',
  '{
    "users": true,
    "reports": true,
    "tickets": true,
    "notifications": true,
    "logs": true,
    "settings": true,
    "security": true,
    "products": true,
    "orders": true,
    "appointments": true
  }'::jsonb,
  true
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active,
  updated_at = now();