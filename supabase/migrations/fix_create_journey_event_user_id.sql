-- =============================================
-- MIGRAÇÃO: Corrigir create_journey_event_from_bath para setar user_id do dono
-- e realizar backfill de banhos aprovados com integração que não geraram eventos
-- =============================================

-- Recriar função com user_id do dono do pet e foto opcional
CREATE OR REPLACE FUNCTION create_journey_event_from_bath(
  bath_id UUID,
  admin_id UUID
) RETURNS UUID AS $$
DECLARE
  bath_record weekly_baths%ROWTYPE;
  event_type_id UUID;
  new_event_id UUID;
  owner_id UUID;
BEGIN
  -- Buscar dados do banho
  SELECT * INTO bath_record FROM weekly_baths WHERE id = bath_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Banho não encontrado';
  END IF;

  -- Validar vínculo com pet
  IF bath_record.pet_id IS NULL THEN
    RAISE EXCEPTION 'Banho sem pet vinculado';
  END IF;

  -- Evitar duplicidade
  IF bath_record.journey_event_id IS NOT NULL THEN
    RAISE EXCEPTION 'Já existe evento na jornada para este banho';
  END IF;

  -- Obter owner do pet
  SELECT owner_id INTO owner_id FROM pets_pet WHERE id = bath_record.pet_id;
  IF owner_id IS NULL THEN
    -- Fallback para admin (garante inserção)
    owner_id := admin_id;
  END IF;

  -- Buscar tipo de evento "Banho e Tosa"
  SELECT id INTO event_type_id 
  FROM event_types_pet 
  WHERE name = 'Banho e Tosa' 
  LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tipo de evento "Banho e Tosa" não encontrado';
  END IF;

  -- Criar evento na jornada (user_id = owner_id)
  INSERT INTO pet_events_pet (
    pet_id,
    user_id,
    event_type_id,
    title,
    description,
    event_date,
    location,
    is_milestone,
    metadata,
    weekly_bath_source_id
  ) VALUES (
    bath_record.pet_id,
    owner_id,
    event_type_id,
    'Banho e Tosa - ' || bath_record.pet_name,
    'Evento criado automaticamente a partir dos banhos semanais.',
    bath_record.bath_date,
    NULL,
    false,
    '{}'::jsonb,
    bath_id
  ) RETURNING id INTO new_event_id;

  -- Criar foto do evento somente se houver caminho de storage
  IF bath_record.image_path IS NOT NULL THEN
    INSERT INTO event_photos_pet (
      event_id,
      user_id,
      file_path,
      file_name,
      caption,
      is_primary
    ) VALUES (
      new_event_id,
      owner_id,
      bath_record.image_path,
      COALESCE(split_part(bath_record.image_path, '/', array_length(string_to_array(bath_record.image_path,'/'),1)), 'photo.jpg'),
      'Foto do banho semanal',
      true
    );
  END IF;

  -- Atualizar banho com referência ao evento
  UPDATE weekly_baths 
  SET journey_event_id = new_event_id 
  WHERE id = bath_id;

  RETURN new_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir permissão de execução
GRANT EXECUTE ON FUNCTION create_journey_event_from_bath(UUID, UUID) TO authenticated;

-- =============================================
-- BACKFILL: Criar eventos para banhos já aprovados e sinalizados para jornada
-- =============================================
DO $$
DECLARE
  v_admin UUID;
  r RECORD;
BEGIN
  -- Selecionar um admin ativo para fallback
  SELECT user_id INTO v_admin FROM admin_users_pet WHERE is_active = true LIMIT 1;

  FOR r IN 
    SELECT id AS bath_id 
    FROM weekly_baths 
    WHERE approved = true 
      AND add_to_journey = true 
      AND pet_id IS NOT NULL 
      AND journey_event_id IS NULL
  LOOP
    BEGIN
      PERFORM create_journey_event_from_bath(r.bath_id, v_admin);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Backfill falhou para banho %: %', r.bath_id, SQLERRM;
    END;
  END LOOP;
END $$;