-- Script para corrigir as datas dos registros existentes na tabela weekly_baths
-- Execute este script no SQL Editor do Supabase para atualizar os dados para a semana atual

-- Atualizar todos os registros existentes para a semana atual
UPDATE public.weekly_baths 
SET 
    week_start = (
        -- Calcula a segunda-feira da semana atual
        DATE_TRUNC('week', CURRENT_DATE)::date + INTERVAL '1 day'
    )::date,
    bath_date = (
        -- Atualiza bath_date para estar dentro da semana atual
        CASE 
            WHEN display_order = 1 THEN (DATE_TRUNC('week', CURRENT_DATE)::date + INTERVAL '1 day')::date  -- Segunda
            WHEN display_order = 2 THEN (DATE_TRUNC('week', CURRENT_DATE)::date + INTERVAL '2 days')::date -- Terça
            WHEN display_order = 3 THEN (DATE_TRUNC('week', CURRENT_DATE)::date + INTERVAL '3 days')::date -- Quarta
            WHEN display_order = 4 THEN (DATE_TRUNC('week', CURRENT_DATE)::date + INTERVAL '4 days')::date -- Quinta
            WHEN display_order = 5 THEN (DATE_TRUNC('week', CURRENT_DATE)::date + INTERVAL '5 days')::date -- Sexta
            ELSE (DATE_TRUNC('week', CURRENT_DATE)::date + INTERVAL '1 day')::date -- Default para segunda
        END
    ),
    updated_at = CURRENT_TIMESTAMP
WHERE week_start = '2024-01-15';

-- Verificar os dados atualizados
SELECT 
    pet_name,
    bath_date,
    week_start,
    approved,
    display_order,
    -- Mostrar qual dia da semana é
    TO_CHAR(bath_date, 'Day') as day_of_week
FROM public.weekly_baths 
ORDER BY display_order;

-- Comentário explicativo:
-- Este script atualiza os registros existentes para a semana atual
-- week_start será a segunda-feira desta semana
-- bath_date será distribuído de segunda a sexta conforme display_order
-- Após executar, o carrossel deve funcionar normalmente