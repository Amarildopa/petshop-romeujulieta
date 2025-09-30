-- Migration: Create Growth Journey tables with _pet suffix
-- Created: 2024
-- Description: Creates tables for pet events, photos, event types and shared journeys

-- Create event_types_pet table
CREATE TABLE IF NOT EXISTS event_types_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20) DEFAULT '#3B82F6',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pet_events_pet table
CREATE TABLE IF NOT EXISTS pet_events_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES pets_pet(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES event_types_pet(id) ON DELETE RESTRICT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(200),
  is_milestone BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_photos_pet table
CREATE TABLE IF NOT EXISTS event_photos_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES pet_events_pet(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(200) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shared_journeys_pet table
CREATE TABLE IF NOT EXISTS shared_journeys_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES pets_pet(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pet_events_pet_pet_id ON pet_events_pet(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_events_pet_user_id ON pet_events_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_events_pet_event_date ON pet_events_pet(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_pet_events_pet_event_type ON pet_events_pet(event_type_id);

CREATE INDEX IF NOT EXISTS idx_event_photos_pet_event_id ON event_photos_pet(event_id);
CREATE INDEX IF NOT EXISTS idx_event_photos_pet_user_id ON event_photos_pet(user_id);

CREATE INDEX IF NOT EXISTS idx_shared_journeys_pet_pet_id ON shared_journeys_pet(pet_id);
CREATE INDEX IF NOT EXISTS idx_shared_journeys_pet_share_token ON shared_journeys_pet(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_journeys_pet_user_id ON shared_journeys_pet(user_id);

-- Enable Row Level Security
ALTER TABLE event_types_pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_events_pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photos_pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_journeys_pet ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_types_pet
CREATE POLICY "Event types are viewable by everyone" ON event_types_pet
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage event types" ON event_types_pet
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for pet_events_pet
CREATE POLICY "Users can view their own pet events" ON pet_events_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pet events" ON pet_events_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet events" ON pet_events_pet
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet events" ON pet_events_pet
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for event_photos_pet
CREATE POLICY "Users can view their own event photos" ON event_photos_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own event photos" ON event_photos_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own event photos" ON event_photos_pet
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event photos" ON event_photos_pet
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for shared_journeys_pet
CREATE POLICY "Users can view their own shared journeys" ON shared_journeys_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public shared journeys are viewable by everyone" ON shared_journeys_pet
  FOR SELECT USING (is_public = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Users can insert their own shared journeys" ON shared_journeys_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared journeys" ON shared_journeys_pet
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared journeys" ON shared_journeys_pet
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL PRIVILEGES ON event_types_pet TO authenticated;
GRANT ALL PRIVILEGES ON pet_events_pet TO authenticated;
GRANT ALL PRIVILEGES ON event_photos_pet TO authenticated;
GRANT ALL PRIVILEGES ON shared_journeys_pet TO authenticated;

-- Grant read permissions to anon users for public data
GRANT SELECT ON event_types_pet TO anon;
GRANT SELECT ON shared_journeys_pet TO anon;

-- Insert default event types
INSERT INTO event_types_pet (name, description, icon, color, is_system) VALUES
('Primeiro Dia', 'Primeiro dia do pet em casa', 'Home', '#10B981', true),
('Vacinação', 'Vacinas e imunizações', 'Shield', '#3B82F6', true),
('Consulta Veterinária', 'Visitas ao veterinário', 'Stethoscope', '#EF4444', true),
('Banho e Tosa', 'Cuidados de higiene', 'Scissors', '#8B5CF6', true),
('Brincadeira', 'Momentos de diversão', 'Play', '#F59E0B', true),
('Alimentação', 'Mudanças na dieta ou alimentação especial', 'UtensilsCrossed', '#06B6D4', true),
('Treinamento', 'Sessões de treinamento e aprendizado', 'GraduationCap', '#84CC16', true),
('Viagem', 'Viagens e passeios especiais', 'MapPin', '#F97316', true),
('Aniversário', 'Aniversários e datas especiais', 'Gift', '#EC4899', true),
('Marco Importante', 'Marcos importantes no desenvolvimento', 'Star', '#FBBF24', true)
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_event_types_pet_updated_at BEFORE UPDATE ON event_types_pet
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_events_pet_updated_at BEFORE UPDATE ON pet_events_pet
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_journeys_pet_updated_at BEFORE UPDATE ON shared_journeys_pet
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();