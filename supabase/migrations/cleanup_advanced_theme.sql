-- Migration: Cleanup Advanced Theme System
-- Remove all advanced theme tables and keep only simple theme system

-- 1. Drop advanced theme tables if they exist
DROP TABLE IF EXISTS theme_colors_pet CASCADE;
DROP TABLE IF EXISTS theme_sections_pet CASCADE;

-- 2. Verify simple_theme_colors table exists and show current data
SELECT 'Current simple_theme_colors data:' as info;
SELECT area, color_type, color_value, is_active 
FROM simple_theme_colors 
ORDER BY area, color_type;

-- 3. Show table structure
SELECT 'Table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'simple_theme_colors' 
ORDER BY ordinal_position;