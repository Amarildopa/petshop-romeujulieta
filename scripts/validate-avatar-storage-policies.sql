-- Script de Validação das Políticas de RLS do Bucket 'avatars'
-- Execute este script no SQL Editor do Supabase para verificar se as políticas estão configuradas corretamente

-- ========================================
-- 1. VERIFICAR SE O BUCKET 'avatars' EXISTE
-- ========================================
SELECT 
    'BUCKET VALIDATION' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') 
        THEN '✅ Bucket "avatars" existe'
        ELSE '❌ Bucket "avatars" NÃO existe - Execute setup-avatar-storage-policies.sql primeiro'
    END as status;

-- ========================================
-- 2. LISTAR CONFIGURAÇÃO DO BUCKET
-- ========================================
SELECT 
    'BUCKET CONFIG' as check_type,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'avatars';

-- ========================================
-- 3. VERIFICAR POLÍTICAS DE RLS EXISTENTES
-- ========================================
SELECT 
    'RLS POLICIES' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND (policyname ILIKE '%avatar%' OR qual ILIKE '%avatars%' OR with_check ILIKE '%avatars%')
ORDER BY cmd, policyname;

-- ========================================
-- 4. VERIFICAR SE AS 4 POLÍTICAS PRINCIPAIS EXISTEM
-- ========================================
WITH expected_policies AS (
    SELECT 'INSERT' as operation, 'Authenticated users can upload avatars' as policy_name
    UNION ALL
    SELECT 'SELECT' as operation, 'Public avatar access' as policy_name
    UNION ALL
    SELECT 'UPDATE' as operation, 'Users can update own avatars' as policy_name
    UNION ALL
    SELECT 'DELETE' as operation, 'Users can delete own avatars' as policy_name
),
existing_policies AS (
    SELECT 
        cmd as operation,
        policyname as policy_name
    FROM pg_policies 
    WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND (policyname ILIKE '%avatar%' OR qual ILIKE '%avatars%' OR with_check ILIKE '%avatars%')
)
SELECT 
    'POLICY CHECK' as check_type,
    ep.operation,
    ep.policy_name as expected_policy,
    CASE 
        WHEN ex.policy_name IS NOT NULL THEN '✅ Existe'
        ELSE '❌ Não encontrada'
    END as status
FROM expected_policies ep
LEFT JOIN existing_policies ex ON ep.policy_name = ex.policy_name
ORDER BY ep.operation;

-- ========================================
-- 5. VERIFICAR RLS HABILITADO NA TABELA
-- ========================================
SELECT 
    'RLS STATUS' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS habilitado'
        ELSE '❌ RLS desabilitado - Execute: ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;'
    END as status
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- ========================================
-- 6. RESUMO GERAL DA VALIDAÇÃO
-- ========================================
WITH validation_summary AS (
    SELECT 
        CASE 
            WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') 
            THEN 1 ELSE 0 
        END as bucket_exists,
        
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM pg_policies 
                WHERE tablename = 'objects' 
                    AND schemaname = 'storage'
                    AND policyname = 'Authenticated users can upload avatars'
            ) THEN 1 ELSE 0 
        END as insert_policy_exists,
        
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM pg_policies 
                WHERE tablename = 'objects' 
                    AND schemaname = 'storage'
                    AND policyname = 'Public avatar access'
            ) THEN 1 ELSE 0 
        END as select_policy_exists,
        
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM pg_policies 
                WHERE tablename = 'objects' 
                    AND schemaname = 'storage'
                    AND policyname = 'Users can update own avatars'
            ) THEN 1 ELSE 0 
        END as update_policy_exists,
        
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM pg_policies 
                WHERE tablename = 'objects' 
                    AND schemaname = 'storage'
                    AND policyname = 'Users can delete own avatars'
            ) THEN 1 ELSE 0 
        END as delete_policy_exists,
        
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM pg_tables 
                WHERE schemaname = 'storage' 
                    AND tablename = 'objects' 
                    AND rowsecurity = true
            ) THEN 1 ELSE 0 
        END as rls_enabled
)
SELECT 
    'VALIDATION SUMMARY' as check_type,
    bucket_exists + insert_policy_exists + select_policy_exists + 
    update_policy_exists + delete_policy_exists + rls_enabled as score_total,
    '6' as score_max,
    CASE 
        WHEN (bucket_exists + insert_policy_exists + select_policy_exists + 
              update_policy_exists + delete_policy_exists + rls_enabled) = 6 
        THEN '✅ TODAS AS CONFIGURAÇÕES ESTÃO CORRETAS - Upload de avatares deve funcionar!'
        ELSE '❌ ALGUMAS CONFIGURAÇÕES ESTÃO FALTANDO - Verifique os itens acima e execute setup-avatar-storage-policies.sql se necessário'
    END as overall_status
FROM validation_summary;

-- ========================================
-- 7. COMANDOS DE TESTE (OPCIONAL)
-- ========================================
-- Para testar se as políticas estão funcionando, você pode executar:
-- (Substitua 'test-file.jpg' por um nome de arquivo real)

/*
-- Teste 1: Verificar se usuário autenticado pode fazer upload (simulação)
SELECT 
    'TEST UPLOAD PERMISSION' as test_type,
    CASE 
        WHEN auth.role() = 'authenticated' 
        THEN '✅ Usuário autenticado - Upload permitido'
        ELSE '❌ Usuário não autenticado - Upload negado'
    END as result;

-- Teste 2: Verificar acesso público de leitura
SELECT 
    'TEST PUBLIC READ' as test_type,
    COUNT(*) as avatar_files_count
FROM storage.objects 
WHERE bucket_id = 'avatars';
*/

-- ========================================
-- INSTRUÇÕES DE USO:
-- ========================================
-- 1. Execute este script completo no SQL Editor do Supabase
-- 2. Analise os resultados de cada seção
-- 3. Se algum item mostrar ❌, execute o script setup-avatar-storage-policies.sql
-- 4. Execute este script novamente para confirmar que tudo está funcionando
-- 5. Teste o upload de avatar na aplicação

-- ========================================
-- TROUBLESHOOTING:
-- ========================================
-- Se ainda houver problemas após aplicar as políticas:
-- 1. Verifique se o usuário está autenticado na aplicação
-- 2. Confirme se o token JWT está sendo enviado corretamente
-- 3. Verifique os logs do Supabase para erros específicos
-- 4. Teste com um arquivo de imagem válido (JPG, PNG, WebP)
-- 5. Confirme se o arquivo não excede o limite de tamanho do bucket