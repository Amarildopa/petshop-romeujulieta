-- =============================================
-- Verificar eventos da jornada da Maya
-- Objetivo: Listar todos os eventos da jornada da Maya,
-- incluindo tipo de evento, título, data e se possuem weekly_bath_source_id
-- =============================================

-- Pet fixo solicitado (Maya)
WITH maya AS (
  SELECT p.id AS pet_id
  FROM public.pets_pet p
  WHERE p.id = '06aaa80e-6fed-4fdb-aa5f-0dffd8760b4d'
)
SELECT 
  'EVENTOS_JORNADA_MAYA' AS secao,
  e.id,
  e.pet_id,
  e.user_id,
  e.created_by,
  et.name       AS tipo_evento,
  e.title,
  e.description,
  e.event_date,
  e.weekly_bath_source_id,
  (e.weekly_bath_source_id IS NOT NULL) AS tem_badge_banho_semanal,
  e.created_at,
  e.updated_at
FROM public.pet_events_pet e
JOIN public.event_types_pet et ON et.id = e.event_type_id
WHERE e.pet_id IN (SELECT pet_id FROM maya)
ORDER BY e.event_date DESC;