-- =============================================
-- MIGRAÇÃO: Usar curator_notes dos banhos como descrição do evento
-- e backfill de eventos existentes criados a partir dos banhos
-- =============================================

-- Recriar função para criar evento na jornada usando descrição personalizada
CREATE OR REPLACE FUNCTION public.create_journey_event_from_bath(
  bath_id UUID,
  admin_id UUID
) RETURNS UUID AS $$
DECLARE
  bath_record public.weekly_baths%ROWTYPE;
  event_type_id UUID;
  new_event_id UUID;
  owner_id UUID;
  v_description TEXT;
BEGIN
  -- Buscar dados do banho
  SELECT * INTO bath_record FROM public.weekly_baths WHERE id = bath_id;
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
  SELECT owner_id INTO owner_id FROM public.pets_pet WHERE id = bath_record.pet_id;
  IF owner_id IS NULL THEN
    owner_id := admin_id; -- Fallback para admin
  END IF;

  -- Buscar tipo de evento "Banho e Tosa"
  SELECT id INTO event_type_id 
  FROM public.event_types_pet 
  WHERE name = 'Banho e Tosa' 
  LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tipo de evento "Banho e Tosa" não encontrado';
  END IF;

  -- Descrição: usar curator_notes quando presente, senão mensagem padrão
  v_description := COALESCE(NULLIF(TRIM(bath_record.curator_notes), ''), 'Evento criado automaticamente a partir dos banhos semanais.');

  INSERT INTO public.pet_events_pet (
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
    v_description,
    bath_record.bath_date,
    NULL,
    false,
    '{}'::jsonb,
    bath_id
  ) RETURNING id INTO new_event_id;

  -- Criar foto do evento se houver caminho de storage
  IF bath_record.image_path IS NOT NULL THEN
    INSERT INTO public.event_photos_pet (
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
  UPDATE public.weekly_baths 
  SET journey_event_id = new_event_id 
  WHERE id = bath_id;

  RETURN new_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_journey_event_from_bath(UUID, UUID) TO authenticated;

-- =============================================
-- Backfill: atualizar descrição dos eventos já criados a partir dos banhos
-- quando houver curator_notes preenchido no banho de origem
-- =============================================
UPDATE public.pet_events_pet e
SET description = wb.curator_notes
FROM public.weekly_baths wb
WHERE e.weekly_bath_source_id = wb.id
  AND wb.curator_notes IS NOT NULL
  AND TRIM(wb.curator_notes) <> ''
  AND (e.description IS NULL OR e.description = 'Evento criado automaticamente a partir dos ban