-- Migration: Update business hours
-- Data: 2024-01-XX
-- Descrição: Atualiza o horário de funcionamento da loja para:
-- Segunda a Sexta: 09:00 às 18:00
-- Sábado: 08:00 às 17:00
-- Domingo: fechado

UPDATE system_settings_pet 
SET value = '{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "17:00"}, "sunday": {"closed": true}}'
WHERE key = 'business_hours';

-- Verificar se a atualização foi aplicada corretamente
SELECT key, value, description 
FROM system_settings_pet 
WHERE key = 'business_hours';