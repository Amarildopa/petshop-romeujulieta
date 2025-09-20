-- Script para criar a tabela care_extras_pet no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar a tabela care_extras_pet
CREATE TABLE IF NOT EXISTS care_extras_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  duration_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  category VARCHAR(50) DEFAULT 'extra'
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_care_extras_pet_category ON care_extras_pet(category);
CREATE INDEX IF NOT EXISTS idx_care_extras_pet_active ON care_extras_pet(is_active);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_care_extras_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER trigger_update_care_extras_pet_updated_at
  BEFORE UPDATE ON care_extras_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_care_extras_pet_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE care_extras_pet ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir que usuários vejam os extras de cuidado
CREATE POLICY "Users can view care extras" ON care_extras_pet
  FOR SELECT USING (true);

-- Inserir dados iniciais
INSERT INTO care_extras_pet (name, description, price, duration_minutes, category) VALUES
  ('Escovação de Dentes', 'Limpeza e escovação dos dentes do pet', 15.00, 15, 'higiene'),
  ('Corte de Unhas', 'Corte e lixamento das unhas', 10.00, 10, 'higiene'),
  ('Limpeza de Ouvidos', 'Limpeza profunda dos ouvidos', 12.00, 10, 'higiene'),
  ('Perfume Pet', 'Aplicação de perfume especial para pets', 8.00, 5, 'beleza'),
  ('Laço Decorativo', 'Colocação de laço ou acessório decorativo', 5.00, 5, 'beleza'),
  ('Hidratação do Pelo', 'Tratamento hidratante para o pelo', 20.00, 20, 'tratamento'),
  ('Massagem Relaxante', 'Massagem terapêutica para relaxamento', 25.00, 15, 'tratamento'),
  ('Análise de Pele', 'Verificação da saúde da pele do pet', 15.00, 10, 'saude')
ON CONFLICT (name) DO NOTHING;

-- Verificar se a tabela foi criada corretamente
SELECT 'Tabela care_extras_pet criada com sucesso!' as status;
SELECT COUNT(*) as total_registros FROM care_extras_pet;