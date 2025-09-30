-- Script para criar o bucket 'pet-photos' no Supabase Storage
-- Este bucket será usado para armazenar fotos de eventos dos pets

-- 1. Criar o bucket 'pet-photos' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-photos',
  'pet-photos', 
  true,
  10485760, -- 10MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Configurar políticas RLS (Row Level Security) para o bucket

-- Permitir upload para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de fotos de eventos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pet-photos' AND
  auth.role() = 'authenticated'
);

-- Permitir leitura pública das fotos
CREATE POLICY "Leitura pública de fotos de eventos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'pet-photos'
);

-- Permitir que usuários autenticados atualizem suas próprias fotos
CREATE POLICY "Usuários podem atualizar suas próprias fotos de eventos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'pet-photos' AND
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
) WITH CHECK (
  bucket_id = 'pet-photos' AND
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários autenticados deletem suas próprias fotos
CREATE POLICY "Usuários podem deletar suas próprias fotos de eventos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pet-photos' AND
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Verificar se o bucket foi criado corretamente
SELECT * FROM storage.buckets WHERE id = 'pet-photos';

-- Verificar as políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%pet-photos%' OR policyname LIKE '%fotos de eventos%';