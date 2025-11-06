-- =============================================
-- Migração: Criar wrapper de 1 argumento para conversão de banhos
-- Arquivo: criar-funcao-conversao-banhos.sql
-- Objetivo:
--  - Criar função public.create_journey_event_from_bath(bath_id UUID)
--    que delega para a versão de 2 argumentos com admin_id
--  - Realizar backfill para os 3 banhos aprovados da Maya sem evento
-- Pet: Maya (pet_id = 9174593e-8a6a-4827-b7c1-e067603a3c4e)
-- =============================================

-- Garantir tipo de evento "Banho e Tosa" existe
INSERT INTO event_types_pet (name, description)
VALUES ('Banho e Tosa', 'Serviços de higiene e estética')
ON CONFLICT (name) DO NOTHING;

-- Wrapper: 1 argumento (bath_id)
CREATE OR REPLACE FUNCTION create_journey_event_from_bath(
  bath_id UUID
) RETURNS UUID AS $$
DECLARE
  v_admin UUID;
  new_event_id UUID;
BEGIN
  -- Selecionar admin ativo para fallback
  SELECT user_id INTO v_admin FROM admin_users_pet WHERE is_active = true LIMIT 1;
  IF v_admin IS NULL THEN
    RAISE EXCEPTION 'Nenhum admin ativo encontrado para fallback';
  END IF;

  -- Delegar para a função de 2 argumentos
  SELECT create_journey_event_from_bath(bath_id, v_admin) INTO new_event_id;

  RETURN new_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissão para execução
GRANT EXECUTE ON FUNCTION create_journey_event_from_bath(UUID) TO authenticated;

-- =============================================
-- Backfill: Criar eventos para 3 banhos aprovados da Maya sem evento
-- =============================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT id AS bath_id
    FROM weekly_baths
    WHERE pet_id = '9174593e-8a6a-4827-b7c1-e067603a3c4e'
      AND approved = true
      AND COALESCE(add_to_journey, false) = true
      AND journey_event_id IS NULL
    ORDER BY bath_date DESC
    LIMIT 3
  LOOP
    BEGIN
      PERFORM create_journey_event_from_bath(r.bath_id);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Backfill falhou para banho %: %', r.bath_id