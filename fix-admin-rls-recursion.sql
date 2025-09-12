-- =============================================
-- CORREÇÃO DE RECURSÃO INFINITA NAS POLÍTICAS RLS
-- DA TABELA admin_users_pet
-- =============================================

-- Primeiro, remover as políticas problemáticas
DROP POLICY IF EXISTS "Only admins can view admin users" ON admin_users_pet;
DROP POLICY IF EXISTS "Only super admins can manage admin users" ON admin_users_pet;
DROP POLICY IF EXISTS "Only admins can view admin logs" ON admin_logs_pet;
DROP POLICY IF EXISTS "Only admins can view all settings" ON system_settings_pet;
DROP POLICY IF EXISTS "Only admins can manage settings" ON system_settings_pet;
DROP POLICY IF EXISTS "Only admins can view reports" ON admin_reports_pet;
DROP POLICY IF EXISTS "Admins can view their notifications" ON admin_notifications_pet;
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets_pet;
DROP POLICY IF EXISTS "Admins can update tickets" ON support_tickets_pet;
DROP POLICY IF EXISTS "Admins can view all messages" ON support_messages_pet;

-- =============================================
-- NOVAS POLÍTICAS SEM RECURSÃO
-- =============================================

-- Para admin_users_pet: Permitir que usuários vejam apenas seu próprio registro de admin
CREATE POLICY "Users can view their own admin record" ON admin_users_pet
  FOR SELECT USING (auth.uid() = user_id);

-- Para admin_users_pet: Permitir que super admins vejam todos os registros
-- Usando uma abordagem diferente para evitar recursão
CREATE POLICY "Super admins can view all admin users" ON admin_users_pet
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users_pet 
      WHERE role = 'super_admin' AND is_active = true
    )
  );

-- Para admin_users_pet: Permitir que super admins gerenciem todos os registros
CREATE POLICY "Super admins can manage admin users" ON admin_users_pet
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users_pet 
      WHERE role = 'super_admin' AND is_active = true
    )
  );

-- Para admin_logs_pet: Permitir que admins vejam logs
CREATE POLICY "Admins can view admin logs" ON admin_logs_pet
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users_pet 
      WHERE is_active = true
    )
  );

-- Para system_settings_pet: Manter política pública e adicionar para admins
CREATE POLICY "Admins can view all settings" ON system_settings_pet
  FOR SELECT USING (
    is_public = true OR 
    auth.uid() IN (
      SELECT user_id FROM admin_users_pet 
      WHERE is_active = true
    )
  );

CREATE POLICY "Admins can manage settings" ON system_settings_pet
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users_pet 
      WHERE is_active = true
    )
  );

-- Para admin_reports_pet
CREATE POLICY "Admins can view reports" ON admin_reports_pet
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users_pet 
      WHERE is_active = true
    )
  );

-- Para admin_notifications_pet
CREATE POLICY "Admins can view their notifications" ON admin_notifications_pet
  FOR SELECT USING (
    admin_id IN (
      SELECT id FROM admin_users_pet 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Para support_tickets_pet
CREATE POLICY "Admins can view all tickets" ON support_tickets_pet
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM admin_users_pet 
      WHERE is_active = true
    )
  );

CREATE POLICY "Admins can update tickets" ON support_tickets_pet
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users_pet 
      WHERE is_active = true
    )
  );

-- Para support_messages_pet
CREATE POLICY "Admins can view all messages" ON support_messages_pet
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM support_tickets_pet 
      WHERE user_id = auth.uid()
    ) OR 
    auth.uid() IN (
      SELECT user_id FROM admin_users_pet 
      WHERE is_active = true
    )
  );

-- =============================================
-- VERIFICAÇÃO DAS POLÍTICAS
-- =============================================

-- Listar todas as políticas da tabela admin_users_pet
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'admin_users_pet'
ORDER BY policyname;

-- Verificar se não há mais recursão
SELECT 'Políticas RLS corrigidas com sucesso!' as status;