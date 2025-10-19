-- Migração para Sistema de Cores Simplificado
-- Remove complexidade do sistema atual e cria estrutura simplificada

-- 1. Remover tabelas antigas do sistema complexo
DROP TABLE IF EXISTS theme_colors_pet CASCADE;
DROP TABLE IF EXISTS theme_sections_pet CASCADE;

-- 2. Criar tabela simplificada
CREATE TABLE simple_theme_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area VARCHAR(20) NOT NULL CHECK (area IN ('header', 'landing', 'dashboard', 'buttons')),
    color_type VARCHAR(20) NOT NULL CHECK (color_type IN ('bg', 'text', 'primary', 'secondary')),
    color_value VARCHAR(7) NOT NULL CHECK (color_value ~ '^#[0-9A-Fa-f]{6}$'),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX idx_simple_theme_area ON simple_theme_colors(area);
CREATE INDEX idx_simple_theme_active ON simple_theme_colors(is_active);
CREATE UNIQUE INDEX idx_simple_theme_unique ON simple_theme_colors(area, color_type) WHERE is_active = true;

-- 4. Inserir dados iniciais (cores originais do sistema)
INSERT INTO simple_theme_colors (area, color_type, color_value) VALUES
-- Header (cabeçalho)
('header', 'bg', '#FEF7FF'),      -- Fundo do header
('header', 'text', '#F8BBD9'),    -- Texto do header

-- Landing Page (página inicial)
('landing', 'bg', '#FEF7FF'),     -- Fundo da landing page

-- Dashboard (painel administrativo)
('dashboard', 'bg', '#FFFBEB'),   -- Fundo do dashboard

-- Botões
('buttons', 'primary', '#F8BBD9'),    -- Cor primária dos botões
('buttons', 'secondary', '#BFDBFE');  -- Cor secundária dos botões

-- 5. Configurar RLS (Row Level Security)
ALTER TABLE simple_theme_colors ENABLE ROW LEVEL SECURITY;

-- 6. Política para leitura pública (qualquer usuário pode ver as cores)
CREATE POLICY "Permitir leitura pública de cores" ON simple_theme_colors
    FOR SELECT USING (true);

-- 7. Política para administradores (apenas admins podem modificar)
CREATE POLICY "Permitir administradores modificar cores" ON simple_theme_colors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users_pet 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- 8. Conceder permissões básicas
GRANT SELECT ON simple_theme_colors TO anon;
GRANT ALL PRIVILEGES ON simple_theme_colors TO authenticated;

-- 9. Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_simple_theme_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger para atualizar timestamp automaticamente
CREATE TRIGGER trigger_update_simple_theme_updated_at
    BEFORE UPDATE ON simple_theme_colors
    FOR EACH ROW
    EXECUTE FUNCTION update_simple_theme_updated_at();

-- 11. Comentários para documentação
COMMENT ON TABLE simple_theme_colors IS 'Tabela simplificada para personalização de cores do sistema';
COMMENT ON COLUMN simple_theme_colors.area IS 'Área da interface (header, landing, dashboard, buttons)';
COMMENT ON COLUMN simple_theme_colors.color_type IS 'Tipo da cor (bg, text, primary, secondary)';
COMMENT ON COLUMN simple_theme_colors.color_value IS 'Valor hexadecimal da cor (#RRGGBB)';
COMMENT ON COLUMN simple_theme_colors.is_active IS 'Indica se a cor está ativa no sistema';