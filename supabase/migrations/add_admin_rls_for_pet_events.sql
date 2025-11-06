-- =============================================
-- MIGRAÇÃO: Permitir que administradores vejam eventos e fotos da jornada
-- =============================================

-- Habilitar RLS (já deve estar habilitado, mas garantimos)
ALTER TABLE pet_events_pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photos_pet ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas duplicadas se necessário
DROP POLICY IF EXISTS "Admins can view all pet events" ON pet_events_pet;
DROP POLICY IF EXISTS "Admins can view all event photos" ON event_photos_pet;

-- Nova política: Admins podem visualizar todos os eventos dos pets
CREATE POLICY "Admins can view all pet events" ON pet_events_pet
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users_pet au
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- Nova política: Admins podem visualizar todas as fotos de eventos
CREATE POLICY "Admins can view all event photos" ON event_photos_pet
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users_pet au
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- Garantir privilégios
GRANT SELECT ON pet_events_pet TO authenticated;
GRANT SELECT ON event_photos_pet TO authenticated;