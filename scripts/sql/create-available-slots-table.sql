-- Script para criar a tabela available_slots_pet no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar a tabela available_slots_pet
CREATE TABLE IF NOT EXISTS available_slots_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  service_id UUID REFERENCES services_pet(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  max_appointments INTEGER DEFAULT 1,
  current_appointments INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles_pet(id) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_available_slots_pet_service_date ON available_slots_pet(service_id, date);
CREATE INDEX IF NOT EXISTS idx_available_slots_pet_date_available ON available_slots_pet(date, is_available);
CREATE INDEX IF NOT EXISTS idx_available_slots_pet_created_by ON available_slots_pet(created_by);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_available_slots_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER trigger_update_available_slots_pet_updated_at
  BEFORE UPDATE ON available_slots_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_available_slots_pet_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE available_slots_pet ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view available slots" ON available_slots_pet
  FOR SELECT USING (true);

CREATE POLICY "Users can insert available slots" ON available_slots_pet
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update available slots" ON available_slots_pet
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete available slots" ON available_slots_pet
  FOR DELETE USING (true);

-- Inserir alguns horários de exemplo (opcional)
INSERT INTO available_slots_pet (service_id, date, start_time, end_time, is_available, max_appointments) 
SELECT 
  s.id,
  CURRENT_DATE + INTERVAL '1 day',
  '09:00'::TIME,
  '10:00'::TIME,
  true,
  1
FROM services_pet s 
WHERE s.name ILIKE '%banho%' 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO available_slots_pet (service_id, date, start_time, end_time, is_available, max_appointments) 
SELECT 
  s.id,
  CURRENT_DATE + INTERVAL '1 day',
  '10:00'::TIME,
  '11:00'::TIME,
  true,
  1
FROM services_pet s 
WHERE s.name ILIKE '%banho%' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Verificar se a tabela foi criada corretamente
SELECT 'Tabela available_slots_pet criada com sucesso!' as status;
SELECT COUNT(*) as total_slots FROM available_slots_pet;