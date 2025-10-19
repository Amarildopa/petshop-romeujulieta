-- Criar usuário admin temporário para testes do sistema de temas
-- Este script cria um usuário admin vinculado a um perfil existente

-- Primeiro, vamos verificar se existe algum perfil
DO $$
DECLARE
    profile_id UUID;
    admin_exists BOOLEAN;
BEGIN
    -- Verificar se já existe algum admin
    SELECT EXISTS(SELECT 1 FROM admin_users_pet LIMIT 1) INTO admin_exists;
    
    IF NOT admin_exists THEN
        -- Buscar o primeiro perfil disponível
        SELECT id INTO profile_id FROM profiles_pet LIMIT 1;
        
        IF profile_id IS NOT NULL THEN
            -- Criar admin usando perfil existente
            INSERT INTO admin_users_pet (
                user_id,
                role,
                permissions,
                is_active
            ) VALUES (
                profile_id,
                'super_admin',
                '{"all": true, "users": true, "reports": true, "settings": true, "products": true, "orders": true}'::jsonb,
                true
            );
            
            RAISE NOTICE 'Admin criado com sucesso usando perfil existente: %', profile_id;
        ELSE
            -- Criar um perfil temporário e depois o admin
            INSERT INTO profiles_pet (
                full_name,
                phone,
                location
            ) VALUES (
                'Admin Temporário',
                '(11) 99999-9999',
                'São Paulo, SP'
            ) RETURNING id INTO profile_id;
            
            -- Criar admin usando o novo perfil
            INSERT INTO admin_users_pet (
                user_id,
                role,
                permissions,
                is_active
            ) VALUES (
                profile_id,
                'super_admin',
                '{"all": true, "users": true, "reports": true, "settings": true, "products": true, "orders": true}'::jsonb,
                true
            );
            
            RAISE NOTICE 'Admin criado com sucesso usando novo perfil: %', profile_id;
        END IF;
    ELSE
        RAISE NOTICE 'Admin já existe na tabela admin_users_pet';
    END IF;
END $$;

-- Garantir permissões para roles anon e authenticated
GRANT SELECT ON admin_users_pet TO anon;
GRANT SELECT ON admin_users_pet TO authenticated;

-- Verificar se o admin foi criado
SELECT 
    au.id,
    au.role,
    au.permissions,
    au.is_active,
    p.full_name
FROM admin_users_pet au
LEFT JOIN profiles_pet p ON au.user_id = p.id
ORDER BY au.created_at DESC
LIMIT 1;