-- =============================================
-- SCRIPT PARA POPULAR SLOTS DISPONÍVEIS
-- =============================================
-- Este script popula a tabela available_slots_pet com slots para os próximos 30 dias
-- Execute este script no SQL Editor do Supabase

-- Limpar slots existentes (opcional - descomente se quiser resetar)
-- DELETE FROM available_slots_pet WHERE date >= CURRENT_DATE;

-- =============================================
-- POPULAR SLOTS PARA OS PRÓXIMOS 30 DIAS
-- =============================================

DO $$
DECLARE
    service_record RECORD;
    current_date_iter DATE;
    current_hour INTEGER;
    start_time_slot TIME;
    end_time_slot TIME;
    end_date DATE := CURRENT_DATE + INTERVAL '30 days';
BEGIN
    -- Loop através de todos os serviços ativos
    FOR service_record IN 
        SELECT id, name FROM services_pet WHERE is_active = true
    LOOP
        RAISE NOTICE 'Criando slots para o serviço: %', service_record.name;
        
        -- Loop através dos próximos 30 dias
        current_date_iter := CURRENT_DATE;
        WHILE current_date_iter <= end_date LOOP
            
            -- Pular domingos (EXTRACT(DOW FROM date) = 0 significa domingo)
            IF EXTRACT(DOW FROM current_date_iter) != 0 THEN
                
                -- Criar slots das 8h às 17h (último slot começa às 17h e termina às 18h)
                FOR current_hour IN 8..17 LOOP
                    start_time_slot := (current_hour || ':00')::TIME;
                    end_time_slot := ((current_hour + 1) || ':00')::TIME;
                    
                    -- Inserir o slot (apenas se não existir)
                    INSERT INTO available_slots_pet (
                        service_id,
                        date,
                        start_time,
                        end_time,
                        is_available,
                        max_appointments,
                        current_appointments
                    ) 
                    SELECT 
                        service_record.id,
                        current_date_iter,
                        start_time_slot,
                        end_time_slot,
                        true,
                        2, -- Máximo de 2 agendamentos por slot
                        0  -- Inicialmente 0 agendamentos
                    WHERE NOT EXISTS (
                        SELECT 1 FROM available_slots_pet 
                        WHERE service_id = service_record.id 
                        AND date = current_date_iter 
                        AND start_time = start_time_slot
                    );
                    
                END LOOP;
                
            END IF;
            
            -- Próximo dia
            current_date_iter := current_date_iter + INTERVAL '1 day';
            
        END LOOP;
        
    END LOOP;
    
    RAISE NOTICE 'Slots criados com sucesso!';
END $$;

-- =============================================
-- CRIAR ÍNDICE ÚNICO PARA EVITAR DUPLICATAS
-- =============================================

-- Primeiro, remover índice se existir
DROP INDEX IF EXISTS idx_unique_slots_pet;

-- Criar índice único para evitar slots duplicados
CREATE UNIQUE INDEX idx_unique_slots_pet 
ON available_slots_pet (service_id, date, start_time);

-- =============================================
-- VERIFICAR RESULTADOS
-- =============================================

-- Contar total de slots criados
SELECT 
    'Total de slots criados' as info,
    COUNT(*) as quantidade
FROM available_slots_pet 
WHERE date >= CURRENT_DATE;

-- Contar slots por serviço
SELECT 
    s.name as servico,
    COUNT(a.*) as total_slots,
    COUNT(CASE WHEN a.is_available = true THEN 1 END) as slots_disponiveis
FROM services_pet s
LEFT JOIN available_slots_pet a ON s.id = a.service_id 
WHERE s.is_active = true 
  AND (a.date IS NULL OR a.date >= CURRENT_DATE)
GROUP BY s.id, s.name
ORDER BY s.name;

-- Mostrar exemplo de slots para os próximos 7 dias
SELECT 
    s.name as servico,
    a.date as data,
    a.start_time as inicio,
    a.end_time as fim,
    a.is_available as disponivel,
    a.max_appointments as max_agendamentos,
    a.current_appointments as agendamentos_atuais
FROM available_slots_pet a
JOIN services_pet s ON a.service_id = s.id
WHERE a.date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY s.name, a.date, a.start_time
LIMIT 50;

-- =============================================
-- FUNÇÃO PARA MANUTENÇÃO AUTOMÁTICA
-- =============================================

-- Criar função para adicionar slots automaticamente para novos dias
CREATE OR REPLACE FUNCTION add_daily_slots()
RETURNS void AS $$
DECLARE
    service_record RECORD;
    target_date DATE := CURRENT_DATE + INTERVAL '30 days';
    current_hour INTEGER;
    start_time_slot TIME;
    end_time_slot TIME;
BEGIN
    -- Verificar se é domingo
    IF EXTRACT(DOW FROM target_date) != 0 THEN
        
        -- Loop através de todos os serviços ativos
        FOR service_record IN 
            SELECT id FROM services_pet WHERE is_active = true
        LOOP
            
            -- Criar slots das 8h às 17h
            FOR current_hour IN 8..17 LOOP
                start_time_slot := (current_hour || ':00')::TIME;
                end_time_slot := ((current_hour + 1) || ':00')::TIME;
                
                -- Inserir o slot
                INSERT INTO available_slots_pet (
                    service_id,
                    date,
                    start_time,
                    end_time,
                    is_available,
                    max_appointments,
                    current_appointments
                ) 
                SELECT 
                    service_record.id,
                    target_date,
                    start_time_slot,
                    end_time_slot,
                    true,
                    2,
                    0
                WHERE NOT EXISTS (
                    SELECT 1 FROM available_slots_pet 
                    WHERE service_id = service_record.id 
                    AND date = target_date 
                    AND start_time = start_time_slot
                );
                
            END LOOP;
            
        END LOOP;
        
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMENTÁRIOS E INSTRUÇÕES
-- =============================================

/*
INSTRUÇÕES DE USO:

1. Execute este script no SQL Editor do Supabase
2. O script criará slots para todos os serviços ativos
3. Horários: 8h às 18h (slots de 1 hora cada)
4. Período: próximos 30 dias (exceto domingos)
5. Cada slot permite até 2 agendamentos simultâneos

MANUTENÇÃO:
- Execute a função add_daily_slots() diariamente para manter sempre 30 dias de slots
- Ou configure um cron job para executar automaticamente

PERSONALIZAÇÃO:
- Altere o horário modificando o loop FOR current_hour IN 8..17
- Altere max_appointments para permitir mais/menos agendamentos por slot
- Altere o período modificando INTERVAL '30 days'

EXEMPLO DE USO DA FUNÇÃO DE MANUTENÇÃO:
SELECT add_daily_slots();
*/

SELECT 'Script de população de slots executado com sucesso!' as status;