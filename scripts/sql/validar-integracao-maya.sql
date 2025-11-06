-- =============================================
-- Validação Final: Integração dos Banhos da Maya com a Jornada
-- Arquivo: validar-integracao-maya.sql
-- Objetivo:
--  1) Listar todos os banhos da Maya com detalhes
--  2) Listar todos os eventos de "Banho e Tosa" da Maya
--  3) Verificar se todos os banhos aprovados e marcados têm journey_event_id
--  4) Confirmar que existem exatamente 3 eventos "Banho e Tosa" da Maya
--  5) Mostrar o resumo final da integração
-- Pet: Maya (pet_id identificado nas queries anteriores)
-- =============================================

-- pet_id correto da Maya
WITH maya AS (
  SELECT '9174593e-8a6a-4827-b7c1-e067603a3c4e'::uuid AS pet_id
)

-- =============================================
-- 1) Banhos da Maya (todos)
-- =============================================
SELECT 
  'BANHOS_MAYA' AS secao,
  wb.id,
  wb.pet_id,
  wb.pet_name,
  wb.bath_date,
  wb.week_start,
  wb.approved,
  COALESCE(wb.add_to_journey, false) AS add_to_journey,
  wb.journey_event_id,
  wb.image_url,
  wb.image_path,
  wb.curator_notes,
  wb.created_at,
  wb.updated_at
FROM public.weekly_baths wb
WHERE wb.pet_id = (SELECT pet_id FROM maya)
ORDER BY wb.bath_date DESC;

-- =============================================
-- 2) Eventos de Jornada da Maya (apenas tipo "Banho e Tosa")
--    Inclui vínculo de origem: weekly_bath_source_id
-- =============================================
SELECT 
  'EVENTOS_MAYA' AS secao,
  e.id,
  e.pet_id,
  e.user_id,
  et.name       AS tipo_evento,
  e.title,
  e.description,
  e.event_date,
  e.weekly_bath_source_id,
  e.created_at,
  e.updated_at
FROM public.pet_events_pet e
JOIN public.event_types_pet et ON et.id = e.event_type_id
WHERE e.pet_id = (SELECT pet_id FROM maya)
  AND et.name = 'Banho e Tosa'
ORDER BY e.event_date DESC;

-- =============================================
-- 3) Banhos aprovados e marcados para jornada sem evento
--    Se esta consulta retornar linhas, há pendências a resolver
-- =============================================
SELECT 
  'BANHOS_APROVADOS_SEM_EVENTO' AS secao,
  wb.id,
  wb.bath_date,
  wb.week_start,
  wb.approved,
  COALESCE(wb.add_to_journey, false) AS add_to_journey,
  wb.journey_event_id,
  wb.image_path
FROM public.weekly_baths wb
WHERE wb.pet_id = (SELECT pet_id FROM maya)
  AND wb.approved = true
  AND COALESCE(wb.add_to_journey, false) = true
  AND wb.journey_event_id IS NULL
ORDER BY wb.bath_date DESC;

-- =============================================
-- 4) Confirmação: exatamente 3 eventos "Banho e Tosa" da Maya
-- =============================================
WITH eventos AS (
  SELECT e.*
  FROM public.pet_events_pet e
  JOIN public.event_types_pet et ON et.id = e.event_type_id
  WHERE e.pet_id = (SELECT pet_id FROM maya)
    AND et.name = 'Banho e Tosa'
)
SELECT 
  'CONFIRMACAO_EVENTOS' AS secao,
  (SELECT COUNT(*) FROM eventos) AS total_eventos_banho_tosa,
  ((SELECT COUNT(*) FROM eventos) = 3) AS total_exatamente_tres;

-- =============================================
-- 5) Resumo final da integração
-- =============================================
WITH banhos AS (
  SELECT wb.* FROM public.weekly_baths wb WHERE wb.pet_id = (SELECT pet_id FROM maya)
),
banhos_aprovados AS (
  SELECT wb.* FROM public.weekly_baths wb 
  WHERE wb.pet_id = (SELECT pet_id FROM maya)
    AND wb.approved = true
    AND COALESCE(wb.add_to_journey, false) = true
),
eventos AS (
  SELECT e.*
  FROM public.pet_events_pet e
  JOIN public.event_types_pet et ON et.id = e.event_type_id
  WHERE e.pet_id = (SELECT pet_id FROM maya)
    AND et.name = 'Banho e Tosa'
)
SELECT 
  'RESUMO_COMPLETO' AS secao,
  (SELECT COUNT(*) FROM banhos) AS total_banhos,
  (SELECT COUNT(*) FROM banhos_aprovados) AS banhos_aprovados_marcados,
  (SELECT COUNT(*) FROM banhos_aprovados WHERE journey_event_id IS NULL) AS banhos_aprovados_sem_evento,
  (SELECT COUNT(*) FROM eventos) AS eventos_banho_tosa;