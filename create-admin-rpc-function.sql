-- =============================================
-- FUNÇÃO RPC PARA CONTORNAR PROBLEMA DE RECURSÃO
-- =============================================

-- Função para obter status de admin do usuário atual
CREATE OR REPLACE FUNCTION get_current_admin_status()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  role TEXT,
  is_active BOOLEAN,
  permissions JSONB,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.user_id,
    au.role,
    au.is_active,
    au.permissions,
    au.created_at
  FROM admin_users_pet au
  WHERE au.user_id = auth.uid();
END;
$$;

-- Função para listar usuários admin (apenas para super admins)
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  role TEXT,
  is_active BOOLEAN,
  permissions JSONB,
  created_at TIMESTAMPTZ,
  full_name TEXT,
  email TEXT,
  phone TEXT
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Verificar se o usuário atual é super admin
  SELECT au.role INTO current_user_role
  FROM admin_users_pet au
  WHERE au.user_id = auth.uid() AND au.is_active = true;
  
  -- Se não for super admin, retornar apenas o próprio registro
  IF current_user_role != 'super_admin' THEN
    RETURN QUERY
    SELECT 
      au.id,
      au.user_id,
      au.role,
      au.is_active,
      au.permissions,
      au.created_at,
      p.full_name,
      p.email,
      p.phone
    FROM admin_users_pet au
    LEFT JOIN profiles_pet p ON au.user_id = p.id
    WHERE au.user_id = auth.uid();
  ELSE
    -- Se for super admin, retornar todos os registros
    RETURN QUERY
    SELECT 
      au.id,
      au.user_id,
      au.role,
      au.is_active,
      au.permissions,
      au.created_at,
      p.full_name,
      p.email,
      p.phone
    FROM admin_users_pet au
    LEFT JOIN profiles_pet p ON au.user_id = p.id
    ORDER BY au.created_at DESC;
  END IF;
END;
$$;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM admin_users_pet
  WHERE user_id = auth.uid() AND is_active = true;
  
  RETURN admin_count > 0;
END;
$$;

-- Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION get_current_admin_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin() TO authenticated;

-- Verificar se as funções foram criadas
SELECT 
  'Função criada: ' || proname as status
FROM pg_proc 
WHERE proname IN ('get_current_admin_status', 'get_admin_users', 'is_user_admin')
ORDER BY proname;