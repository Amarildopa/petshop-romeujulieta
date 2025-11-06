-- =============================================
-- Verificar Funções/Procedures Existentes Relacionadas à Jornada e Banhos
-- Arquivo: verificar-funcoes-existentes.sql
-- Objetivo:
--  1) Listar TODAS as funções/procedures no schema public com palavras-chave
--  2) Identificar funções cujo código sugere conversão de banhos em eventos
--  3) Listar funções com "create" ou "insert" no nome
--  4) Checar se a função esperada existe e triggers relacionadas
--  5) Observação sobre migrações
-- =============================================

-- 1) Funções no schema public com palavras: journey, bath, weekly, event, pet
SELECT 
  'FUNCOES_PUBLIC_FILTER' AS secao,
  p.proname                 AS function_name,
  n.nspname                 AS schema_name,
  pg_get_function_identity_arguments(p.oid) AS args,
  pg_get_function_result(p.oid)             AS returns
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND (
    p.proname ILIKE '%journey%' OR 
    p.proname ILIKE '%bath%'    OR 
    p.proname ILIKE '%weekly%'  OR 
    p.proname ILIKE '%event%'   OR 
    p.proname ILIKE '%pet%'
  )
ORDER BY p.proname;

-- 2) Funções cuja definição indica possível conversão (referências a tabelas/colunas relevantes)
SELECT 
  'FUNCOES_DEF_POSSIVEIS_CONVERSOES' AS secao,
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_def
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND (
    pg_get_functiondef(p.oid) ILIKE '%weekly_baths%' OR
    pg_get_functiondef(p.oid) ILIKE '%pet_events_pet%' OR
    pg_get_functiondef(p.oid) ILIKE '%weekly_bath_source_id%' OR
    pg_get_functiondef(p.oid) ILIKE '%insert%pet_events_pet%'
  )
ORDER BY p.proname;

-- 3) Funções no schema public com "create" ou "insert" no nome
SELECT 
  'FUNCOES_CREATE_INSERT_NOME' AS secao,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS args
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND (
    p.proname ILIKE '%create%' OR 
    p.proname ILIKE '%insert%'
  )
ORDER BY p.proname;

-- 4) Checar se a função esperada existe
SELECT 
  'FUNCAO_ESPERADA_EXISTE' AS secao,
  (COUNT(*) > 0) AS existe
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'create_journey_event_from_bath';

-- 4.1) Triggers relacionadas (weekly_baths)
SELECT 'TRIGGERS_WEEKLY_BATHS' AS secao,
       tg.tgname        AS trigger_name,
       tg.tgenabled     AS enabled,
       pg_get_triggerdef(tg.oid) AS trigger_def,
       p.proname        AS function_name
FROM pg_trigger tg
JOIN pg_class c ON c.oid = tg.tgrelid AND c.relname = 'weekly_baths'
LEFT JOIN pg_proc p ON p.oid = tg.tgfoid
WHERE NOT tg.tgisinternal
ORDER BY tg.tgname;

-- 4.2) Triggers relacionadas (pet_events_pet)
SELECT 'TRIGGERS_PET_EVENTS' AS secao,
       tg.tgname        AS trigger_name,
       tg.tgenabled     AS enabled,
       pg_get_triggerdef(tg.oid) AS trigger_def,
       p.proname        AS function_name
FROM pg_trigger tg
JOIN pg_class c ON c.oid = tg.tgrelid AND c.relname = 'pet_events_pet'
LEFT JOIN pg_proc p ON p.oid = tg.tgfoid
WHERE NOT tg.tgisinternal
ORDER BY tg.tgname;

-- 5) Observação:
-- Migrations e scripts (arquivos .sql) não ficam registrados no banco por padrão.
-- Para confirmar se existe migration que deveria criar a função, revise os arquivos
-- em 'supabase/migrations' e 'scripts/sql' procurando por 'create_journey_event_from_b