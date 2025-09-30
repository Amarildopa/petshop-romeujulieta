-- Verificar eventos com fotos
SELECT 
  pe.id,
  pe.title,
  pe.event_date,
  pe.pet_id,
  COUNT(ep.id) as photo_count
FROM pet_events_pet pe 
LEFT JOIN event_photos_pet ep ON pe.id = ep.event_id 
GROUP BY pe.id, pe.title, pe.event_date, pe.pet_id
ORDER BY pe.event_date DESC 
LIMIT 10;