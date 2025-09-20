-- Criar tabela de raças (breeds_pet)
CREATE TABLE IF NOT EXISTS public.breeds_pet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    species VARCHAR(20) NOT NULL CHECK (species IN ('dog', 'cat')),
    size_category VARCHAR(20) CHECK (size_category IN ('toy', 'small', 'medium', 'large', 'giant')),
    origin_country VARCHAR(50),
    temperament TEXT,
    life_expectancy_min INTEGER,
    life_expectancy_max INTEGER,
    weight_min_kg DECIMAL(5,2),
    weight_max_kg DECIMAL(5,2),
    height_min_cm INTEGER,
    height_max_cm INTEGER,
    coat_type VARCHAR(50),
    grooming_needs VARCHAR(20) CHECK (grooming_needs IN ('low', 'medium', 'high')),
    exercise_needs VARCHAR(20) CHECK (exercise_needs IN ('low', 'medium', 'high')),
    good_with_children BOOLEAN DEFAULT true,
    good_with_pets BOOLEAN DEFAULT true,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar extensão pg_trgm se não estiver habilitada (para busca por similaridade)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Criar índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_breeds_pet_name ON public.breeds_pet (name);
CREATE INDEX IF NOT EXISTS idx_breeds_pet_species ON public.breeds_pet (species);
CREATE INDEX IF NOT EXISTS idx_breeds_pet_name_species ON public.breeds_pet (name, species);
CREATE INDEX IF NOT EXISTS idx_breeds_pet_active ON public.breeds_pet (is_active);

-- Criar índice para busca por texto (busca parcial)
CREATE INDEX IF NOT EXISTS idx_breeds_pet_name_trgm ON public.breeds_pet USING gin (name gin_trgm_ops);

-- Adicionar coluna breed_id na tabela pets_pet (relacionamento) - apenas se a tabela existir
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pets_pet') THEN
        ALTER TABLE public.pets_pet 
        ADD COLUMN IF NOT EXISTS breed_id UUID REFERENCES public.breeds_pet(id);
        
        -- Criar índice para o relacionamento
        CREATE INDEX IF NOT EXISTS idx_pets_pet_breed_id ON public.pets_pet (breed_id);
    END IF;
END $$;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela breeds_pet
CREATE TRIGGER update_breeds_pet_updated_at 
    BEFORE UPDATE ON public.breeds_pet 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.breeds_pet ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para todos os usuários autenticados
CREATE POLICY "Breeds are viewable by authenticated users" ON public.breeds_pet
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserção/atualização apenas para admins
CREATE POLICY "Breeds are manageable by admins" ON public.breeds_pet
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users_pet au
            JOIN public.profiles_pet p ON au.user_id = p.id
            WHERE p.id = auth.uid() 
            AND au.is_active = true
        )
    );

-- Comentários para documentação
COMMENT ON TABLE public.breeds_pet IS 'Tabela de raças de cães e gatos com informações detalhadas';
COMMENT ON COLUMN public.breeds_pet.name IS 'Nome da raça';
COMMENT ON COLUMN public.breeds_pet.species IS 'Espécie: dog (cão) ou cat (gato)';
COMMENT ON COLUMN public.breeds_pet.size_category IS 'Categoria de tamanho: toy, small, medium, large, giant';
COMMENT ON COLUMN public.breeds_pet.temperament IS 'Características de temperamento da raça';
COMMENT ON COLUMN public.breeds_pet.life_expectancy_min IS 'Expectativa de vida mínima em anos';
COMMENT ON COLUMN public.breeds_pet.life_expectancy_max IS 'Expectativa de vida máxima em anos';
COMMENT ON COLUMN public.breeds_pet.weight_min_kg IS 'Peso mínimo em quilogramas';
COMMENT ON COLUMN public.breeds_pet.weight_max_kg IS 'Peso máximo em quilogramas';
COMMENT ON COLUMN public.breeds_pet.height_min_cm IS 'Altura mínima em centímetros';
COMMENT ON COLUMN public.breeds_pet.height_max_cm IS 'Altura máxima em centímetros';
COMMENT ON COLUMN public.breeds_pet.coat_type IS 'Tipo de pelagem';
COMMENT ON COLUMN public.breeds_pet.grooming_needs IS 'Necessidades de cuidados: low, medium, high';
COMMENT ON COLUMN public.breeds_pet.exercise_needs IS 'Necessidades de exercício: low, medium, high';
COMMENT ON COLUMN public.breeds_pet.good_with_children IS 'Boa convivência com crianças';
COMMENT ON COLUMN public.breeds_pet.good_with_pets IS 'Boa convivência com outros pets';