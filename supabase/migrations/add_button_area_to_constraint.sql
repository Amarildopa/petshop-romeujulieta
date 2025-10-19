-- Migration: Add 'button' area to simple_theme_colors constraint
-- This allows individual button colors (login, register) to be stored separately from general button colors

-- Update the area constraint to include 'button' (singular) in addition to 'buttons' (plural)
ALTER TABLE simple_theme_colors 
DROP CONSTRAINT IF EXISTS simple_theme_colors_area_check;

ALTER TABLE simple_theme_colors 
ADD CONSTRAINT simple_theme_colors_area_check 
CHECK (area::text = ANY (ARRAY[
  'header'::character varying,
  'landing'::character varying, 
  'dashboard'::character varying,
  'buttons'::character varying,
  'button'::character varying
]::text[]));

-- Insert default button colors with 'button' area if they don't exist
INSERT INTO simple_theme_colors (area, color_type, color_value, is_active)
SELECT 'button', 'login_bg', '#f8fafc', true
WHERE NOT EXISTS (SELECT 1 FROM simple_theme_colors WHERE area = 'button' AND color_type = 'login_bg')
UNION ALL
SELECT 'button', 'login_text', '#e05389', true
WHERE NOT EXISTS (SELECT 1 FROM simple_theme_colors WHERE area = 'button' AND color_type = 'login_text')
UNION ALL
SELECT 'button', 'register_bg', '#e05389', true
WHERE NOT EXISTS (SELECT 1 FROM simple_theme_colors WHERE area = 'button' AND color_type = 'register_bg')
UNION ALL
SELECT 'button', 'register_text', '#ffffff', true
WHERE NOT EXISTS (SELECT 1 FROM simple_theme_colors WHERE area = 'button' AND color_type = 'register_text');