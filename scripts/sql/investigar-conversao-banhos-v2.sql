-- =============================================
-- Investigação v2: Conversão de Banhos em Eventos de Jornada (Maya)
-- Arquivo: investigar-conversao-banhos-v2.sql
-- Objetivo: Diagnosticar por que banhos aprovados e marcados para jornada não viram eventos
-- Pet: Maya (pet_id = 9174593e-8a6a-4827-b7c1-e067603a3c4e)
-- Remoção: Consulta à tabela inexistente public.event_logs
-- Inclusão: Teste manual da função com bath_id específico
-- =============================================

-- 0) Contexto da Maya
SELECT 'DADOS_MAYA' AS secao, p.id AS pet_id, p.name AS pet_name, p.owner_id
FROM public.pets_pet p
WHERE p.id = '9174593e-8a6a-4827-b7c1-e067603a3c4e';

-- 1) Verificar função create_journey_event_from_bath
SELECT 'FUNCAO_EXISTE' AS secao,
       p.proname AS function_name,
       pg_get_functiondef(p.oid) AS function_def
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'create_journey_event_from_bath';

-- 1.1) Verificar existência do tipo de evento "Banho e Tosa"
SELECT 'TIPO_EVENTO_BANHO_E_TOSA' AS secao,
       et.id, et.name
FROM public.event_types_pet et
WHERE et.name = 'Banho e Tosa';

-- 2) Listar banhos aprovados e marcados para jornada, sem evento
SELECT 'BANHOS_APROVADOS_SEM_EVENTO' AS secao,
       wb.id AS bath_id,
       wb.pet_id,
       wb.pet_name,
       wb.bath_date,
       wb.approved,
       COALESCE(wb.add_to_journey, false) AS add_to_journey,
       wb.journey_event_id,
       wb.created_at,
       wb.updated_at
FROM public.weekly_baths wb
WHERE wb.pet_id = '9174593e-8a6a-4827-b7c1-e067603a3c4e'
  AND wb.approved = true
  AND COALESCE(wb.add_to_journey, false) = true
  AND wb.journey_event_id IS NULL
ORDER BY wb.bath_date DESC;

-- 2.1) Escolher um banho para teste manual (exibe 1 candidato)
SELECT 'BANHO_EXEMPLO_PARA_TESTE' AS secao,
       wb.id AS bath_id,
       wb.bath_date
FROM public.weekly_baths wb
WHERE wb.pet_id = '9174593e-8a6a-4827-b7c1-e067603a3c4e'
  AND wb.approved = true
  AND COALESCE(wb.add_to_journey, false) = true
  AND wb.journey_event_id IS NULL
ORDER BY wb.bath_date DESC
LIMIT 1;

-- 2.2) TESTE MANUAL (função requer 2 argumentos: bath_id, admin_id)
-- Atenção: executar somente quando desejar criar o evento!
-- Primeiro, pegue um admin válido para fallback:
-- SELECT user_id FROM public.admin_users_pet WHERE is_active = true LIMIT 1;
-- Exemplo de comando (substitua pelo admin_id real):
-- SELECT public.create_journey_event_from_bath('57a05622-a238-4226-bde7-5e2a97c377fe', '00000000-0000-0000-0000-000000000000') AS novo_evento_id;
-- Depois, verifique o vínculo:
-- SELECT e.id, e.event_date, et.name AS event_type, e.weekly_bath_source_id
-- FROM public.pet_events_pet e
-- JOIN public.event_types_pet et ON et.id = e.event_type_id
-- WHERE e.weekly_bath_source_id = '57a05622-a238-4226-bde7-5e2a97c377fe';
-- SELECT journey_event_id FROM public.weekly_baths WHERE id = '57a05622-a238-4226-bde7-5e2a97c377fe';

-- 3) Verificar triggers/procedures que deveriam fazer a conversão automática
-- 3.1) Triggers na tabela weekly_baths
SELECT 'TRIGGERS_WEEKLY_BATHS' AS secao,
       tg.tgname AS trigger_name,
       tg.tgenabled AS enabled,
       pg_get_triggerdef(tg.oid) AS trigger_def,
       p.proname AS function_name
FROM pg_trigger tg
JOIN pg_class c ON c.oid = tg.tgrelid AND c.relname = 'weekly_baths'
LEFT JOIN pg_proc p ON p.oid = tg.tgfoid
WHERE NOT tg.tgisinternal
ORDER BY tg.tgname;

-- 3.2) Triggers na tabela pet_events_pet
SELECT 'TRIGGERS_PET_EVENTS' AS secao,
       tg.tgname AS trigger_name,
       tg.tgenabled AS enabled,
       pg_get_triggerdef(tg.oid) AS trigger_def,
       p.proname AS function_name
FROM pg_trigger tg
JOIN pg_class c ON c.oid = tg.tgrelid AND c.relname = 'pet_events_pet'
LEFT JOIN pg_proc p ON p.oid = tg.tgfoid
WHERE NOT tg.tgisinternal
ORDER BY tg.tgname;

-- 3.3) Procurar procedures ou funções relacionadas
SELECT 'FUNCOES_RELACIONADAS' AS secao,
       p.proname AS function_name,
       n.nspname AS schema_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname ILIKE '%journey%'
   OR p.proname ILIKE '%weekly%'
   OR p.proname ILIKE '%bath%'
ORDER BY p.proname;

-- 4) Resumo
WITH banhos AS (
  SELECT wb.*
  FROM public.weekly_baths wb
  WHERE wb.pet_id = '9174593e-8a6a-4827-b7c1-e067603a3c4e'
),
banhos_aprovados AS (
  SELECT * FROM banhos WHERE approved = true AND COALESCE(add_to_journey, false) = true
),
eventos AS (
  SELECT e.*
  FROM public.pet_events_pet e
  JOIN public.event_types_pet et ON et.id = e.event_type_id
  WHERE e.pet_id = '9174593e-8a6a-4827-b7c1-e067603a3c4e'
    AND et.name = 'Banho e Tosa'
)
SELECT 'RESUMO' AS secao,
       (SELECT COUNT(*) FROM banhos) AS total_banhos,
       (SELECT COUNT(*) FROM banhos_aprovados) AS banhos_aprovados_marcados,
       (SELECT COUNT(*) FROM banhos_aprovados WHERE journey_event_id IS NULL) AS banhos_aprovados_sem_evento,
       (SELECT COUNT(*) FROM eventos) AS eventos_banho_tosa;