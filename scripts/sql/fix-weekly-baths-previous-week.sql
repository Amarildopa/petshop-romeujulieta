-- Script para ajustar dados conforme nova lógica dos requisitos funcionais
-- Hoje é 15/09/2025 (segunda-feira)
-- Carrossel deve mostrar fotos da SEMANA ANTERIOR (segunda a sábado: 9 a 14 de setembro)
-- Semana começa no DOMINGO (8 de setembro de 2025)
-- Execute este script no SQL Editor do Supabase

-- Atualizar todos os registros existentes para a semana anterior
UPDATE public.weekly_baths 
SET 
  -- week_start agora é o domingo da semana anterior (8 de setembro de 2025)
  week_start = '2025-09-08',
  
  -- bath_date distribuído de segunda a sábado da semana anterior (9 a 14 de setembro)
  bath_date = CASE 
    WHEN display_order = 1 THEN '2025-09-09'  -- Luna - Segunda-feira
    WHEN display_order = 2 THEN '2025-09-10'  -- Max - Terça-feira  
    WHEN display_order = 3 THEN '2025-09-11'  -- Bella - Quarta-feira
    WHEN display_order = 4 THEN '2025-09-12'  -- Charlie - Quinta-feira
    WHEN display_order = 5 THEN '2025-09-13'  -- Milo - Sexta-feira
    ELSE bath_date -- Manter data original se não corresponder
  END,
  
  updated_at = NOW()
WHERE approved = true;

-- Verificar os dados atualizados
SELECT 
  pet_name,
  week_start,
  bath_date,
  display_order,
  approved,
  CASE 
    WHEN EXTRACT(DOW FROM bath_date::date) = 1 THEN 'Segunda-feira'
    WHEN EXTRACT(DOW FROM bath_date::date) = 2 THEN 'Terça-feira'
    WHEN EXTRACT(DOW FROM bath_date::date) = 3 THEN 'Quarta-feira'
    WHEN EXTRACT(DOW FROM bath_date::date) = 4 THEN 'Quinta-feira'
    WHEN EXTRACT(DOW FROM bath_date::date) = 5 THEN 'Sexta-feira'
    WHEN EXTRACT(DOW FROM bath_date::date) = 6 THEN 'Sábado'
    WHEN EXTRACT(DOW FROM bath_date::date) = 0 THEN 'Domingo'
  END as dia_da_semana
FROM public.weekly_baths 
WHERE approved = true
ORDER BY display_order;

-- Comentários sobre a nova lógica:
-- 1. week_start = '2025-09-08' (domingo da semana anterior)
-- 2. bath_date de 9 a 14 de setembro (segunda a sábado da semana anterior)
-- 3. Domingo (15/09) não tem fotos, conforme requisito
-- 4. Carrossel mostra fotos da semana que passou (9-14/09)
-- 5. Toda segunda-feira (como hoje 15/09) são carregadas as fotos da semana anterior