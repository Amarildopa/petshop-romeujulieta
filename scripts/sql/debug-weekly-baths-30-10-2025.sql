-- =============================================
-- SCRIPT: Debug Weekly Baths - Foto 30/10/2025
-- Descrição: Investigar por que foto de 30/10/2025 não aparece na home
-- Data: 2024
-- =============================================

-- =============================================
-- SEÇÃO 1: VERIFICAR DATA ATUAL E CÁLCULOS DE SEMANA
-- =============================================

-- Data atual e cálculos de semana
SELECT 
  'CÁLCULOS DE SEMANA' as secao,
  CURRENT_DATE as data_atual,
  EXTRACT(DOW FROM CURRENT_DATE) as dia_semana_atual, -- 0=domingo, 1=segunda...
  
  -- Calcular início da semana atual (segunda-feira)
  CASE 
    WHEN EXTRACT(DOW FROM CURRENT_DATE) = 0 THEN 
      CURRENT_DATE - INTERVAL '6 days'  -- Se domingo, voltar 6 dias
    ELSE 
      CURRENT_DATE - INTERVAL (EXTRACT(DOW FROM CURRENT_DATE) - 1) || ' days'
  END as inicio_semana_atual,
  
  -- Calcular início da semana anterior (que é o que getCurrentWeekBaths busca)
  CASE 
    WHEN EXTRACT(DOW FROM CURRENT_DATE) = 0 THEN 
      CURRENT_DATE - INTERVAL '13 days'  -- Se domingo, voltar 13 dias
    ELSE 
      CURRENT_DATE - INTERVAL (EXTRACT(DOW FROM CURRENT_DATE) - 1 + 7) || ' days'
  END as inicio_semana_anterior;

-- =============================================
-- SEÇÃO 2: VERIFICAR REGISTROS PARA 30/10/2025
-- =============================================

-- Buscar todos os registros com bath_date = 30/10/2025
SELECT 
  'REGISTROS 30/10/2025' as secao,
  id,
  pet_name,
  bath_date,
  week_start,
  approved,
  approved_by,
  approved_at,
  display_order,
  created_at,
  updated_at
FROM weekly_baths 
WHERE bath_date = '2025-10-30'
ORDER BY created_at DESC;

-- =============================================
-- SEÇÃO 3: VERIFICAR QUAL WEEK_START DEVERIA SER PARA 30/10/2025
-- =============================================

-- Calcular qual deveria ser o week_start para 30/10/2025
SELECT 
  'CÁLCULO WEEK_START PARA 30/10/2025' as secao,
  '2025-10-30'::date as data_banho,
  EXTRACT(DOW FROM '2025-10-30'::date) as dia_semana, -- 0=domingo, 1=segunda...
  
  -- Calcular início da semana para 30/10/2025
  CASE 
    WHEN EXTRACT(DOW FROM '2025-10-30'::date) = 0 THEN 
      '2025-10-30'::date - INTERVAL '6 days'  -- Se domingo, voltar 6 dias
    ELSE 
      '2025-10-30'::date - INTERVAL (EXTRACT(DOW FROM '2025-10-30'::date) - 1) || ' days'
  END as week_start_correto;

-- =============================================
-- SEÇÃO 4: VERIFICAR O QUE getCurrentWeekBaths() ESTÁ BUSCANDO HOJE
-- =============================================

-- Simular o que getCurrentWeekBaths() busca (semana anterior)
WITH semana_anterior AS (
  SELECT 
    CASE 
      WHEN EXTRACT(DOW FROM CURRENT_DATE) = 0 THEN 
        CURRENT_DATE - INTERVAL '13 days'  -- Se domingo, voltar 13 dias
      ELSE 
        CURRENT_DATE - INTERVAL (EXTRACT(DOW FROM CURRENT_DATE) - 1 + 7) || ' days'
    END as week_start_buscado
)
SELECT 
  'O QUE getCurrentWeekBaths() BUSCA HOJE' as secao,
  sa.week_start_buscado,
  COUNT(wb.*) as total_registros_encontrados,
  COUNT(CASE WHEN wb.approved = true THEN 1 END) as total_aprovados
FROM semana_anterior sa
LEFT JOIN weekly_baths wb ON wb.week_start = sa.week_start_buscado::date
GROUP BY sa.week_start_buscado;

-- =============================================
-- SEÇÃO 5: LISTAR TODOS OS REGISTROS DA SEMANA ANTERIOR
-- =============================================

-- Listar registros que getCurrentWeekBaths() deveria retornar hoje
WITH semana_anterior AS (
  SELECT 
    CASE 
      WHEN EXTRACT(DOW FROM CURRENT_DATE) = 0 THEN 
        CURRENT_DATE - INTERVAL '13 days'  -- Se domingo, voltar 13 dias
      ELSE 
        CURRENT_DATE - INTERVAL (EXTRACT(DOW FROM CURRENT_DATE) - 1 + 7) || ' days'
    END as week_start_buscado
)
SELECT 
  'REGISTROS QUE DEVERIAM APARECER NA HOME' as secao,
  wb.id,
  wb.pet_name,
  wb.bath_date,
  wb.week_start,
  wb.approved,
  wb.display_order,
  wb.created_at
FROM semana_anterior sa
LEFT JOIN weekly_baths wb ON wb.week_start = sa.week_start_buscado::date
WHERE wb.approved = true
ORDER BY wb.display_order ASC, wb.created_at DESC;

-- =============================================
-- SEÇÃO 6: VERIFICAR TODAS AS SEMANAS DISPONÍVEIS
-- =============================================

