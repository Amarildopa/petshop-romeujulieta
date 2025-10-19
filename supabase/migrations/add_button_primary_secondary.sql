-- Migration: Add button primary and secondary colors to button area
-- This ensures all button colors use the same 'button' area for consistency

-- Insert button primary and secondary colors with 'button' area if they don't exist
INSERT INTO simple_theme_colors (area, color_type, color_value, is_active)
SELECT 'button', 'primary', '#F8BBD9', true
WHERE NOT EXISTS (SELECT 1 FROM simple_theme_colors WHERE area = 'button' AND color_type = 'primary')
UNION ALL
SELECT 'button', 'secondary', '#BFDBFE', true
WHERE NOT EXISTS (SELECT 1 FROM simple_theme_colors WHERE area = 'button' AND color_type = 'secondary');