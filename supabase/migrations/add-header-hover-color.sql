-- Migration: Add header hover color to simple theme colors
-- This adds the new header_hover color option to the theme system

-- First, update the color_type constraint to include 'hover'
ALTER TABLE simple_theme_colors 
DROP CONSTRAINT IF EXISTS simple_theme_colors_color_type_check;

ALTER TABLE simple_theme_colors 
ADD CONSTRAINT simple_theme_colors_color_type_check 
CHECK (color_type::text = ANY (ARRAY['bg'::character varying, 'text'::character varying, 'hover'::character varying, 'primary'::character varying, 'secondary'::character varying]::text[]));

-- Insert the new header hover color (only if it doesn't exist)
INSERT INTO simple_theme_colors (area, color_type, color_value, is_active, created_at, updated_at)
SELECT 'header', 'hover', '#F472B6', true, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM simple_theme_colors 
  WHERE area = 'header' AND color_type = 'hover'
);