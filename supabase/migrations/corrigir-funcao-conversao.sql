-- =============================================
-- Migração: Corrigir função create_journey_event_from_bath (ambiguidade owner_id)
-- Arquivo: corrigir-funcao-conversao.sql
-- Objetivo:
--  - Remover ambiguidade de owner_id e qualificar colunas/tabelas
--  - Manter lógica: criar evento, atualizar banho, retornar ID
-- =============================================

-- Garantir tipo de evento "Banho e Tosa" existe
INSERT INTO public.event_types_pet (name, description, icon, color)
VALUES ('Banho e Tosa', 'Serviços de higiene e estética', 'bath', '#3B82F6')
ON CONFLICT (name) DO NOTHING;

-- Corrigir função principal (2 argumentos)
CREATE OR REPLACE FUNCTION public.create_journey_event_from_bath(
  bath_id UUID,
  admin_id UUID
) RETURNS UUID AS $$
DECLARE
  bath_record public.weekly_baths%ROWTYPE;
  v_event_type_id UUID;
  v_new_event_id UUID;
  v_owner_id UUID;
BEGIN
  -- Buscar dados do banho
  SELECT * INTO bath_record FROM public.weekly_baths wb WHERE wb.id = bath_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Banho não encontrado';
  END IF;

  -- Validar aprovação e vínculo
  IF bath_record.approved IS NOT TRUE THEN
    RAISE EXCEPTION 'Banho não aprovado';
  END IF;
  IF bath_record.pet_id IS NULL THEN
    RAISE EXCEPTION 'Banho sem pet vinculado';
  END IF;

  -- Evitar duplicidade
  IF bath_record.journey_event_id IS NOT NULL THEN
    RAISE EXCEPTION 'Já existe evento na jornada para este banho';
  END IF;

  -- Buscar tipo de evento "Banho e Tosa"
  SELECT et.id INTO v_event_type_id
  FROM public.event_types_pet et
  WHERE et.name = 'Banho e Tosa'
  LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tipo de evento "Banho e Tosa" não encontrado';
  END IF;

  -- Obter owner do pet (qualificado, sem ambiguidade)
  SELECT p.owner_id INTO v_owner_id FROM public.pets_pet p WHERE p.id = bath_record.pet_id;

  -- Criar evento na jornada
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
    COALESCE(v_owner_id, admin_id),
    v_event_type_id,
    'Banho Semanal - ' || bath_record.pet_name,
    'Evento criado automaticamente a partir dos banhos semanais.',
    bath_record.bath_date,
    NULL,
    false,
    '{}'::jsonb,
    bath_id
  ) RETURNING id INTO v_new_event_id;

  -- Criar foto do evento somente se houver caminho de storage
  IF bath_record.image_path IS NOT NULL THEN
    INSERT INTO public.event_photos_pet (
      event_id,
      user_id,
      file_path,
      file_name,
      caption,
      is_primary
    ) VALUES (
      v_new_event_id,
      COALESCE(v_owner_id, admin_id),
      bath_record.image_path,
      COALESCE(split_part(bath_record.image_path, '/', array_length(string_to_array(bath_record.image_path,'/'),1)), 'photo.jpg'),
      'Foto do banho semanal',
      true
    );
  END IF;

  -- Atualizar banho com referência ao evento
  UPDATE public.weekly_baths 
  SET journey_event_id = v_new_event_id 
  WHERE id = bath_id;

  RETURN v_new_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir permissão de execução
GRANT EXECUTE ON FUNCTION public.create_journey_event_from_bath(UUID, UUID) TO authenticated;

-- Instruções de teste (execute manualmente após a migração):
-- SELECT public.create_journey_event_from_bath('57a05622-a238-4226-bde7-5e2a97c377fe', '<admin_id>') AS novo_evento_id;
-- SELECT e.id, e.event_date, et.name, e.weekly_bath_source_id FROM public.pet_events_pet e JOIN public.event_types_pet et ON et.id = e.event_type_id WHERE e.weekly_bath_source_id = '57a05622-a238-4226-bde7-5e2a97c377fe';
-- SELECT journey_event_id FROM public.weekly_baths WHERE id = '57a05622-a238-4226-bde7-5e2a97c377fe';