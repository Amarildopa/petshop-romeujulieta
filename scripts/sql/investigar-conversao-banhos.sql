-- =============================================
-- Investigação da Conversão de Banhos em Eventos de Jornada (Maya)
-- Arquivo: investigar-conversao-banhos.sql
-- Objetivo: Diagnosticar por que banhos aprovados e marcados para jornada não viram eventos
-- Pet: Maya (pet_id = 9174593e-8a6a-4827-b7c1-e067603a3c4e)
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

-- 2.1) Escolher um banho para teste manual
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

-- TESTE MANUAL: execute substituindo <bath_id> pelo ID acima
-- SELECT public.create_journey_event_from_bath('<bath_id>') AS novo_evento_id;

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

-- 4) Teste manual: tentar criar evento para um banho específico
-- Observação: use com cuidado em ambiente de produção
-- Exemplo: SELECT public.create_journey_event_from_bath('<bath_id>');
-- Você pode copiar um bath_id retornado na seção 2 e rodar manualmente.

-- 5) Verificar logs ou tabelas de controle de erros
-- Caso exista tabela de logs (ex.: public.event_logs, public.error_logs), consultar por bath_id/pet_id
SELECT 'LOGS_EVENTOS' AS secao,
       l.*
FROM public.event_logs l
WHERE l.pet_id = '9174593e-8a6a-4827-b7c1-e067603a3c4e'
   OR l.details ILIKE '%9174593e-8a6a-4827-b7c1-e067603a3c4e%';

-- 6) Resumo
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