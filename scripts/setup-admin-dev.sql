-- =============================================
-- SCRIPT SIMPLIFICADO PARA DESENVOLVIMENTO
-- =============================================

-- Este script cria um usuário de teste e o torna administrador
-- Use apenas em ambiente de desenvolvimento

-- 1. Criar usuário de teste se não existir
INSERT INTO profiles_pet (
    id,
    full_name,
    email,
    phone,
    address,
    cep,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Administrador Teste',
    'admin@petshop.com',
    '(11) 99999-9999',
    'Rua Teste, 123',
    '01234-567',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 2. Criar administrador
INSERT INTO admin_users_pet (
    user_id,
    role,
    permissions,
    is_active,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM profiles_pet WHERE email = 'admin@petshop.com'),
    'super_admin',
    '{
        "all": true,
        "users": true,
        "reports": true,
        "settings": true,
        "tickets": true,
        "logs": true,
        "security": true
    }'::jsonb,
    true,
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    role = 'super_admin',
    permissions = '{
        "all": true,
        "users": true,
        "reports": true,
        "settings": true,
        "tickets": true,
        "logs": true,
        "security": true
    }'::jsonb,
    is_active = true,
    updated_at = NOW();

-- 3. Verificar resultado
SELECT 
    '✅ ADMINISTRADOR CONFIGURADO!' as status,
    p.email,
    au.role,
    au.is_active,
    au.permissions
FROM admin_users_pet au
JOIN profiles_pet p ON au.user_id = p.id
WHERE p.email = 'admin@petshop.com';
