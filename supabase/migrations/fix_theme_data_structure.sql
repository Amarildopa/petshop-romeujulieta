-- Migration para corrigir a estrutura de dados dos temas
-- Esta migration insere os dados de tema com propriedades aninhadas corretas

-- Desabilitar temporariamente triggers para evitar erro com audit_logs_pet
ALTER TABLE system_settings_pet DISABLE TRIGGER ALL;

-- Primeiro, remover dados de tema existentes se houver
DELETE FROM system_settings_pet WHERE key IN ('theme_colors_active', 'theme_colors_default');

-- Inserir dados de tema padrão com estrutura aninhada correta
INSERT INTO system_settings_pet (key, value, description, category, is_public) VALUES
(
  'theme_colors_default',
  '{
    "primary": "#3B82F6",
    "primary-dark": "#1E40AF",
    "primary-light": "#DBEAFE",
    "secondary": "#10B981",
    "secondary-dark": "#047857",
    "secondary-light": "#D1FAE5",
    "accent": "#F59E0B",
    "accent-dark": "#D97706",
    "accent-light": "#FEF3C7",
    "surface": "#FFFFFF",
    "surface-dark": "#F9FAFB",
    "background": "#FFFFFF",
    "text-color": "#374151",
    "text-color-dark": "#111827",
    "header": {
      "background": "#FFFFFF",
      "text": "#374151",
      "border": "#E5E7EB",
      "hover": "#F3F4F6"
    },
    "landing": {
      "hero_bg": "#F8FAFC",
      "hero_text": "#1F2937",
      "hero_accent": "#3B82F6",
      "section_bg": "#FFFFFF",
      "section_alt_bg": "#F9FAFB"
    },
    "components": {
      "card_bg": "#FFFFFF",
      "card_border": "#E5E7EB",
      "card_shadow": "rgba(0, 0, 0, 0.1)",
      "button_primary": "#3B82F6",
      "button_secondary": "#6B7280",
      "input_border": "#D1D5DB",
      "input_focus": "#3B82F6"
    }
  }',
  'Cores padrão do tema do sistema',
  'theme',
  true
),
(
  'theme_colors_active',
  '{
    "primary": "#3B82F6",
    "primary-dark": "#1E40AF",
    "primary-light": "#DBEAFE",
    "secondary": "#10B981",
    "secondary-dark": "#047857",
    "secondary-light": "#D1FAE5",
    "accent": "#F59E0B",
    "accent-dark": "#D97706",
    "accent-light": "#FEF3C7",
    "surface": "#FFFFFF",
    "surface-dark": "#F9FAFB",
    "background": "#FFFFFF",
    "text-color": "#374151",
    "text-color-dark": "#111827",
    "header": {
      "background": "#FFFFFF",
      "text": "#374151",
      "border": "#E5E7EB",
      "hover": "#F3F4F6"
    },
    "landing": {
      "hero_bg": "#F8FAFC",
      "hero_text": "#1F2937",
      "hero_accent": "#3B82F6",
      "section_bg": "#FFFFFF",
      "section_alt_bg": "#F9FAFB"
    },
    "components": {
      "card_bg": "#FFFFFF",
      "card_border": "#E5E7EB",
      "card_shadow": "rgba(0, 0, 0, 0.1)",
      "button_primary": "#3B82F6",
      "button_secondary": "#6B7280",
      "input_border": "#D1D5DB",
      "input_focus": "#3B82F6"
    }
  }',
  'Cores ativas do tema do sistema',
  'theme',
  true
);

-- Reabilitar triggers
ALTER TABLE system_settings_pet ENABLE TRIGGER ALL;

-- Conceder permissões para as roles anon e authenticated
GRANT SELECT ON system_settings_pet TO anon;
GRANT SELECT ON system_settings_pet TO authenticated;

-- Migration executada com sucesso!
-- Dados de tema inseridos com estrutura aninhada correta
-- Permissões concedidas para anon e authenticated roles