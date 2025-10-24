-- =============================================
-- SCRIPT: Verificação de Permissões - get_pets_without_bath_n8n
-- Descrição: Verifica se a função possui todas as permissões necessárias para execução pelo n8n
-- Criado para: Integração n8n com Supabase
-- Data: 2024
-- =============================================

-- =============================================
-- SEÇÃO 1: VERIFICAR SE A FUNÇÃO EXISTE
-- =============================================

SELECT 
  'VERIFICAÇÃO DA FUNÇÃO' as secao,
  'get_pets_without_bath_n8n' as funcao_nome,
  CASE 
    WHEN COUNT(*) > 0 THEN 'EXISTE ✓'
    ELSE 'NÃO EXISTE ✗'
  END as status,
  COUNT(*) as total_encontrado
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_pets_without_bath_n8n'
  AND n.nspname = 'public';

-- Detalhes da função se existir
SELECT 
  'DETALHES DA FUNÇÃO' as secao,
  p.proname as nome_funcao,
  n.nspname as schema_name,
  pg_get_function_result(p.oid) as tipo_retorno,
  pg_get_function_arguments(p.oid) as argumentos,
  l.lanname as linguagem,
  CASE p.provolatile
    WHEN 'i' THEN 'IMMUTABLE'
    WHEN 's' THEN 'STABLE'
    WHEN 'v' THEN 'VOLATILE'
  END as volatilidade,
  CASE p.prosecdef
    WHEN true THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE p.proname = 'get_pets_without_bath_n8n'
  AND n.nspname = 'public';

-- =============================================
-- SEÇÃO 2: VERIFICAR PERMISSÕES DA FUNÇÃO
-- =============================================

-- Permissões EXECUTE da função
SELECT 
  'PERMISSÕES EXECUTE DA FUNÇÃO' as secao,
  p.proname as funcao,
  COALESCE(acl.privilege_type, 'SEM PERMISSÕES ESPECÍFICAS') as tipo_permissao,
  COALESCE(acl.grantee, 'PUBLIC/DEFAULT') as usuario_role,
  COALESCE(acl.grantor, 'OWNER') as concedido_por,
  CASE 
    WHEN acl.is_grantable = 'YES' THEN 'SIM'
    ELSE 'NÃO'
  END as pode_conceder
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN (
  SELECT 
    r.routine_name,
    r.routine_schema,
    p.privilege_type,
    p.grantee,
    p.grantor,
    p.is_grantable
  FROM information_schema.routine_privileges p
  JOIN information_schema.routines r ON r.routine_name = p.routine_name 
    AND r.routine_schema = p.routine_schema
  WHERE r.routine_name = 'get_pets_without_bath_n8n'
) acl ON acl.routine_name = p.proname AND acl.routine_schema = n.nspname
WHERE p.proname = 'get_pets_without_bath_n8n'
  AND n.nspname = 'public';

-- =============================================
-- SEÇÃO 3: VERIFICAR PERMISSÕES ESPECÍFICAS PARA N8N
-- =============================================

-- Verificar se anon e authenticated têm permissão EXECUTE
SELECT 
  'PERMISSÕES N8N (anon/authenticated)' as secao,
  role_name,
  CASE 
    WHEN has_function_privilege(role_name, 'public.get_pets_without_bath_n8n()', 'EXECUTE') 
    THEN 'TEM PERMISSÃO ✓'
    ELSE 'SEM PERMISSÃO ✗'
  END as status_execute
FROM (
  SELECT 'anon' as role_name
  UNION ALL
  SELECT 'authenticated' as role_name
) roles;

-- =============================================
-- SEÇÃO 4: VERIFICAR TABELAS E SUAS PERMISSÕES
-- =============================================

-- Lista de tabelas usadas pela função
WITH tabelas_funcao AS (
  SELECT unnest(ARRAY[
    'pets_pet',
    'profiles_pet', 
    'communication_settings_pet',
    'appointments_pet',
    'services_pet',
    'campaign_recipients_pet',
    'marketing_campaigns_pet'
  ]) as tabela_nome
)
SELECT 
  'EXISTÊNCIA DAS TABELAS' as secao,
  tf.tabela_nome,
  CASE 
    WHEN t.table_name IS NOT NULL THEN 'EXISTE ✓'
    ELSE 'NÃO EXISTE ✗'
  END as status_tabela,
  COALESCE(t.table_type, 'N/A') as tipo_tabela
