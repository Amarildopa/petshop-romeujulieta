-- Script para corrigir a tabela pets_pet no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Primeiro, vamos verificar a estrutura atual da tabela
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'pets_pet' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- 2. Adicionar as colunas faltantes (se não existirem)
ALTER TABLE public.pets_pet 
ADD COLUMN IF NOT EXISTS age TEXT;

ALTER TABLE public.pets_pet 
ADD COLUMN IF NOT EXISTS weight TEXT;

ALTER TABLE public.pets_pet 
ADD COLUMN IF NOT EXISTS height TEXT;

ALTER TABLE public.pets_pet 
ADD COLUMN IF NOT EXISTS color TEXT;

ALTER TABLE public.pets_pet 
ADD COLUMN IF NOT EXISTS gender TEXT;

ALTER TABLE public.pets_pet 
ADD COLUMN IF NOT EXISTS personality TEXT[] DEFAULT '{}';

ALTER TABLE public.pets_pet 
ADD COLUMN IF NOT EXISTS allergies TEXT[] DEFAULT '{}';

ALTER TABLE public.pets_pet 
ADD COLUMN IF NOT EXISTS medications TEXT[] DEFAULT '{}';

ALTER TABLE public.pets_pet 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. Adicionar constraints se necessário (verificar se já existem antes)
-- Primeiro, verificar se as constraints já existem
DO $$
BEGIN
    -- Adicionar constraint de gender se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pets_pet_gender_check' 
        AND table_name = 'pets_pet' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.pets_pet 
        ADD CONSTRAINT pets_pet_gender_check 
        CHECK (gender IN ('Macho', 'Fêmea'));
    END IF;

    -- Adicionar constraint de species se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pets_pet_species_check' 
        AND table_name = 'pets_pet' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.pets_pet 
        ADD CONSTRAINT pets_pet_species_check 
        CHECK (species IN ('Cachorro', 'Gato'));
    END IF;
END $$;

-- 4. Verificar se as colunas foram adicionadas corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'pets_pet' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Testar inserção de um pet (opcional - remover após teste)
/*
INSERT INTO public.pets_pet (
    owner_id, 
    name, 
    species, 
    breed, 
    age, 
    weight, 
    height, 
    color, 
    gender, 
    personality, 
    allergies, 
    medications,
    image_url
) VALUES (
    'test-owner-uuid-here',  -- Substitua por um UUID válido de um usuário
    'Pet Teste',
    'Cachorro',
    'Labrador',
    '3 anos',
    '25kg',
    '60cm',
    'Dourado',
    'Macho',
    ARRAY['Brincalhão', 'Amigável'],
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    'https://example.com/pet-image.jpg'
);

-- Remover o pet de teste
DELETE FROM public.pets_pet WHERE name = 'Pet Teste';
*/