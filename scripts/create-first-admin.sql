-- =============================================
-- SCRIPT PARA CRIAR O PRIMEIRO ADMINISTRADOR
-- =============================================

-- Este script deve ser executado após criar um usuário normal no sistema
-- Substitua 'admin@petshop.com' pelo email do usuário que será o primeiro admin

-- 1. Verificar se o usuário existe
DO $$
DECLARE
    user_exists boolean;
    user_id uuid;
BEGIN
    -- Verificar se existe um usuário com o email especificado
    SELECT EXISTS(
        SELECT 1 FROM profiles_pet 
        WHERE email = 'admin@petshop.com'
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        RAISE EXCEPTION 'Usuário com email admin@petshop.com não encontrado. Crie primeiro um usuário normal no sistema.';
    END IF;
    
    -- Obter o ID do usuário
    SELECT id INTO user_id FROM profiles_pet WHERE email = 'admin@petshop.com';
    
    -- Verificar se já é administrador
    IF EXISTS(SELECT 1 FROM admin_users_pet WHERE user_id = user_id) THEN
        RAISE NOTICE 'Usuário já é um administrador.';
    ELSE
        -- Criar o primeiro administrador
        INSERT INTO admin_users_pet (
            user_id,
            role,
            permissions,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            user_id,
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
        );
        
        RAISE NOTICE 'Primeiro administrador criado com sucesso!';
        RAISE NOTICE 'Email: admin@petshop.com';
        RAISE NOTICE 'Role: super_admin';
        RAISE NOTICE 'Permissões: Todas';
    END IF;
END $$;

-- 2. Verificar se foi criado corretamente
SELECT 
    au.id,
    au.role,
    au.is_active,
    au.permissions,
    p.full_name,
    p.email,
    au.created_at
FROM admin_users_pet au
JOIN profiles_pet p ON au.user_id = p.id
WHERE p.email = 'admin@petshop.com';

-- 3. Criar log da ação
INSERT INTO admin_logs_pet (
    admin_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    created_at
) VALUES (
    (SELECT id FROM admin_users_pet WHERE user_id = (SELECT id FROM profiles_pet WHERE email = 'admin@petshop.com')),
    'create_first_admin',
    'admin_user',
    (SELECT id FROM admin_users_pet WHERE user_id = (SELECT id FROM profiles_pet WHERE email = 'admin@petshop.com')),
    '{"message": "Primeiro administrador criado via script SQL", "email": "admin@petshop.com"}'::jsonb,
    '127.0.0.1',
    'SQL Script',
    NOW()
);

-- 4. Criar notificação de boas-vindas
INSERT INTO admin_notifications_pet (
    title,
    message,
    type,
    priority,
    is_read,
    admin_id,
    action_url,
    metadata,
    created_at
) VALUES (
    'Bem-vindo ao Painel Administrativo!',
    'Seu acesso de Super Administrador foi configurado com sucesso. Você tem acesso total ao sistema.',
    'success',
    'high',
    false,
    (SELECT id FROM admin_users_pet WHERE user_id = (SELECT id FROM profiles_pet WHERE email = 'admin@petshop.com')),
    '/admin',
    '{"welcome": true, "first_login": true}'::jsonb,
    NOW()
);

-- 5. Mostrar informações finais
SELECT 
    '✅ PRIMEIRO ADMINISTRADOR CRIADO COM SUCESSO!' as status,
    'admin@petshop.com' as email,
    'super_admin' as role,
    'Todas as permissões' as permissions;
