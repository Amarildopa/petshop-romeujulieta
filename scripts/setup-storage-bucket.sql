-- Script para criar o bucket 'avatars' no Supabase Storage
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar o bucket 'avatars' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Configurar políticas RLS (Row Level Security) para o bucket
-- Permitir que usuários autenticados façam upload de suas próprias fotos
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários autenticados atualizem suas próprias fotos
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários autenticados deletem suas próprias fotos
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir leitura pública das fotos (já que o bucket é público)
CREATE POLICY "Public can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Verificar se o bucket foi criado corretamente
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Verificar as políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%avatar%';