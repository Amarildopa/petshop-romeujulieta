-- Script para criar o bucket 'pet-images' no Supabase Storage
-- Este bucket será usado para armazenar fotos dos pets

-- 1. Criar o bucket 'pet-images' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-images',
  'pet-images', 
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Configurar políticas RLS (Row Level Security) para o bucket

-- Permitir upload para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de fotos de pets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pet-images' AND
  auth.role() = 'authenticated'
);

-- Permitir atualização para usuários autenticados (proprietários)
CREATE POLICY "Usuários podem atualizar suas próprias fotos de pets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'pet-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
) WITH CHECK (
  bucket_id = 'pet-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir leitura pública das fotos (já que o bucket é público)
CREATE POLICY "Leitura pública de fotos de pets" ON storage.objects
FOR SELECT USING (bucket_id = 'pet-images');

-- Permitir exclusão para usuários autenticados (proprietários)
CREATE POLICY "Usuários podem deletar suas próprias fotos de pets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pet-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Verificar se o bucket foi criado corretamente
SELECT * FROM storage.buckets WHERE id = 'pet-images';