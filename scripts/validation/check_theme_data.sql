-- Verificar dados na tabela theme_colors_pet
SELECT 
    section,
    component,
    color_value,
    description,
    is_active,
    display_order
FROM theme_colors_pet 
WHERE is_active = true
ORDER BY section, display_order
LIMIT 10;

-- Contar total de registros
SELECT COUNT(*) as total_records FROM theme_colors_pet;

-- Contar registros ativos
SELECT COUNT(*) as active_records FROM theme_colors_pet WHERE is_active = true;

-- Verificar seções disponíveis
SELECT section, COUNT(*) as color_count 
FROM theme_colors_pet 
WHERE is_active = true 
GROUP BY section 
ORDER BY section