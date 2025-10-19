-- Migration: Reorganize theme colors by sections for better UX
-- Date: 2025-01-15
-- Description: Restructure theme colors into intuitive sections (Header, Hero, Dashboard, Buttons, General)

-- 1. Drop existing theme_colors_pet table if exists
DROP TABLE IF EXISTS theme_colors_pet;

-- 2. Create new theme_colors_pet table with section-based structure
CREATE TABLE theme_colors_pet (
    id SERIAL PRIMARY KEY,
    section VARCHAR(50) NOT NULL,
    component VARCHAR(100) NOT NULL,
    color_value VARCHAR(7) NOT NULL,
    description TEXT NOT NULL,
    visual_example TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insert Header section colors
INSERT INTO theme_colors_pet (section, component, color_value, description, visual_example, display_order) VALUES
('Header', 'header_background', '#1F2937', 'Cor de fundo do cabeçalho principal', 'Fundo da barra superior do site', 1),
('Header', 'header_text', '#FFFFFF', 'Cor do texto no cabeçalho', 'Texto do logo e menu de navegação', 2),
('Header', 'header_border', '#374151', 'Cor da borda inferior do cabeçalho', 'Linha que separa o cabeçalho do conteúdo', 3),
('Header', 'navigation_hover', '#4B5563', 'Cor de hover dos itens de navegação', 'Cor quando passa o mouse sobre os links do menu', 4);

-- 4. Insert Hero Section colors
INSERT INTO theme_colors_pet (section, component, color_value, description, visual_example, display_order) VALUES
('Hero', 'hero_background', '#F3F4F6', 'Cor de fundo da seção principal', 'Fundo da área de destaque da página inicial', 10),
('Hero', 'hero_title', '#1F2937', 'Cor do título principal', 'Texto do título de boas-vindas', 11),
('Hero', 'hero_subtitle', '#6B7280', 'Cor do subtítulo', 'Texto descritivo abaixo do título principal', 12),
('Hero', 'hero_accent', '#3B82F6', 'Cor de destaque na seção hero', 'Elementos decorativos e ícones de destaque', 13);

-- 5. Insert Dashboard section colors
INSERT INTO theme_colors_pet (section, component, color_value, description, visual_example, display_order) VALUES
('Dashboard', 'card_background', '#FFFFFF', 'Cor de fundo dos cartões', 'Fundo dos cards de informações e estatísticas', 20),
('Dashboard', 'card_border', '#E5E7EB', 'Cor da borda dos cartões', 'Bordas dos cards e divisores', 21),
('Dashboard', 'card_title', '#1F2937', 'Cor dos títulos dos cartões', 'Títulos dos cards e seções do dashboard', 22),
('Dashboard', 'card_text', '#6B7280', 'Cor do texto dos cartões', 'Texto descritivo e dados nos cards', 23),
('Dashboard', 'sidebar_background', '#F9FAFB', 'Cor de fundo da barra lateral', 'Fundo do menu lateral do dashboard', 24);

-- 6. Insert Buttons section colors
INSERT INTO theme_colors_pet (section, component, color_value, description, visual_example, display_order) VALUES
('Botões', 'button_primary', '#3B82F6', 'Cor do botão principal', 'Botões de ação primária (Salvar, Confirmar)', 30),
('Botões', 'button_primary_hover', '#2563EB', 'Cor do botão principal ao passar o mouse', 'Estado hover do botão principal', 31),
('Botões', 'button_secondary', '#6B7280', 'Cor do botão secundário', 'Botões de ação secundária (Cancelar, Voltar)', 32),
('Botões', 'button_secondary_hover', '#4B5563', 'Cor do botão secundário ao passar o mouse', 'Estado hover do botão secundário', 33),
('Botões', 'button_success', '#10B981', 'Cor do botão de sucesso', 'Botões de confirmação e sucesso', 34),
('Botões', 'button_danger', '#EF4444', 'Cor do botão de perigo', 'Botões de exclusão e ações perigosas', 35);

-- 7. Insert General section colors
INSERT INTO theme_colors_pet (section, component, color_value, description, visual_example, display_order) VALUES
('Geral', 'text_primary', '#1F2937', 'Cor do texto principal', 'Texto principal em todo o site', 40),
('Geral', 'text_secondary', '#6B7280', 'Cor do texto secundário', 'Texto descritivo e legendas', 41),
('Geral', 'background_primary', '#FFFFFF', 'Cor de fundo principal', 'Fundo principal das páginas', 42),
('Geral', 'background_secondary', '#F9FAFB', 'Cor de fundo secundário', 'Fundo de seções alternadas', 43),
('Geral', 'border_primary', '#E5E7EB', 'Cor da borda principal', 'Bordas de formulários e divisores', 44),
('Geral', 'accent_color', '#F59E0B', 'Cor de destaque', 'Elementos de destaque e notificações', 45);

-- 8. Create indexes for performance
CREATE INDEX idx_theme_colors_section ON theme_colors_pet(section);
CREATE INDEX idx_theme_colors_active ON theme_colors_pet(is_active);
CREATE INDEX idx_theme_colors_order ON theme_colors_pet(section, display_order);

-- 9. Enable RLS
ALTER TABLE theme_colors_pet ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies
CREATE POLICY "Allow authenticated users to read theme colors" ON theme_colors_pet
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin users to modify theme colors" ON theme_colors_pet
    FOR ALL TO authenticated USING (true);

-- 11. Grant permissions
GRANT SELECT ON theme_colors_pet TO anon;
GRANT ALL PRIVILEGES ON theme_colors_pet TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE theme_colors_pet_id_seq TO authenticated;

-- 12. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_theme_colors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER theme_colors_updated_at_trigger
    BEFORE UPDATE ON theme_colors_pet
    FOR EACH ROW
    EXECUTE FUNCTION update_theme_colors_updated_at();

-- Migration completed
SELECT 'Theme colors reorganized by sections successfully' as status;