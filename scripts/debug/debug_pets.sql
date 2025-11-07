-- Verificar pets existentes
SELECT 
    id,
    name,
    owner_id,
    species,
    breed,
    is_active,
    created_at
FROM pets_pet 
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;

-- Contar total de pets ativos
SELECT COUNT(*) as total_pets FROM pets_pet WHERE is_active = true;

-- Verificar pets por owner_id específico (se houver)
SELECT 
    owner_id,
    COUNT(*) as pet_count
FROM pets_pet 
WHERE is_active = true
GROUP BY owner_id
ORDER BY pet_count DESC;