FROM tabelas_funcao tf
LEFT JOIN information_schema.tables t ON t.table_name = tf.tabela_nome 
  AND t.table_schema = 'public'
ORDER BY tf.tabela_nome;

-- Verificar permissões SELECT nas tabelas para anon e authenticated
WITH tabelas_funcao AS (
  SELECT unnest(ARRAY[
    'pets_pet',
    'profiles_pet', 
    'communication_settings_pet',
    'appointments_pet',
    'services_pet',
    'campaign_recipients_pet',
    'marketing_campaigns_pet'
  ]) as tabela_nome
),
roles_n8n AS (
  SELECT unnest(ARRAY['anon', 'authenticated']) as role_name
)
SELECT 
  'PERMISSÕES SELECT NAS TABELAS' as secao,
  tf.tabela_nome,
  rn.role_name,
  CASE 
    WHEN has_table_privilege(rn.role_name, 'public.' || tf.tabela_nome, 'SELECT') 
    THEN 'TEM SELECT ✓'
    ELSE 'SEM SELECT ✗'
  END as status_select
FROM tabelas_funcao tf
CROSS JOIN roles_n8n rn
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables t 
  WHERE t.table_name = tf.tabela_nome AND t.table_schema = 'public'
)
ORDER BY tf.tabela_nome, rn.role_name;

-- =============================================
-- SEÇÃO 5: VERIFICAR POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =============================================

-- Verificar se RLS está habilitado nas tabelas
WITH tabelas_funcao AS (
  SELECT unnest(ARRAY[
    'pets_pet',
    'profiles_pet', 
    'communication_settings_pet',
    'appointments_pet',
    'services_pet',
    'campaign_recipients_pet',
    'marketing_campaigns_pet'
  ]) as tabela_nome
)
SELECT 
  'STATUS RLS DAS TABELAS' as secao,
  tf.tabela_nome,
  CASE 
    WHEN c.relrowsecurity THEN 'RLS HABILITADO'
    ELSE 'RLS DESABILITADO'
  END as status_rls,
  CASE 
    WHEN c.relforcerowsecurity THEN 'FORÇADO PARA OWNER'
    ELSE 'NÃO FORÇADO'
  END as rls_forcado
FROM tabelas_funcao tf
LEFT JOIN pg_class c ON c.relname = tf.tabela_nome
LEFT JOIN pg_namespace n ON c.relnamespace = n.oid AND n.nspname = 'public'
WHERE c.relname IS NOT NULL
ORDER BY tf.tabela_nome;

-- Listar políticas RLS existentes nas tabelas
WITH tabelas_funcao AS (
  SELECT unnest(ARRAY[
    'pets_pet',
    'profiles_pet', 
    'communication_settings_pet',
    'appointments_pet',
    'services_pet',
    'campaign_recipients_pet',
    'marketing_campaigns_pet'
  ]) as tabela_nome
)
SELECT 
  'POLÍTICAS RLS EXISTENTES' as secao,
  tf.tabela_nome,
  pol.polname as nome_politica,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as comando,
  CASE pol.polpermissive
    WHEN true THEN 'PERMISSIVE'
    ELSE 'RESTRICTIVE'
  END as tipo_politica,
  array_to_string(pol.polroles::regrole[], ', ') as roles_aplicadas,
  pg_get_expr(pol.polqual, pol.polrelid) as condicao_using,
  pg_get_expr(pol.polwithcheck, pol.polrelid) as condicao_check
FROM tabelas_funcao tf
LEFT JOIN pg_class c ON c.relname = tf.tabela_nome
LEFT JOIN pg_namespace n ON c.relnamespace = n.oid AND n.nspname = 'public'
LEFT JOIN pg_policy pol ON pol.polrelid = c.oid
WHERE c.relname IS NOT NULL
ORDER BY tf.tabela_nome, pol.polname;

-- =============================================
-- SEÇÃO 6: TESTE DE EXECUÇÃO DA FUNÇÃO
-- =============================================

