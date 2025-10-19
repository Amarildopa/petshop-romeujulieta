-- Migration: Create simplified theme_colors_pet table
-- Date: 2025-01-15
-- Description: Simple theme color management with component/value structure

-- 1. Create the theme_colors_pet table
CREATE TABLE IF NOT EXISTS theme_colors_pet (
    id SERIAL PRIMARY KEY,
    component VARCHAR(100) NOT NULL UNIQUE,
    color_value VARCHAR(20) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_theme_colors_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER theme_colors_pet_updated_at
    BEFORE UPDATE ON theme_colors_pet
    FOR EACH ROW
    EXECUTE FUNCTION update_theme_colors_pet_updated_at();

-- 3. Insert initial theme color data
INSERT INTO theme_colors_pet (component, color_value, description, is_active) VALUES
-- Primary colors
('primary', '#3B82F6', 'Cor primária do sistema', true),
('secondary', '#10B981', 'Cor secundária do sistema', true),
('accent', '#F59E0B', 'Cor de destaque', true),
('surface', '#FFFFFF', 'Cor de superfície/fundo', true),
('text', '#1F2937', 'Cor do texto principal', true),

-- Header colors
('header_background', '#1F2937', 'Fundo do cabeçalho', true),
('header_text', '#FFFFFF', 'Texto do cabeçalho', true),
('header_border', '#374151', 'Borda do cabeçalho', true),

-- Landing page colors
('landing_hero_bg', '#F3F4F6', 'Fundo da seção hero', true),
('landing_hero_text', '#1F2937', 'Texto da seção hero', true),
('landing_section_bg', '#FFFFFF', 'Fundo das seções', true),

-- Component colors
('button_primary', '#3B82F6', 'Botão primário', true),
('button_secondary', '#6B7280', 'Botão secundário', true),
('card_bg', '#FFFFFF', 'Fundo dos cards', true),
('card_border', '#E5E7EB', 'Borda dos cards', true),

-- Additional UI colors
('success', '#10B981', 'Cor de sucesso', true),
('warning', '#F59E0B', 'Cor de aviso', true),
('error', '#EF4444', 'Cor de erro', true),
('info', '#3B82F6', 'Cor de informação', true)

ON CONFLICT (component) DO NOTHING;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_theme_colors_pet_component ON theme_colors_pet(component);
CREATE INDEX IF NOT EXISTS idx_theme_colors_pet_active ON theme_colors_pet(is_active) WHERE is_active = true;

-- 5. Enable RLS (Row Level Security)
ALTER TABLE theme_colors_pet ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
-- Allow public read access to active theme colors
CREATE POLICY "Allow public read access to active theme colors" ON theme_colors_pet
    FOR SELECT USING (is_active = true);

-- Allow authenticated users to read all theme colors
CREATE POLICY "Allow authenticated read access to all theme colors" ON theme_colors_pet
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to update theme colors
CREATE POLICY "Allow authenticated update access to theme colors" ON theme_colors_pet
    FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to insert new theme colors
CREATE POLICY "Allow authenticated insert access to theme colors" ON theme_colors_pet
    FOR INSERT TO authenticated WITH CHECK (true);

-- 7. Grant permissions to roles
GRANT SELECT ON theme_colors_pet TO anon;
GRANT ALL PRIVILEGES ON theme_colors_pet TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE theme_colors_pet_id_seq TO authenticated;

-- 8. Verify the migration
SELECT 
    component,
    color_value,
    description,
    is_active,
    created_at
FROM theme_colors_pet 
WHERE is_active = true
ORDER BY component;

-- Migration completed successfully
SELECT 'Theme colors pet table created successfully' as status;