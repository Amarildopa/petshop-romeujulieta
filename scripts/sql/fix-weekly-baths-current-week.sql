-- Script para corrigir as datas dos registros para a semana atual
-- Hoje é 15/09/2025 (segunda-feira)
-- IMPORTANTE: Todas as datas devem ser hoje ou anteriores para aparecer no carrossel
-- Execute este script no SQL Editor do Supabase

-- Atualizar todos os registros existentes para a semana atual
UPDATE public.weekly_baths 
SET 
    week_start = (
        -- Calcula a segunda-feira da semana atual (15/09/2025)
        DATE_TRUNC('week', CURRENT_DATE)::date + INTERVAL '1 day'
    )::date,
    bath_date = (
        -- Atualiza bath_date para datas PASSADAS ou HOJE (não futuras!)
        CASE 
            WHEN display_order = 1 THEN (DATE_TRUNC('week', CURRENT_DATE)::date + INTERVAL '1 day')::date  -- Segunda (hoje - 15/09)
            WHEN display_order = 2 THEN (DATE_TRUNC('week', CURRENT_DATE)::date)::date -- Domingo (14/09)
            WHEN display_order = 3 THEN (DATE_TRUNC('week', CURRENT_DATE)::date - INTERVAL '1 day')::date -- Sábado (13/09)
            WHEN display_order = 4 THEN (DATE_TRUNC('week', CURRENT_DATE)::date - INTERVAL '2 days')::date -- Sexta (12/09)
            WHEN display_order = 5 THEN (DATE_TRUNC('week', CURRENT_DATE)::date - INTERVAL '3 days')::date -- Quinta (11/09)
            ELSE (DATE_TRUNC('week', CURRENT_DATE)::date + INTERVAL '1 day')::date -- Default para segunda
        END
    ),
    updated_at = CURRENT_TIMESTAMP
WHERE week_start = '2025-09-16';

-- Verificar os dados atualizados
SELECT 
    pet_name,
    bath_date,
    week_start,
    approved,
    display_order,
    -- Mostrar qual dia da semana é
    TO_CHAR(bath_date, 'Day') as day_of_week,
    -- Verificar se é hoje
    CASE WHEN bath_date = CURRENT_DATE THEN 'HOJE!' 
         WHEN bath_date > CURRENT_DATE THEN 'FUTURO (PROBLEMA!)' 
         ELSE 'PASSADO (OK)' END as date_status
FROM public.weekly_baths 
ORDER BY display_order;

-- Comentário explicativo:
-- Este script atualiza os registros para a semana atual
-- week_start será a segunda-feira desta semana (15/09/2025)
-- bath_date será distribuído com datas passadas e hoje (não futuras!)
-- Luna: Segunda (15/09) - HOJE
-- Max: Domingo (14/09) - ONTEM
-- Bella: Sábado (13/09) - ANTEONTEM
-- Charlie: Sexta (12/09) - 3 dias atrás
-- Milo: Quinta (11/09) - 4 dias atrás
-- Todas as datas são <= hoje, então aparecerão no carrossel