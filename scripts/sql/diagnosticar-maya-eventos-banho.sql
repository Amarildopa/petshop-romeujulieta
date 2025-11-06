-- =============================================
-- Diagnóstico: Eventos e Banhos (Maya - pet_id correto)
-- Arquivo: diagnosticar-maya-eventos-banho.sql
-- Objetivo:
--  1) Identificar o tipo do(s) evento(s) da Maya
--  2) Listar banhos aprovados e marcados para jornada sem evento
--  3) Verificar se o tipo de evento "Banho e Tosa" existe
--  4) Resumo com contagens úteis
-- =============================================

-- pet_id correto da Maya
-- 9174593e-8a6a-4827-b7c1-e067603a3c4e

WITH maya AS (
  SELECT '9174593e-8a6a-4827-b7c1-e067603a3c4e'::uuid AS pet_id
)

-- 1) Tipo de evento do(s) evento(s) da Maya
SELECT 
  'EVENTOS_MAYA_TIPO' AS secao,
  e.id,
  e.pet_id,
  et.name       AS tipo_evento,
  e.title,
  e.event_date,
  e.weekly_bath_source_id
FROM public.pet_events_pet e
JOIN public.event_types_pet et ON et.id = e.event_type_id
WHERE e.pet_id = (SELECT pet_id FROM maya)
ORDER BY e.event_date DESC;

-- 2) Banhos aprovados e marcados para jornada sem evento
SELECT 
  'BANHOS_APROVADOS_PENDENTES' AS secao,
  wb.id,
  wb.bath_date,
  wb.week_start,
  wb.approved,
  wb.add_to_journey,
  wb.journey_event_id,
  wb.image_path
FROM public.weekly_baths wb
WHERE wb.pet_id = (SELECT pet_id FROM maya)
  AND wb.approved = true
  AND COALESCE(wb.add_to_journey, false) = true
  AND wb.journey_event_id IS NULL
ORDER BY wb.bath_date DESC;

-- 3) Verificar existência do tipo de evento "Banho e Tosa"
SELECT 
  'TIPO_BANHO_TOSA_EXISTE' AS secao,
  et.id,
  et.name
FROM public.event_types_pet et
WHERE et.name = 'Banho e Tosa';

-- 4) Resumo rápido (contagens)
WITH maya AS (
  SELECT '9174593e-8a6a-4827-b7c1-e067603a3c4e'::uuid AS pet_id
)
SELECT 
  'RESUMO' AS secao,
  (SELECT COUNT(*) FROM public.pet_events_pet e WHERE e.pet_id = (SELECT pet_id FROM maya)) AS total_eventos,
  (SELECT COUNT(*) FROM public.pet_events_pet e WHERE e.pet_id = (SELECT pet_id FROM maya) AND e.weekly_bath_source_id IS NOT NULL) AS eventos_com_badge_banho,
  (SELECT COUNT(*) FROM public.pet_events_pet e JOIN public.event_types_pet et ON et.id = e.event_type_id WHERE e.pet_id = (SELECT pet_id FROM maya) AND et.name = 'Banho e Tosa') AS eventos_tipo_banho_tosa,
  (SELECT COUNT(*) FROM public.pet_events_pet e JOIN public.event_types_pet et ON et.id = e.event_type_id WHERE e.pet_id = (SELECT pet_id FROM maya) AND et.name = 'Banho e Tosa' AND e.weekly_bath_source_id IS NOT NULL) AS eventos_banho_tosa_com_badge,
  (SELECT COUNT(*) FROM public.pet_events_pet e JOIN public.event_types_pet et ON et.id = e.event_type_id WHERE e.pet_id = (SELECT pet_id FROM maya) AND et.name = 'Banho e Tosa' AND e.weekly_bath_source_id IS NULL) AS banho_tosa_sem_vinculo;