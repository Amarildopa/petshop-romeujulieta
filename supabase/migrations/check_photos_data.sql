-- Verificar total de fotos
SELECT COUNT(*) as total_photos FROM event_photos_pet;

-- Verificar fotos mais recentes
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