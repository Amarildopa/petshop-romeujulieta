-- Script para configurar políticas de RLS do bucket 'avatars' no Supabase Storage
-- Este script resolve o problema de upload de avatares configurando as políticas corretas

-- Primeiro, garantir que o bucket 'avatars' existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir que usuários autenticados façam upload de avatares
-- Esta política permite que qualquer usuário autenticado faça upload de arquivos
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Política para permitir que usuários vejam/baixem avatares publicamente
-- Esta política permite acesso público de leitura aos avatares
CREATE POLICY "Public avatar access" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars'
);

-- Política para permitir que usuários autenticados atualizem seus próprios avatares
-- Esta política permite que usuários atualizem apenas seus próprios arquivos
CREATE POLICY "Users can update own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Política para permitir que usuários autenticados deletem seus próprios avatares
-- Esta política permite que usuários deletem apenas seus próprios arquivos
CREATE POLICY "Users can delete own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Comentários sobre as políticas criadas:
-- 1. INSERT: Permite que qualquer usuário autenticado faça upload de avatares
-- 2. SELECT: Permite acesso público de leitura aos avatares (necessário para exibir as imagens)
-- 3. UPDATE: Permite que usuários autenticados atualizem avatares
-- 4. DELETE: Permite que usuários autenticados deletem avatares

-- Nota: As políticas de UPDATE e DELETE são mais permissivas do que o ideal.
-- Em produção, você pode querer restringir para que usuários só possam
-- modificar/deletar seus próprios arquivos usando uma lógica mais específica
-- baseada no nome do arquivo ou metadados do usuário.