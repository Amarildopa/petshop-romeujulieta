-- =============================================
-- Verificação de Eventos da Jornada (Maya - pet_id correto)
-- Arquivo: verificar-eventos-maya-jornada-correto.sql
-- Objetivo: Listar todos os eventos da Maya e identificar quais
--           devem exibir o badge "🛁 Banho Semanal"
-- =============================================

-- pet_id correto da Maya:
-- 9174593e-8a6a-4827-b7c1-e067603a3c4e

SELECT 
  'EVENTOS_MAYA_CORRETO' AS secao,
  e.id,
  e.pet_id,
  et.name                         AS tipo_evento,
  e.title,
  e.description,
  e.event_date,
  e.weekly_bath_source_id,
  -- Badge de Banho Semanal aparece somente para eventos "Banho e Tosa"
  -- quando há vínculo com weekly_baths via weekly_bath_source_id
  (et.name = 'Banho e Tosa' AND e.weekly_bath_source_id IS NOT NULL) AS tem_badge_banho_semanal,
  CASE 
    WHEN et.name = 'Banho e Tosa' AND e.weekly_bath_source_id IS NOT NULL THEN '🛁 Banho Semanal'
    ELSE NULL
  END AS badge_banho_semanal
FROM public.pet_events_pet e
JOIN public.event_types_pet et ON et.id = e.event_type_id
WHERE e.pet_id = '9174593e-8a6a-4827-b7c1-e067603a3c4e'
ORDER BY e.event_date DESC;