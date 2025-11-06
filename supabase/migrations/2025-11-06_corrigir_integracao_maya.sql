-- =============================================
-- MIGRAÇÃO: Corrigir integração da Maya criando eventos faltantes
-- Data: 2025-11-06
-- Descrição: Cria eventos "Banho e Tosa" na Jornada para banhos aprovados
--            com add_to_journey=true e sem journey_event_id
-- =============================================

-- 0) Conferir candidatos (banhos da Maya aprovados, add_to_journey=true, sem journey_event_id)
WITH maya AS (
  SELECT p.id AS pet_id FROM public.pets_pet p WHERE p.name ILIKE 'Maya%'
)
SELECT 
  'CANDIDATOS' AS secao,
  wb.id AS bath_id,
  wb.pet_id,
  wb.pet_name,
  wb.bath_date,
  wb.week_start,
  wb.approved,
  wb.add_to_journey,
  wb.journey_event_id,
  wb.image_path
FROM public.weekly_baths wb
WHERE wb.pet_id IN (SELECT pet_id FROM maya)
  AND wb.approved = true
  AND COALESCE(wb.add_to_journey, false) = true
  AND wb.journey_event_id IS NULL
ORDER BY wb.bath_date DESC;

-- 1) Criar eventos na jornada para cada banho candidato
DO $$
DECLARE
  admin_uuid UUID := '00000000-0000-0000-0000-000000000000';
  rec RECORD;
  new_event UUID;
BEGIN
  FOR rec IN (
    SELECT wb.id AS bath_id
    FROM public.weekly_baths wb
    JOIN public.pets_pet p ON p.id = wb.pet_id
    WHERE p.name ILIKE 'Maya%'
      AND wb.approved = true
      AND COALESCE(wb.add_to_journey, false) = true
      AND wb.journey_event_id IS NULL
  ) LOOP
    BEGIN
      new_event := public.create_journey_event_from_bath(rec.bath_id, admin_uuid);
      RAISE NOTICE '✅ Evento criado: bath_id=%, event_id=%', rec.bath_id, new_event;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ Erro ao criar evento para bath_id=%: %', rec.bath_id, SQLERRM;
    END;
  END LOOP;
END $$;

-- 2) Verificação pós-processo: eventos "Banho e Tosa" da Maya
WITH maya AS (
  SELECT p.id AS pet_id FROM public.pets_pet p WHERE p.name ILIKE 'Maya%'
)
SELECT 
  'EVENTOS_APOS_CORRECAO' AS secao,
  e.id AS event_id,
  e.pet_id,
  e.title,
  e.event_date,
  e.weekly_bath_source_id
FROM public.pet_events_pet e
JOIN public.event_types_pet et ON et.id = e.event_type_id
WHERE e.pet_id IN (SELECT pet_id FROM maya)
  AND et.name = 'Banho e Tosa'
ORDER BY e.event_date DESC;