-- Listar todas as semanas que têm registros
SELECT 
  'SEMANAS DISPONÍVEIS' as secao,
  week_start,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN approved = true THEN 1 END) as total_aprovados,
  MIN(bath_date) as primeira_data_banho,
  MAX(bath_date) as ultima_data_banho
FROM weekly_baths 
GROUP BY week_start 
ORDER BY week_start DESC;

-- =============================================
-- SEÇÃO 7: VERIFICAR REGISTROS PENDENTES DE APROVAÇÃO
-- =============================================

-- Listar registros não aprovados
SELECT 
  'REGISTROS PENDENTES DE APROVAÇÃO' as secao,
  id,
  pet_name,
  bath_date,
  week_start,
  approved,
  created_at,
  CASE 
    WHEN bath_date = '2025-10-30' THEN 'ESTE É O REGISTRO PROCURADO ⭐'
    ELSE 'Outro registro'
  END as destaque
FROM weekly_baths 
WHERE approved = false
ORDER BY created_at DESC;

-- =============================================
-- SEÇÃO 8: DIAGNÓSTICO FINAL
-- =============================================

-- Diagnóstico completo para o registro de 30/10/2025
WITH 
  data_atual AS (
    SELECT CURRENT_DATE as hoje
  ),
  semana_anterior AS (
    SELECT 
      CASE 
        WHEN EXTRACT(DOW FROM CURRENT_DATE) = 0 THEN 
          CURRENT_DATE - INTERVAL '13 days'
        ELSE 
          CURRENT_DATE - INTERVAL (EXTRACT(DOW FROM CURRENT_DATE) - 1 + 7) || ' days'
      END::date as week_start_esperado
  ),
  week_start_30_10 AS (
    SELECT 
      CASE 
        WHEN EXTRACT(DOW FROM '2025-10-30'::date) = 0 THEN 
          '2025-10-30'::date - INTERVAL '6 days'
        ELSE 
          '2025-10-30'::date - INTERVAL (EXTRACT(DOW FROM '2025-10-30'::date) - 1) || ' days'
      END::date as week_start_correto
  ),
  registro_30_10 AS (
    SELECT * FROM weekly_baths WHERE bath_date = '2025-10-30' LIMIT 1
  )
SELECT 
  'DIAGNÓSTICO FINAL' as secao,
  da.hoje as data_atual,
  sa.week_start_esperado as semana_que_home_busca,
  ws.week_start_correto as semana_do_registro_30_10,
  
  CASE 
    WHEN r.id IS NULL THEN 'REGISTRO NÃO ENCONTRADO ❌'
    WHEN r.approved = false THEN 'REGISTRO EXISTE MAS NÃO APROVADO ⚠️'
    WHEN r.week_start != sa.week_start_esperado THEN 'REGISTRO APROVADO MAS SEMANA DIFERENTE ⚠️'
    WHEN r.week_start = sa.week_start_esperado AND r.approved = true THEN 'REGISTRO OK - DEVERIA APARECER ✅'
    ELSE 'SITUAÇÃO DESCONHECIDA ❓'
  END as diagnostico,
  
  COALESCE(r.approved, false) as esta_aprovado,
  r.week_start as week_start_atual,
  r.pet_name as nome_pet
  
FROM data_atual da
CROSS JOIN semana_anterior sa
CROSS JOIN week_start_30_10 ws
LEFT JOIN registro_30_10 r ON true;

-- =============================================
-- SEÇÃO 9: COMANDOS DE CORREÇÃO
-- =============================================

/*
-- COMANDOS PARA CORRIGIR (EXECUTE APENAS SE NECESSÁRIO):

-- 1. Se o registro existe mas não está aprovado:
UPDATE weekly_baths 
SET 
  approved = true,
  approved_by = 'admin',
  approved_at = NOW(),
  updated_at = NOW()
WHERE bath_date = '2025-10-30' AND approved = false;

-- 2. Se o week_start está incorreto, corrigir:
UPDATE weekly_baths 
SET 
  week_start = (
    CASE 
      WHEN EXTRACT(DOW FROM '2025-10-30'::date) = 0 THEN 
        '2025-10-30'::date - INTERVAL '6 days'
      ELSE 
        '2025-10-30'::date - INTERVAL (EXTRACT(DOW FROM '2025-10-30'::date) - 1) || ' days'
    END
  )::date,
  updated_at = NOW()
WHERE bath_date = '2025-10-30';

-- 3. Se não existe registro, verificar se foi inserido em outra tabela ou se houve erro no cadastro
*/

-- =============================================
-- INSTRUÇÕES
-- =============================================

/*
COMO INTERPRETAR OS RESULTADOS:

1. SEÇÃO 1: Mostra as datas e cálculos de semana atuais
2. SEÇÃO 2: Lista registros específicos para 30/10/2025
3. SEÇÃO 3: Mostra qual deveria ser o week_start correto para 30/10/2025
4. SEÇÃO 4: Mostra o que getCurrentWeekBaths() está buscando hoje
5. SEÇÃO 5: Lista o que deveria aparecer na home hoje
6. SEÇÃO 6: Mostra todas as semanas disponíveis
7. SEÇÃO 7: Lista registros pendentes de aprovação
8. SEÇÃO 8: Diagnóstico final com o problema identificado
9. SEÇÃO 9: Comandos para corrigir o problema

POSSÍVEIS PROBLEMAS:
- Registro não aprovado (approved = false)
- week_start calculado incorretamente
- Registro não existe na tabela
- Data do banho em semana diferente da que a home está buscando
*/