-- =============================================
-- SCRIPT: Verificar função get_pets_without_bath_n8n no banco
-- Descrição: Queries para verificar se a função existe e extrair seu código
-- Data: 2024
-- =============================================

-- =============================================
-- 1. VERIFICAR SE A FUNÇÃO get_pets_without_bath_n8n EXISTE
-- =============================================

-- Esta query verifica se a função específica existe no banco
SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    p.prosrc as source_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_pets_without_bath_n8n'
AND n.nspname = 'public';

-- =============================================
-- 2. LISTAR TODAS AS FUNÇÕES QUE CONTÊM "pets" OU "bath" NO NOME
-- =============================================

-- Esta query lista funções relacionadas a pets ou banho
SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE (p.proname ILIKE '%pets%' OR p.proname ILIKE '%bath%')
AND n.nspname = 'public'
ORDER BY p.proname;

-- =============================================
-- 3. LISTAR TODAS AS FUNÇÕES QUE TERMINAM COM "_n8n"
-- =============================================

-- Esta query lista todas as funções criadas para integração com n8n
SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname ILIKE '%_n8n'
AND n.nspname = 'public'
ORDER BY p.proname;

-- =============================================
-- 4. EXTRAIR O CÓDIGO COMPLETO DA FUNÇÃO (SE EXISTIR)
-- =============================================

-- Esta query reconstrói o código completo da função para backup/análise
SELECT 
    'CREATE OR REPLACE FUNCTION ' || p.proname || '(' || 
    COALESCE(pg_get_function_arguments(p.oid), '') || ') ' ||
    'RETURNS ' || pg_get_function_result(p.oid) || ' AS $$ ' ||
    p.prosrc || ' $$ LANGUAGE ' || l.lanname || ';' as complete_function
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE p.proname = 'get_pets_without_bath_n8n'
AND n.nspname = 'public';

-- =============================================
-- 5. VERIFICAR PERMISSÕES DA FUNÇÃO
-- =============================================

-- Esta query verifica as permissões concedidas à função
SELECT 
    p.proname as function_name,
    p.proacl as permissions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_pets_without_bath_n8n'
AND n.nspname = 'public';

-- =============================================
-- 6. TESTAR A FUNÇÃO (SE EXISTIR)
-- =============================================

-- Descomente as linhas abaixo para testar a função:
/*
-- Testar execução da função
SELECT * FROM get_pets_without_bath_n8n();

-- Verificar quantos registros retorna
SELECT COUNT(*) as total_pets FROM get_pets_without_bath_n8n();
*/

-- =============================================
-- INSTRUÇÕES DE USO:
-- =============================================

/*
1. Execute as queries acima no SQL Editor do Supabase
2. A query #1 mostrará se a função existe e seu código fonte
3. A query #2 listará funções relacionadas a pets/banho
4. A query #3 listará todas as funções n8n
5. A query #4 reconstruirá o código completo da função
6. A query #5 mostrará as permissões da função
7. Descomente a seção #6 para testar a função

Se a função não existir, as queries retornarão resultados vazios.
Se existir, você verá o código fonte e poderá analisá-lo.
*/