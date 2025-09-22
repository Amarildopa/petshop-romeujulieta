-- Script para corrigir políticas RLS do bucket 'avatars'
-- Este script resolve o erro: "new row violates row-level security policy"

-- 1. Remover políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- 2. Criar políticas mais permissivas para uploads de pets
-- Permitir que usuários autenticados façam upload de imagens na pasta 'pets'
CREATE POLICY "Authenticated users can upload pet images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = 'pets'
);

-- Permitir que usuários autenticados atualizem suas próprias imagens de pets
CREATE POLICY "Users can update their pet images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = 'pets'
);

-- Permitir que usuários autenticados deletem suas próprias imagens de pets
CREATE POLICY "Users can delete their pet images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = 'pets'
);

-- Manter política de leitura pública (remover se existir e recriar)
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- 3. Verificar se as políticas foram criadas corretamente
SELECT 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%pet%' OR policyname LIKE '%avatar%'
ORDER BY policyname;

-- 4. Verificar se o bucket existe
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'avatars';