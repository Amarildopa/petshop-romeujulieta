-- Debug: Verificar dados nas tabelas relacionadas a fotos

-- 1. Verificar se existem fotos na tabela event_photos_pet
SELECT 
    COUNT(*) as total_photos,
    COUNT(CASE WHEN is_primary = true THEN 1 END) as primary_photos
FROM event_photos_pet;

-- 2. Verificar eventos com fotos
SELECT 
    e.id as event_id,
    e.title,
    e.event_date,
    COUNT(p.id) as photo_count
FROM pet_events_pet e
LEFT JOIN event_photos_pet p ON e.id = p.event_id
GROUP BY e.id, e.title, e.event_date
ORDER BY e.event_date DESC
LIMIT 10;

-- 3. Verificar estrutura das fotos
SELECT 
    id,
    event_id,
    file_path,
    file_name,
    is_primary,
    created_at
FROM event_photos_pet
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar permissões na tabela event_photos_pet
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'event_photos_pet'
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;