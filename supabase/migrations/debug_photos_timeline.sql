-- Debug: Verificar eventos com fotos para o pet Maya

-- 1. Buscar o pet Maya
SELECT id, name, species, breed FROM pets_pet WHERE name ILIKE '%maya%';

-- 2. Verificar eventos do pet Maya (substitua o UUID pelo ID real)
SELECT 
  pe.id as event_id,
  pe.title,
  pe.event_date,
  pe.pet_id,
  pe.user_id,
  COUNT(ep.id) as photo_count
FROM pet_events_pet pe 
LEFT JOIN event_photos_pet ep ON pe.id = ep.event_id 
WHERE pe.pet_id IN (SELECT id FROM pets_pet WHERE name ILIKE '%maya%')
GROUP BY pe.id, pe.title, pe.event_date, pe.pet_id, pe.user_id
ORDER BY pe.event_date DESC;

-- 3. Verificar fotos específicas dos eventos do Maya
SELECT 
  ep.id as photo_id,
  ep.event_id,
  ep.file_path,
  ep.file_name,
  ep.caption,
  ep.is_primary,
  ep.created_at,
  pe.title as event_title
FROM event_photos_pet ep
JOIN pet_events_pet pe ON ep.event_id = pe.id
WHERE pe.pet_id IN (SELECT id FROM pets_pet WHERE name ILIKE '%maya%')
ORDER BY pe.event_date DESC, ep.created_at ASC;

-- 4. Verificar a consulta exata do hook usePetEvents para Maya
SELECT 
  pe.*,
  et.name as event_type_name,
  et.icon as event_type_icon,
  json_agg(
    json_build_object(
      'id', ep.id,
      'event_id', ep.event_id,
      'file_path', ep.file_path,
      'file_name', ep.file_name,
      'caption', ep.caption,
      'is_primary', ep.is_primary,
      'created_at', ep.created_at
    )
  ) FILTER (WHERE ep.id IS NOT NULL) as photos
FROM pet_events_pet pe
LEFT JOIN event_types_pet et ON pe.event_type_id = et.id
LEFT JOIN event_photos_pet ep ON pe.id = ep.event_id
WHERE pe.pet_id IN (SELECT id FROM pets_pet WHERE name ILIKE '%maya%')
GROUP BY pe.id, et.name, et.icon
ORDER BY pe.event_date DESC;

-- 5. Verificar se há fotos no bucket
SELECT 
  name,
  bucket_id,
  created_at,
  updated_at
FROM storage.objects 
WHERE bucket_id = 'pet-photos'
ORDER BY created_at DESC
LIMIT 10;