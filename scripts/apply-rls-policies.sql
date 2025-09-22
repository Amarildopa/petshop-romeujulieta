-- Script para corrigir as políticas RLS da tabela system_settings_pet
-- Execute este script no SQL Editor do painel do Supabase

-- 1. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Allow anonymous read public settings" ON system_settings_pet;
DROP POLICY IF EXISTS "Allow authenticated read all settings" ON system_settings_pet;
DROP POLICY IF EXISTS "Enable read access for all users" ON system_settings_pet;
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON system_settings_pet;

-- 2. Criar política para usuários anônimos lerem configurações públicas
CREATE POLICY "Allow anonymous read public settings"
ON system_settings_pet
FOR SELECT
TO anon
USING (is_public = true);

-- 3. Criar política para usuários autenticados lerem todas as configurações
CREATE POLICY "Allow authenticated read all settings"
ON system_settings_pet
FOR SELECT
TO authenticated
USING (true);

-- 4. Garantir que RLS está habilitado
ALTER TABLE system_settings_pet ENABLE ROW LEVEL SECURITY;

-- 5. Verificar as políticas criadas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'system_settings_pet'
ORDER BY policyname;