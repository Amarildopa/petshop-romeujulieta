-- =============================================
-- MIGRAÇÃO: Ajuste de image_path em weekly_baths e integração de fotos
-- Descrição: Adiciona coluna image_path, faz backfill a partir das URLs públicas
--             e atualiza a função create_journey_event_from_bath para usar file_path
-- =============================================

-- 1) Adicionar coluna image_path na tabela weekly_baths
ALTER TABLE public.weekly_baths
ADD COLUMN IF NOT EXISTS image_path TEXT;

-- 2) Backfill de image_path a partir de image_url pública
-- Formato típico da URL pública do Supabase:
-- https://<project>.supabase.co/storage/v1/object/public/pet-photos/<caminho>
UPDATE public.weekly_baths
SET image_path = split_part(image_url, '/object/public/pet-photos/', 2)
WHERE image_url LIKE '%/object/public/pet-photos/%'
  AND (image_path IS NULL OR image_path = '');

-- 3) Atualizar função create_journey_event_from_bath para usar image_path em event_photos_pet.file_path
CREATE OR REPLACE FUNCTION public.create_journey_event_from_bath(
  bath_id UUID,
  admin_id UUID
) RETURNS UUID AS $$
DECLARE
  bath_record public.weekly_baths%ROWTYPE;
  event_type_id UUID;
  new_event_id UUID;
  photo_path TEXT;
BEGIN
  -- Buscar dados do banho
  SELECT * INTO bath_record FROM public.weekly_baths WHERE id = bath_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Banho não encontrado';
  END IF;

  -- Verificar se já existe evento para este banho
  IF bath_record.journey_event_id IS NOT NULL THEN
    RAISE EXCEPTION 'Já existe evento na jornada para este banho';
  END IF;

  -- Buscar tipo de evento "Banho e Tosa"
  SELECT id INTO event_type_id 
  FROM public.event_types_pet 
  WHERE name = 'Banho e Tosa' 
  LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tipo de evento "Banho e Tosa" não encontrado';
  END IF;

  -- Criar evento na jornada
  INSERT INTO public.pet_events_pet (
    pet_id,
    event_type_id,
    title,
    description,
    event_date,
    weekly_bath_source_id,
    created_by
  ) VALUES (
    bath_record.pet_id,
    event_type_id,
    'Banho e Tosa - ' || bath_record.pet_name,
    'Evento criado automaticamente a partir dos banhos semanais.',
    bath_record.bath_date,
    bath_id,
    admin_id
  ) RETURNING id INTO new_event_id;

  -- Determinar o path da foto no storage
  -- Preferir image_path; se não existir, tentar extrair do image_url pública
  photo_path := COALESCE(
    bath_record.image_path,
    split_part(bath_record.image_url, '/object/public/pet-photos/', 2)
  );

  -- Criar foto do evento (file_path deve ser o caminho dentro do bucket)
  IF photo_path IS NOT NULL AND photo_path <> '' THEN
    INSERT INTO public.event_photos_pet (
      event_id,
      file_path,
      caption,
      is_primary
    ) VALUES (
      new_event_id,
      photo_path,
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