-- Teste básico de execução (comentado para segurança)
/*
-- DESCOMENTE PARA TESTAR A EXECUÇÃO:
SELECT 
  'TESTE DE EXECUÇÃO' as secao,
  'Executando get_pets_without_bath_n8n()...' as status;

SELECT * FROM get_pets_without_bath_n8n() LIMIT 5;
*/

-- =============================================
-- SEÇÃO 7: RESUMO E RECOMENDAÇÕES
-- =============================================

-- Resumo das verificações
SELECT 
  'RESUMO GERAL' as secao,
  'Função existe' as verificacao,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE p.proname = 'get_pets_without_bath_n8n' AND n.nspname = 'public'
    ) THEN 'OK ✓'
    ELSE 'PROBLEMA ✗'
  END as status

UNION ALL

SELECT 
  'RESUMO GERAL' as secao,
  'Permissão anon EXECUTE' as verificacao,
  CASE 
    WHEN has_function_privilege('anon', 'public.get_pets_without_bath_n8n()', 'EXECUTE') 
    THEN 'OK ✓'
    ELSE 'PROBLEMA ✗'
  END as status

UNION ALL

SELECT 
  'RESUMO GERAL' as secao,
  'Permissão authenticated EXECUTE' as verificacao,
  CASE 
    WHEN has_function_privilege('authenticated', 'public.get_pets_without_bath_n8n()', 'EXECUTE') 
    THEN 'OK ✓'
    ELSE 'PROBLEMA ✗'
  END as status;

-- =============================================
-- SEÇÃO 8: COMANDOS DE CORREÇÃO (SE NECESSÁRIO)
-- =============================================

/*
-- COMANDOS PARA CORRIGIR PERMISSÕES (EXECUTE APENAS SE NECESSÁRIO):

-- 1. Conceder permissão EXECUTE para anon e authenticated
GRANT EXECUTE ON FUNCTION public.get_pets_without_bath_n8n() TO anon, authenticated;

-- 2. Conceder permissões SELECT nas tabelas (se necessário)
GRANT SELECT ON public.pets_pet TO anon, authenticated;
GRANT SELECT ON public.profiles_pet TO anon, authenticated;
GRANT SELECT ON public.communication_settings_pet TO anon, authenticated;
GRANT SELECT ON public.appointments_pet TO anon, authenticated;
GRANT SELECT ON public.services_pet TO anon, authenticated;
GRANT SELECT ON public.campaign_recipients_pet TO anon, authenticated;
GRANT SELECT ON public.marketing_campaigns_pet TO anon, authenticated;

-- 3. Se houver problemas com RLS, pode ser necessário ajustar políticas
-- (Analise as políticas listadas acima antes de fazer alterações)

-- 4. Verificar se a função precisa ser SECURITY DEFINER
-- ALTER FUNCTION public.get_pets_without_bath_n8n() SECURITY DEFINER;
*/

-- =============================================
-- INSTRUÇÕES DE USO
-- =============================================

/*
COMO USAR ESTE SCRIPT:

1. Execute este script completo no Supabase SQL Editor
2. Analise os resultados de cada seção
3. Verifique se há problemas marcados com ✗
4. Se necessário, execute os comandos de correção da Seção 8
5. Execute novamente para confirmar as correções

INTERPRETAÇÃO DOS RESULTADOS:

- ✓ = OK, sem problemas
- ✗ = Problema encontrado, precisa correção
- Seção 1-2: Verifica se a função existe e suas permissões básicas
- Seção 3: Verifica permissões específicas para n8n (anon/authenticated)
- Seção 4: Verifica se todas as tabelas existem e têm permissões adequadas
- Seção 5: Verifica políticas RLS que podem bloquear a execução
- Seção 6: Teste opcional de execução
- Seção 7: Resumo geral do status
- Seção 8: Comandos para corrigir problemas encontrados

PARA N8N FUNCIONAR CORRETAMENTE:
- A função deve ter permissão EXECUTE para 'anon' ou 'authenticated'
- Todas as tabelas devem ter permissão SELECT para o mesmo role
- Políticas RLS não devem bloquear o acesso aos dados necessários
*/