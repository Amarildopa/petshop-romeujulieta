-- Verificar dados atuais da tabela simple_theme_colors
SELECT 
  area,
  color_type,
  color_value,
  is_active,
  created_at,
  updated_at
FROM simple_theme_colors 
ORDER BY area, color_type;

-- Verificar se as tabelas antigas ainda existem
SELECT 
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('theme_colors_pet', 'theme_sections_pet');

-- Contar total de cores ativas
SELECT 
  COUNT(*) as total_cores_ativas
FROM simple_theme_colors 
WHERE is_active = true;