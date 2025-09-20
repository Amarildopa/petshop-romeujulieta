-- =============================================
-- FUNÇÃO check_admin_status PARA VERIFICAR STATUS DE ADMIN
-- =============================================

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

-- Verificar se a função foi criada
SELECT 
  'Função check_admin_status criada com sucesso!' as status
FROM pg_proc 
WHERE proname = 'check_admin_status';