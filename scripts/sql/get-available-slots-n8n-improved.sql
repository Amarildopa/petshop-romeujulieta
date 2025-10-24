-- =============================================
-- FUNÇÃO: get_available_slots_n8n (VERSÃO MELHORADA)
-- Descrição: Retorna slots disponíveis com filtros por tipo de serviço
-- Criado para integração com n8n para agendamentos
-- Data: 2024
-- =============================================

CREATE OR REPLACE FUNCTION get_available_slots_n8n(
    days INTEGER DEFAULT 7,
    service_category VARCHAR(50) DEFAULT NULL,
    service_name VARCHAR(100) DEFAULT NULL
) 
RETURNS TABLE ( 
  dia DATE, 
  horarios_disponiveis TEXT[], -- Horários únicos disponíveis
  total_slots_disponiveis BIGINT, -- Soma da capacidade disponível
  servicos_disponiveis TEXT[] -- Nomes dos serviços disponíveis
) AS $$ 
BEGIN 
  RETURN QUERY 
  SELECT 
    a.date as dia,
    ARRAY_AGG(DISTINCT a.start_time::TEXT ORDER BY a.start_time::TEXT)::TEXT[] as horarios_disponiveis,
    SUM(a.max_appointments - a.current_appointments) as total_slots_disponiveis,
    ARRAY_AGG(DISTINCT s.name ORDER BY s.name)::TEXT[] as servicos_disponiveis
  FROM available_slots_pet a 
  LEFT JOIN services_pet s ON a.service_id = s.id
  WHERE a.date >= CURRENT_DATE 
    AND a.date <= CURRENT_DATE + (days || ' days')::INTERVAL 
    AND a.is_available = true 
    AND a.current_appointments < a.max_appointments 
    -- Filtro por categoria de serviço (opcional)
    AND (service_category IS NULL OR s.category = service_category)
    -- Filtro por nome específico do serviço (opcional)
    AND (service_name IS NULL OR s.name ILIKE '%' || service_name || '%')
    -- Apenas serviços ativos
    AND (s.is_active IS NULL OR s.is_active = true)
  GROUP BY a.date 
  HAVING SUM(a.max_appointments - a.current_appointments) > 0
  ORDER BY dia; 
END; 
$$ LANGUAGE plpgsql;

-- =============================================
-- PERMISSÕES
-- =============================================

GRANT EXECUTE ON FUNCTION get_available_slots_n8n(INTEGER, VARCHAR, VARCHAR) TO anon, authenticated;

-- =============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================

COMMENT ON FUNCTION get_available_slots_n8n(INTEGER, VARCHAR, VARCHAR) IS 'Função melhorada para n8n: Retorna slots disponíveis com filtros por categoria e nome do serviço. Corrige problema de duplicatas usando DISTINCT nos horários.';

-- =============================================
-- EXEMPLOS DE USO
-- =============================================

/*
-- 1. Todos os slots dos próximos 7 dias (padrão)
SELECT * FROM get_available_slots_n8n();

-- 2. Apenas serviços de grooming dos próximos 14 dias  
SELECT * FROM get_available_slots_n8n(14, 'grooming');

-- 3. Apenas "Banho e Tosa" dos próximos 5 dias
SELECT * FROM get_available_slots_n8n(5, 'grooming', 'Banho e Tosa');

-- 4. Serviços veterinários dos próximos 10 dias
SELECT * FROM get_available_slots_n8n(10, 'veterinary');

-- 5. Qualquer serviço que contenha "banho" no nome
SELECT * FROM get_available_slots_n8n(7, NULL, 'banho');

-- 6. Verificar quantos dias têm slots disponíveis
SELECT COUNT(*) as dias_com_slots FROM get_available_slots_n8n();

-- 7. Total de slots disponíveis nos próximos 7 dias
SELECT SUM(total_slots_disponiveis) as total_geral FROM get_available_slots_n8n();
*/

-- =============================================
-- FUNÇÃO DE COMPARAÇÃO (PARA TESTES)
-- =============================================

-- Função para comparar resultados da versão antiga vs nova
CREATE OR REPLACE FUNCTION compare_slots_functions(test_days INTEGER DEFAULT 3)
RETURNS TABLE (
  tipo_funcao TEXT,
  dia DATE,
  slots_count BIGINT,
  detalhes TEXT
) AS $$
BEGIN
  -- Resultados da função melhorada
  RETURN QUERY
  SELECT 
    'NOVA (Melhorada)'::TEXT as tipo_funcao,
    n.dia,
    n.total_slots_disponiveis as slots_count,
    ('Horários: ' || array_length(n.horarios_disponiveis, 1)::TEXT || 
     ', Serviços: ' || array_length(n.servicos_disponiveis, 1)::TEXT)::TEXT as detalhes
  FROM get_available_slots_n8n(test_days) n
  
  UNION ALL
  
  -- Simulação da função antiga (contagem simples)
  SELECT 
    'ANTIGA (Simulada)'::TEXT as tipo_funcao,
    a.date as dia,
    COUNT(*)::BIGINT as slots_count,
    ('Registros brutos: ' || COUNT(*)::TEXT)::TEXT as detalhes
  FROM available_slots_pet a 
  WHERE a.date >= CURRENT_DATE 
    AND a.date <= CURRENT_DATE + (test_days || ' days')::INTERVAL 
    AND a.is_available = true 
    AND a.current_appointments < a.max_appointments 
  GROUP BY a.date
  
  ORDER BY dia, tipo_funcao;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION compare_slots_functions(INTEGER) TO anon, authenticated;

-- =============================================
-- FUNÇÃO DE DEBUG PARA INVESTIGAR DUPLICATAS
-- =============================================

CREATE OR REPLACE FUNCTION debug_slots_duplicates(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  date_slot DATE,
  start_time_slot TIME,
  service_name TEXT,
  service_category TEXT,
  max_appointments INTEGER,
  current_appointments INTEGER,
  available_capacity INTEGER,
  duplicate_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.date as date_slot,
    a.start_time::TIME as start_time_slot,
    COALESCE(s.name, 'Sem Serviço') as service_name,
    COALESCE(s.category, 'Sem Categoria') as service_category,
    a.max_appointments,
    a.current_appointments,
    (a.max_appointments - a.current_appointments) as available_capacity,
    COUNT(*) as duplicate_count
  FROM available_slots_pet a 
  LEFT JOIN services_pet s ON a.service_id = s.id
  WHERE a.date = target_date
    AND a.is_available = true 
    AND a.current_appointments < a.max_appointments 
  GROUP BY a.date, a.start_time, s.name, s.category, a.max_appointments, a.current_appointments
  ORDER BY a.start_time, duplicate_count DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION debug_slots_duplicates(DATE) TO anon, authenticated;

-- =============================================
-- TESTES RÁPIDOS
-- =============================================

/*
-- Testar a função melhorada
SELECT * FROM get_available_slots_n8n(3);

-- Comparar versões
SELECT * FROM compare_slots_functions(3);

-- Debug de duplicatas para hoje
SELECT * FROM debug_slots_duplicates(CURRENT_DATE);

-- Debug de duplicatas para uma data específica
SELECT * FROM debug_slots_duplicates('2025-10-21');
*/