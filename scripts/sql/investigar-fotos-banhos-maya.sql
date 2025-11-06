-- =============================================
-- Investigação: Fotos dos Banhos da Maya na Jornada
-- Arquivo: investigar-fotos-banhos-maya.sql
-- Objetivo:
--  1) Verificar os image_path dos 3 banhos da Maya que viraram eventos
--  2) Comparar com os weekly_bath_source_id dos eventos para checar vínculo
--  3) Identificar diferenças entre o banho que tem foto (id conhecido) e os demais
--  4) Listar todos os banhos da Maya com seus image_path e estado de integração
-- Observação: focamos em eventos criados a partir de banhos (weekly_bath_source_id NOT NULL)
-- =============================================

-- Pet: Maya (pet_id)
WITH maya AS (
  SELECT '9174593e-8a6a-4827-b7c1-e067603a3c4e'::uuid AS pet_id
),
-- ID do banho que está exibindo foto na Jornada (informado)
banho_com_foto AS (
  SELECT '57a05622-a238-4226-bde7-5e2a97c377fe'::uuid AS bath_id
)

-- =============================================
-- 1) Banhos da Maya (todos), com campos relevantes para a jornada
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
-- 2) Eventos de Jornada da Maya criados a partir de banhos
--    Inclui fotos do evento (event_photos_pet)
-- =============================================
SELECT 
  'EVENTOS_DE_BANHO_MAYA' AS secao,
  e.id AS event_id,
  e.pet_id,
  et.name       AS tipo_evento,
  e.title,
  e.description,
  e.event_date,
  e.weekly_bath_source_id,
  e.created_at,
  e.updated_at,
  -- Status de fotos agregadas
  COUNT(ep.id) AS total_fotos,
  STRING_AGG(ep.file_path, '\n' ORDER BY ep.created_at) AS fotos_file_path
FROM public.pet_events_pet e
JOIN public.event_types_pet et ON et.id = e.event_type_id
LEFT JOIN public.event_photos_pet ep ON ep.pet_event_id = e.id
WHERE e.pet_id = (SELECT pet_id FROM maya)
  AND e.weekly_bath_source_id IS NOT NULL
GROUP BY e.id, e.pet_id, et.name, e.title, e.description, e.event_date, e.weekly_bath_source_id, e.created_at, e.updated_at
ORDER BY e.event_date DESC;

-- =============================================
-- 3) Mapeamento Banho -> Evento -> Fotos
--    Útil para ver rapidamente quais banhos têm evento e fotos
-- =============================================
SELECT 
  'MAPEAMENTO_BANHO_EVENTO_FOTOS' AS secao,
  wb.id                 AS weekly_bath_id,
  wb.bath_date,
  wb.approved,
  COALESCE(wb.add_to_journey, false) AS add_to_journey,
  wb.image_path        AS bath_image_path,
  e.id                 AS event_id,
  e.event_date,
  et.name              AS tipo_evento,
  e.title,
  COUNT(ep.id)         AS total_fotos_evento,
  STRING_AGG(ep.file_path, '\n' ORDER BY ep.created_at) AS fotos_evento_file_path
FROM public.weekly_baths wb
LEFT JOIN public.pet_events_pet e 
  ON e.weekly_bath_source_id = wb.id
LEFT JOIN public.event_types_pet et 
  ON et.id = e.event_type_id
LEFT JOIN public.event_photos_pet ep 
  ON ep.pet_event_id = e.id
WHERE wb.pet_id = (SELECT pet_id FROM maya)
GROUP BY wb.id, wb.bath_date, wb.approved, wb.add_to_journey, wb.image_path,
         e.id, e.event_date, et.name, e.title
ORDER BY wb.bath_date DESC;

-- =============================================
-- 4) Comparação: banho conhecido com foto vs. demais
--    Verifica presença de image_path e fotos vinculadas no evento
-- =============================================
WITH alvo AS (
  SELECT wb.* 
  FROM public.weekly_baths wb 
  WHERE wb.id = (SELECT bath_id FROM banho_com_foto)
),
outros AS (
  SELECT wb.* 
  FROM public.weekly_baths wb 
  WHERE wb.pet_id = (SELECT pet_id FROM maya)
    AND wb.id <> (SELECT bath_id FROM banho_com_foto)
)
SELECT 
  'COMPARACAO_BANHO_COM_FOTO' AS secao,
  a.id               AS weekly_bath_id,
  a.bath_date,
  a.image_path       AS bath_image_path,
  a.journey_event_id,
  e.id               AS event_id,
  COUNT(ep.id)       AS total_fotos_evento,
  STRING_AGG(ep.file_path, '\n' ORDER BY ep.created_at) AS fotos_evento_file_path
FROM alvo a
LEFT JOIN public.pet_events_pet e ON e.weekly_bath_source_id = a.id
LEFT JOIN public.event_photos_pet ep ON ep.pet_event_id = e.id
GROUP BY a.id, a.bath_date, a.image_path, a.journey_event_id, e.id
UNION ALL
SELECT 
  'COMPARACAO_OUTROS_BANHOS' AS secao,
  o.id               AS weekly_bath_id,
  o.bath_date,
  o.image_path       AS bath_image_path,
  o.journey_event_id,
  e.id               AS event_id,
  COUNT(ep.id)       AS total_fotos_evento,
  STRING_AGG(ep.file_path, '\n' ORDER BY ep.created_at) AS fotos_evento_file_path
FROM outros o
LEFT JOIN public.pet_events_pet e ON e.weekly_bath_source_id = o.id
LEFT JOIN public.event_photos_pet ep ON ep.pet_event_id = e.id
GROUP BY o.id, o.bath_date, o.image_path, o.journey_event_id, e.id
ORDER BY 2 DESC;

-- =============================================
-- 5) Resumos úteis
-- =============================================
-- 5.1) Quantos eventos de banho existem e quantos têm fotos
WITH eventos AS (
  SELECT e.*
  FROM public.pet_events_pet e
  WHERE e.pet_id = (SELECT pet_id FROM maya)
    AND e.weekly_bath_source_id IS NOT NULL
),
fotos AS (
  SELECT ep.pet_event_id, COUNT(*) AS total_fotos
  FROM public.event_photos_pet ep
  GROUP BY ep.pet_event_id
)
SELECT 
  'RESUMO_EVENTOS_FOTOS' AS secao,
  (SELECT COUNT(*) FROM eventos) AS total_eventos_banho,
  (SELECT COUNT(*) FROM eventos e LEFT JOIN fotos f ON f.pet_event_id = e.id WHERE COALESCE(f.total_fotos, 0) > 0) AS eventos_com_fotos,
  (SELECT COUNT(*) FROM eventos e LEFT JOIN fotos f ON f.pet_event_id = e.id WHERE COALESCE(f.total_fotos, 0) = 0) AS eventos_sem_fotos;

-- 5.2) Banhos aprovados e marcados para jornada, mas sem evento
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

-- 5.3) Verificação: exatamente 3 eventos de banho para Maya
WITH eventos_banho AS (
  SELECT e.*
  FROM public.pet_events_pet e
  WHERE e.pet_id = (SELECT pet_id FROM maya)
    AND e.weekly_bath_source_id IS NOT NULL
)
SELECT 
  'CONFIRMACAO_EVENTOS_BANHO' AS secao,
  (SELECT COUNT(*) FROM eventos_banho) AS total_eventos_banho,
  ((SELECT COUNT(*) FROM eventos_banho) = 3) AS total_exatamente_tres;