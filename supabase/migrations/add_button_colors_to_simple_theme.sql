-- Adicionar cores dos botões de login e cadastro ao sistema de tema simples
-- Primeiro, atualizar o check constraint para incluir os novos tipos de cor
ALTER TABLE simple_theme_colors 
DROP CONSTRAINT IF EXISTS simple_theme_colors_color_type_check;

ALTER TABLE simple_theme_colors 
ADD CONSTRAINT simple_theme_colors_color_type_check 
CHECK (color_type::text = ANY (ARRAY['bg'::character varying::text, 'text'::character varying::text, 'hover'::character varying::text, 'primary'::character varying::text, 'secondary'::character varying::text, 'login_bg'::character varying::text, 'login_text'::character varying::text, 'register_bg'::character varying::text, 'register_text'::character varying::text]));

-- Inserir as 4 novas cores para os botões do Header
INSERT INTO simple_theme_colors (area, color_type, color_value, is_active, created_at, updated_at)
VALUES 
  ('buttons', 'login_bg', '#f8fafc', true, NOW(), NOW()),
  ('buttons', 'login_text', '#e05389', true, NOW(), NOW()),
  ('buttons', 'register_bg', '#e05389', true, NOW(), NOW()),
  ('buttons', 'register_text', '#ffffff', true, NOW(), NOW());